/* ═══════════════════════════════════════════════════
   HERBORATECH — SHARED JAVASCRIPT UTILITIES
   ═══════════════════════════════════════════════════ */

// ── AOS-like Scroll Animation (lightweight) ──
function initScrollAnimations() {
  const els = document.querySelectorAll('[data-animate]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = e.target.dataset.delay || 0;
        setTimeout(() => {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0) translateX(0) scale(1)';
        }, delay);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  els.forEach(el => {
    const anim = el.dataset.animate;
    el.style.transition = `all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${el.dataset.delay || 0}ms`;
    el.style.opacity = '0';
    if (anim === 'up') el.style.transform = 'translateY(30px)';
    else if (anim === 'right') el.style.transform = 'translateX(-30px)';
    else if (anim === 'left') el.style.transform = 'translateX(30px)';
    else if (anim === 'scale') el.style.transform = 'scale(0.9)';
    else el.style.transform = 'translateY(20px)';
    observer.observe(el);
  });
}

// ── Carousel ──
function initCarousels() {
  document.querySelectorAll('.neu-carousel').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const dots = carousel.querySelectorAll('.carousel-dots .dot');
    if (!track) return;
    let current = 0;
    const total = carousel.querySelectorAll('.carousel-slide').length;

    function goTo(idx) {
      current = ((idx % total) + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    // Auto-play
    let timer = setInterval(() => goTo(current + 1), 4500);

    // Touch swipe
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; clearInterval(timer); }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
      timer = setInterval(() => goTo(current + 1), 4500);
    });

    // Dot click
    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));
    goTo(0);
  });
}

// ── SVG Sparkline ──
function sparkline(container, data, color = '#4FD1A0', h = 36) {
  if (!container || !data.length) return;
  const w = container.offsetWidth || 120;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 4) - 2}`).join(' ');
  const uid = 'sp' + Math.random().toString(36).substr(2, 5);

  container.innerHTML = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs><linearGradient id="${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </linearGradient></defs>
    <polygon points="0,${h} ${pts} ${w},${h}" fill="url(#${uid})"/>
    <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

// ── Gauge / Circular Progress ──
function createGauge(container, value, max = 100, color = '#2FA87C') {
  if (!container) return;
  const r = 42;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const arcLen = circ * 0.75;
  const gapLen = circ * 0.25;
  const offset = arcLen * (1 - pct);

  container.innerHTML = `
    <svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="${r}" class="gauge-bg"
        stroke-dasharray="${arcLen} ${gapLen}" transform="rotate(135 50 50)"/>
      <circle cx="50" cy="50" r="${r}" class="gauge-fill" stroke="${color}"
        stroke-dasharray="${arcLen} ${gapLen}" stroke-dashoffset="${offset}"
        transform="rotate(135 50 50)"/>
    </svg>
    <div class="gauge-text">
      <span class="gauge-value">${value}<small style="font-size:0.6em">%</small></span>
      <span class="gauge-label">Risk Score</span>
    </div>`;
}

// ── Bar Chart (simple) ──
function miniBarChart(container, data, labels, color = '#4FD1A0') {
  if (!container) return;
  const max = Math.max(...data);
  const barW = 100 / data.length;
  container.innerHTML = `<div style="display:flex;align-items:flex-end;gap:6px;height:80px;padding-top:8px;">
    ${data.map((v, i) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
      <span style="font-size:0.6rem;color:var(--text-muted);font-weight:600">${v}</span>
      <div style="width:100%;height:${(v/max)*60}px;background:${i === data.length-1 ? 'var(--primary-gradient)' : color};border-radius:6px 6px 2px 2px;opacity:${i === data.length-1 ? 1 : 0.5};transition:height 0.8s ease;box-shadow:var(--shadow-out-sm)"></div>
      <span style="font-size:0.55rem;color:var(--text-muted)">${labels[i]||''}</span>
    </div>`).join('')}
  </div>`;
}

// ── Simulate Live Vitals ──
function simulateVital(id, base, variance, decimals = 0, interval = 2500) {
  const el = document.getElementById(id);
  if (!el) return;
  function update() {
    const v = base + (Math.random() - 0.5) * variance * 2;
    el.textContent = v.toFixed(decimals);
  }
  update();
  setInterval(update, interval);
}

// ── Tab Switching ──
function initTabs(selector) {
  document.querySelectorAll(selector).forEach(tabGroup => {
    const tabs = tabGroup.querySelectorAll('.neu-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.tab;
        if (target) {
          document.querySelectorAll('.tab-panel').forEach(p => {
            p.style.display = p.id === target ? 'block' : 'none';
          });
        }
      });
    });
  });
}

// ── Toast Notification ──
function showToast(msg, type = 'success') {
  const colors = { success: '#2FA87C', error: '#FF6B7A', warning: '#FFB347', info: '#6FA8FF' };
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed;bottom:90px;left:50%;transform:translateX(-50%) translateY(20px);
    background:${colors[type]};color:#fff;padding:12px 28px;border-radius:15px;
    font-size:0.85rem;font-weight:600;z-index:9999;font-family:var(--font);
    box-shadow:0 8px 30px rgba(0,0,0,0.2);opacity:0;
    transition:all 0.4s cubic-bezier(0.25,0.46,0.45,0.94);
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translateX(-50%) translateY(0)'; });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 400);
  }, 2800);
}

// ── Number Counter Animation ──
function animateNumber(el, target, duration = 1200) {
  if (!el) return;
  let start = 0;
  const startTime = performance.now();
  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── Navigate ──
function nav(url) { window.location.href = url; }

// ── Init ──
// Admin mobile sidebar toggle
function initAdminMobileMenu() {
  const sidebar = document.querySelector('.admin-sidebar');
  if (!sidebar) return;

  // Create hamburger button
  const topbar = document.querySelector('.admin-topbar');
  if (topbar && !topbar.querySelector('.admin-menu-toggle')) {
    const btn = document.createElement('button');
    btn.className = 'admin-menu-toggle';
    btn.innerHTML = '<ion-icon name="menu-outline"></ion-icon>';
    btn.onclick = () => toggleAdminSidebar();
    topbar.insertBefore(btn, topbar.firstChild);
  }

  // Create overlay
  if (!document.querySelector('.admin-sidebar-overlay')) {
    const overlay = document.createElement('div');
    overlay.className = 'admin-sidebar-overlay';
    overlay.onclick = () => toggleAdminSidebar(false);
    document.body.appendChild(overlay);
  }
}

function toggleAdminSidebar(forceOpen) {
  const sidebar = document.querySelector('.admin-sidebar');
  const overlay = document.querySelector('.admin-sidebar-overlay');
  if (!sidebar) return;
  const isOpen = typeof forceOpen === 'boolean' ? forceOpen : !sidebar.classList.contains('open');
  sidebar.classList.toggle('open', isOpen);
  if (overlay) overlay.classList.toggle('show', isOpen);
}

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initCarousels();
  initTabs('.neu-tabs');
  initAdminMobileMenu();
});
