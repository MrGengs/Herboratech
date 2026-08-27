/**
 * HerboraTechRouter — Lightweight SPA Router for Patient Module
 *
 * Keeps BLE connection alive by loading pages dynamically via fetch()
 * instead of full page reloads. Uses hash-based routing (#home, #monitoring?id=123).
 */
const HerboraTechRouter = (() => {
  const _cache = new Map();
  let _currentPage = null;
  let _isNavigating = false;

  // Cleanup tracking
  let _pageIntervals = [];
  let _pageTimeouts = [];
  let _pageVitalsUnsubs = [];
  let _pageBLEUnsubs = [];
  let _pageDocListeners = [];
  let _pageWinListeners = [];

  // Original functions (saved before patching)
  const _origSetInterval = window.setInterval.bind(window);
  const _origClearInterval = window.clearInterval.bind(window);
  const _origSetTimeout = window.setTimeout.bind(window);
  const _origClearTimeout = window.clearTimeout.bind(window);
  const _origDocAddEventListener = document.addEventListener.bind(document);
  const _origDocRemoveEventListener = document.removeEventListener.bind(document);
  const _origWinAddEventListener = window.addEventListener.bind(window);
  const _origWinRemoveEventListener = window.removeEventListener.bind(window);

  // Scripts already loaded in the shell — skip these when parsing pages
  const SHARED_SCRIPT_PATTERNS = [
    'app.js', 'firebase.js', 'ble-manager.js', 'risk-engine.js',
    'chat-manager.js', 'webrtc-manager.js', 'gemini-keys.js',
    'gemini-key-manager.js', 'notification-audio.js',
    'firebase-app-compat.js', 'firebase-auth-compat.js',
    'firebase-firestore-compat.js', 'firebase-storage-compat.js',
    'ionicons'
  ];

  // ─── Hash Parsing ───────────────────────────────────
  function parseHash(hash) {
    const clean = (hash || '').replace(/^#\/?/, '');
    const qIdx = clean.indexOf('?');
    if (qIdx === -1) return { page: clean || 'home', search: '' };
    return { page: clean.substring(0, qIdx), search: clean.substring(qIdx) };
  }

  function isSharedScript(src) {
    if (!src) return false;
    return SHARED_SCRIPT_PATTERNS.some(p => src.includes(p));
  }

  // ─── Cleanup ────────────────────────────────────────
  function cleanup() {
    // 1. Clear page-level intervals and timeouts
    _pageIntervals.forEach(id => _origClearInterval(id));
    _pageTimeouts.forEach(id => _origClearTimeout(id));
    _pageIntervals = [];
    _pageTimeouts = [];

    // 2. Unsubscribe VitalsManager callbacks
    _pageVitalsUnsubs.forEach(fn => { try { fn(); } catch(e) {} });
    _pageVitalsUnsubs = [];

    // 3. Unsubscribe BLE callbacks
    _pageBLEUnsubs.forEach(fn => { try { fn(); } catch(e) {} });
    _pageBLEUnsubs = [];

    // 4. Remove page-level document listeners
    _pageDocListeners.forEach(({ type, fn, opts }) => {
      _origDocRemoveEventListener(type, fn, opts);
    });
    _pageDocListeners = [];

    // 5. Remove page-level window listeners
    _pageWinListeners.forEach(({ type, fn, opts }) => {
      _origWinRemoveEventListener(type, fn, opts);
    });
    _pageWinListeners = [];

    // 6. Explicit cleanup functions
    (window.__spaCleanup || []).forEach(fn => { try { fn(); } catch(e) {} });
    window.__spaCleanup = [];

    // 7. Remove dynamic styles added by pages (not our #page-css)
    document.querySelectorAll('head style:not(#page-css):not(#spa-shell-css)').forEach(el => el.remove());

    // 8. Clear page CSS and content
    document.getElementById('page-css').textContent = '';
  }

  // ─── Patch global functions to track page-level usage ──
  function installPatches() {
    // Track setInterval
    window.setInterval = function(...args) {
      const id = _origSetInterval(...args);
      _pageIntervals.push(id);
      return id;
    };
    window.clearInterval = function(id) {
      _pageIntervals = _pageIntervals.filter(t => t !== id);
      _origClearInterval(id);
    };

    // Track setTimeout
    window.setTimeout = function(...args) {
      const id = _origSetTimeout(...args);
      _pageTimeouts.push(id);
      return id;
    };
    window.clearTimeout = function(id) {
      _pageTimeouts = _pageTimeouts.filter(t => t !== id);
      _origClearTimeout(id);
    };

    // Track document.addEventListener (+ DOMContentLoaded interception)
    document.addEventListener = function(type, fn, opts) {
      if (type === 'DOMContentLoaded') {
        _origSetTimeout(fn, 0);
        return;
      }
      _pageDocListeners.push({ type, fn, opts });
      _origDocAddEventListener(type, fn, opts);
    };

    // Track window.addEventListener (except hashchange which is the router's)
    window.addEventListener = function(type, fn, opts) {
      if (type === 'hashchange') {
        // Don't track the router's own listener
        _origWinAddEventListener(type, fn, opts);
        return;
      }
      _pageWinListeners.push({ type, fn, opts });
      _origWinAddEventListener(type, fn, opts);
    };
    window.removeEventListener = function(type, fn, opts) {
      _pageWinListeners = _pageWinListeners.filter(
        l => !(l.type === type && l.fn === fn)
      );
      _origWinRemoveEventListener(type, fn, opts);
    };

    // Track VitalsManager.subscribe
    if (window.VitalsManager && VitalsManager.subscribe) {
      const _origSubscribe = VitalsManager.subscribe.bind(VitalsManager);
      VitalsManager.subscribe = function(cb) {
        const unsub = _origSubscribe(cb);
        _pageVitalsUnsubs.push(unsub);
        return unsub;
      };
    }

    // Track BLEManager.onData
    if (window.BLEManager && BLEManager.onData) {
      const _origOnData = BLEManager.onData.bind(BLEManager);
      BLEManager.onData = function(cb) {
        const unsub = _origOnData(cb);
        _pageBLEUnsubs.push(unsub);
        return unsub;
      };
    }

    // Cache VAuth.guard to return stored auth
    if (window.VAuth && VAuth.guard) {
      VAuth.guard = function() {
        return Promise.resolve(window.__spaAuth);
      };
    }

    // Override nav() for SPA routing
    window.nav = function(url) {
      if (!url) return;
      // Cross-directory or external: real navigation
      if (url.startsWith('../') || url.startsWith('http') || url.startsWith('/') ||
          /^(tel:|mailto:|javascript:)/.test(url)) {
        window.location.href = url;
        return;
      }
      // Patient-local: use hash routing
      const [file, query] = url.split('?');
      const page = file.replace('.html', '');
      window.location.hash = '#' + page + (query ? '?' + query : '');
    };

    // Intercept <a href> clicks within #app
    document.getElementById('app').addEventListener('click', (e) => {
      const anchor = e.target.closest('a[href]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;

      // Skip external, anchor, cross-directory, protocol links
      if (href.startsWith('#') || href.startsWith('http') || href.startsWith('../') ||
          href.startsWith('/') || href.startsWith('tel:') || href.startsWith('mailto:') ||
          href.startsWith('javascript:')) return;

      // Intercept patient-local HTML links
      if (href.endsWith('.html') || href.includes('.html?') || href.includes('.html#')) {
        e.preventDefault();
        nav(href);
      }
    });
  }

  // ─── Page Loading ───────────────────────────────────
  async function loadPage(page, search) {
    if (_isNavigating) return;
    _isNavigating = true;

    try {
      // Cleanup previous page
      cleanup();

      _currentPage = page;

      // Set SPA search params for URLSearchParams patching
      window.__spaSearchString = search || '';

      // Show loading state
      const appEl = document.getElementById('app');
      if (!_cache.has(page)) {
        appEl.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:80vh;"><div class="neu-card" style="text-align:center;padding:40px;"><ion-icon name="hourglass-outline" style="font-size:2rem;color:var(--primary);margin-bottom:12px;display:block;"></ion-icon><div style="color:var(--text-secondary);font-size:0.85rem;">Memuat...</div></div></div>';
      }

      // Fetch HTML (with cache)
      let html = _cache.get(page);
      if (!html) {
        const resp = await fetch(page + '.html');
        if (!resp.ok) {
          appEl.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:80vh;"><div class="neu-card" style="text-align:center;padding:40px;"><ion-icon name="alert-circle-outline" style="font-size:2rem;color:var(--danger);margin-bottom:12px;display:block;"></ion-icon><div style="font-weight:600;color:var(--text-primary);">Halaman tidak ditemukan</div><div style="color:var(--text-secondary);font-size:0.8rem;margin-top:8px;">' + page + '.html</div><button class="neu-btn neu-btn-primary" style="margin-top:16px;" onclick="nav(\'home.html\')">Kembali</button></div></div>';
          return;
        }
        html = await resp.text();
        _cache.set(page, html);
      }

      // Parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Extract page-specific CSS from <head> <style> tags
      const styles = [...doc.querySelectorAll('head style')];
      let css = styles.map(s => s.textContent).join('\n');

      // Extract content
      const mobileFrame = doc.querySelector('.mobile-frame');
      if (mobileFrame) {
        appEl.classList.remove('spa-fullscreen');
        appEl.innerHTML = mobileFrame.outerHTML;
      } else {
        // Fullscreen page (video-call, onboarding, etc.)
        appEl.classList.add('spa-fullscreen');
        // Rewrite body selectors to target #app.spa-fullscreen
        css = css.replace(/\bbody\s*\{/g, '#app.spa-fullscreen {');
        // Get body content minus script tags
        const bodyHTML = doc.body.innerHTML.replace(/<script[\s\S]*?<\/script>/gi, '');
        appEl.innerHTML = bodyHTML;
      }

      // Inject page CSS
      document.getElementById('page-css').textContent = css;

      // Update document title
      const titleEl = doc.querySelector('title');
      if (titleEl) document.title = titleEl.textContent;

      // Scroll to top
      appEl.scrollTop = 0;
      const mf = appEl.querySelector('.mobile-frame');
      if (mf) mf.scrollTop = 0;

      // Re-init shared UI utilities
      if (typeof initScrollAnimations === 'function') initScrollAnimations();
      if (typeof initCarousels === 'function') initCarousels();
      if (typeof initTabs === 'function') initTabs('.neu-tabs');

      // Execute inline scripts from the page
      const allScripts = [...doc.querySelectorAll('script')];
      for (const script of allScripts) {
        const src = script.getAttribute('src');

        // Skip shared external scripts (already loaded in shell)
        if (src && isSharedScript(src)) continue;

        // Non-shared external script: load if not already present
        if (src) {
          await loadExternalScript(src);
          continue;
        }

        // Inline script: execute it
        let text = script.textContent;
        if (!text.trim()) continue;

        // Patch location.search to use SPA params
        text = text.replace(
          /location\.search/g,
          "(window.__spaSearchString || location.search)"
        );

        const el = document.createElement('script');
        el.textContent = text;
        appEl.appendChild(el);
      }

    } catch (err) {
      console.error('[SPA Router] Error loading page:', page, err);
      const appEl = document.getElementById('app');
      appEl.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:80vh;"><div class="neu-card" style="text-align:center;padding:40px;"><ion-icon name="warning-outline" style="font-size:2rem;color:var(--warning);margin-bottom:12px;display:block;"></ion-icon><div style="font-weight:600;">Terjadi Kesalahan</div><div style="color:var(--text-secondary);font-size:0.8rem;margin-top:8px;">' + (err.message || '') + '</div><button class="neu-btn neu-btn-primary" style="margin-top:16px;" onclick="nav(\'home.html\')">Kembali</button></div></div>';
    } finally {
      _isNavigating = false;
    }
  }

  // Load non-shared external script if not already loaded
  const _loadedScripts = new Set();
  function loadExternalScript(src) {
    if (_loadedScripts.has(src)) return Promise.resolve();
    // Normalize relative paths
    const fullSrc = src.startsWith('http') ? src : new URL(src, window.location.href).href;
    if (_loadedScripts.has(fullSrc)) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const el = document.createElement('script');
      el.src = src;
      el.onload = () => { _loadedScripts.add(src); _loadedScripts.add(fullSrc); resolve(); };
      el.onerror = () => { console.warn('[SPA Router] Failed to load script:', src); resolve(); };
      document.body.appendChild(el);
    });
  }

  // ─── Public API ─────────────────────────────────────
  function init() {
    installPatches();

    // Listen for hash changes
    _origWinAddEventListener('hashchange', () => {
      const { page, search } = parseHash(location.hash);
      loadPage(page, search);
    });

    // Initial load
    const { page, search } = parseHash(location.hash);
    if (!location.hash || location.hash === '#') {
      location.hash = '#home';
    } else {
      loadPage(page, search);
    }
  }

  function navigate(page, params) {
    const search = params ? '?' + new URLSearchParams(params).toString() : '';
    window.location.hash = '#' + page + search;
  }

  function getCurrentPage() {
    return _currentPage;
  }

  return { init, navigate, getCurrentPage };
})();

window.HerboraTechRouter = HerboraTechRouter;
