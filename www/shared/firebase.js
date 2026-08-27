/**
 * firebase.js — HerboraTech Firebase Foundation
 * ============================================
 * SETUP: Ganti FIREBASE_CONFIG di bawah dengan config dari Firebase Console:
 *   Firebase Console → Project Settings → Your apps → Web app → firebaseConfig
 *
 * Cara pakai di HTML (sebelum </body>):
 *   <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
 *   <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
 *   <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>
 *   <script src="../shared/firebase.js"></script>
 *
 * Setelah itu tersedia global: VAuth, VDB, VFirebase
 */

// ─── FIREBASE CONFIG ───────────────────────────────────────────────────────
if (typeof FIREBASE_CONFIG === 'undefined') {
  window.FIREBASE_CONFIG = {
    apiKey: "AIzaSyCCCB8uqR3vxrynOWyUjzuD27VCUziXkm4",
    authDomain: "herboratech.firebaseapp.com",
    projectId: "herboratech",
    storageBucket: "herboratech.firebasestorage.app",
    messagingSenderId: "577542180601",
    appId: "1:577542180601:web:3d6358a865f64584f21c28"
  };
}

// ─── CLOUD FUNCTIONS CONFIG ────────────────────────────────────────────────
// Auto-detect project ID from FIREBASE_CONFIG
const PROJECT_ID = FIREBASE_CONFIG.projectId || 'vitalora';
const CF_REGION = 'us-central1';
const CF_BASE = `https://${CF_REGION}-${PROJECT_ID}.cloudfunctions.net`;

if (typeof window.CLOUD_FUNCTIONS === 'undefined') {
  window.CLOUD_FUNCTIONS = {
    symptomChecker: `${CF_BASE}/symptomChecker`,
    drugInteractions: `${CF_BASE}/drugInteractions`,
    nutritionAdvisor: `${CF_BASE}/nutritionAdvisor`,
    mentalHealthSupport: `${CF_BASE}/mentalHealthSupport`,
    herbalAdvisor: `${CF_BASE}/herbalAdvisor`,
    healthInsight: `${CF_BASE}/healthInsight`,
    riskAssessment: `${CF_BASE}/riskAssessment`
  };
}

// ─── INIT ───────────────────────────────────────────────────────────────────
if (!firebase.apps || !firebase.apps.length) {
  firebase.initializeApp(FIREBASE_CONFIG);
}
const _auth = firebase.auth();
const _db = firebase.firestore();

// ─── EXPOSED INSTANCES ─────────────────────────────────────────────────────
window.VFirebase = { auth: _auth, db: _db };

// ═══════════════════════════════════════════════════════════════════════════
//  VCache — In-memory cache with 5-minute TTL
// ═══════════════════════════════════════════════════════════════════════════
window.VCache = (() => {
  const _store = {};
  const TTL = 5 * 60 * 1000; // 5 minutes

  return {
    get(key) {
      const item = _store[key];
      if (!item) return null;
      if (Date.now() - item.ts > TTL) {
        delete _store[key];
        return null;
      }
      return item.data;
    },
    set(key, data) {
      _store[key] = { data, ts: Date.now() };
    },
    clear(prefix) {
      Object.keys(_store)
        .filter(k => k.startsWith(prefix))
        .forEach(k => delete _store[k]);
    },
    clearAll() {
      Object.keys(_store).forEach(k => delete _store[k]);
    }
  };
})();

// ═══════════════════════════════════════════════════════════════════════════
//  VAuth — Authentication helpers
// ═══════════════════════════════════════════════════════════════════════════
window.VAuth = {

  async register(name, email, password, role = 'patient') {
    const cred = await _auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName: name });
    await _db.collection('users').doc(cred.user.uid).set({
      uid: cred.user.uid, name, email, role,
      photoURL: null, createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      isActive: true
    });
    if (role === 'patient') {
      await _db.collection('patients').doc(cred.user.uid).set({
        uid: cred.user.uid, dob: null, gender: null, bloodType: null,
        weight: null, height: null, allergies: [], familyHistory: [], assignedDoctors: []
      });
    }
    return cred.user;
  },

  async login(email, password) {
    const cred = await _auth.signInWithEmailAndPassword(email, password);
    const profile = await VAuth.getProfile(cred.user.uid);
    return { user: cred.user, role: profile?.role || 'patient' };
  },

  async loginGoogle(defaultRole = 'patient') {
    const provider = new firebase.auth.GoogleAuthProvider();
    const cred = await _auth.signInWithPopup(provider);
    const exists = await _db.collection('users').doc(cred.user.uid).get();

    if (!exists.exists) {
      return { user: cred.user, role: null, isNewUser: true };
    }

    const profile = exists.data();
    if (profile.roleStatus === 'pending') return { user: cred.user, role: profile.role, roleStatus: 'pending' };
    if (profile.roleStatus === 'rejected') return { user: cred.user, role: profile.role, roleStatus: 'rejected' };

    return { user: cred.user, role: profile.role, roleStatus: 'approved' };
  },

  async logout() {
    localStorage.removeItem('herboratech_debug_role');
    await _auth.signOut();
    window.location.href = window.location.pathname.includes('/admin/') ||
      window.location.pathname.includes('/doctor/') ||
      window.location.pathname.includes('/patient/') ? '../auth/login.html' : 'auth/login.html';
  },

  async resetPassword(email) {
    await _auth.sendPasswordResetEmail(email, {
      url: window.location.origin + '/auth/login.html'
    });
  },

  async resendVerification() {
    const user = _auth.currentUser;
    if (user) await user.sendEmailVerification({ url: window.location.origin + '/auth/login.html' });
  },

  async getProfile(uid) {
    const snap = await _db.collection('users').doc(uid).get();
    return snap.exists ? snap.data() : null;
  },

  redirectByRole(role, depth = 1) {
    const prefix = '../'.repeat(depth);
    const map = {
      patient: 'patient/index.html#home',
      doctor: 'doctor/home.html',
      admin: 'admin/home.html',
      super_admin: 'admin/home.html'
    };
    window.location.href = prefix + (map[role] || 'auth/login.html');
  },

  guard(expectedRole = null, depth = 1) {
    const debugRole = localStorage.getItem('herboratech_debug_role');
    if (debugRole) {
      const nameMap = {
        patient: 'Pasien (Debug)', doctor: 'Dokter (Debug)',
        admin: 'Admin (Debug)', super_admin: 'Super Admin (Debug)'
      };
      return new Promise(async (resolve) => {
        if (!_auth.currentUser) {
          try { await _auth.signInAnonymously(); } catch (e) { }
        }
        const uid = _auth.currentUser ? _auth.currentUser.uid : ('debug-uid-' + debugRole);
        try {
          await _db.collection('users').doc(uid).set(
            { uid, name: nameMap[debugRole] || debugRole, email: debugRole + '@debug.local', role: debugRole, isActive: true },
            { merge: true }
          );
        } catch (e) { }
        const mockUser = { uid, email: debugRole + '@debug.local', emailVerified: true, providerData: [] };
        const mockProfile = { uid, name: nameMap[debugRole] || debugRole, email: mockUser.email, role: debugRole };
        const roleMatch = !expectedRole || expectedRole === debugRole ||
          (expectedRole === 'admin' && debugRole === 'super_admin');
        if (roleMatch) {
          resolve({ user: mockUser, profile: mockProfile });
          return;
        }
        VAuth.redirectByRole(debugRole, depth);
      });
    }
    return new Promise((resolve) => {
      _auth.onAuthStateChanged(async (user) => {
        if (!user) {
          window.location.href = '../'.repeat(depth) + 'auth/login.html';
          return;
        }
        const profile = await VAuth.getProfile(user.uid);
        if (!profile) {
          window.location.href = '../'.repeat(depth) + 'auth/select-role.html';
          return;
        }
        if (profile.roleStatus === 'pending') {
          window.location.href = '../'.repeat(depth) + 'auth/pending-approval.html';
          return;
        }
        if (profile.roleStatus === 'rejected') {
          window.location.href = '../'.repeat(depth) + 'auth/role-rejected.html';
          return;
        }
        const roleMatch = !expectedRole || profile.role === expectedRole ||
          (expectedRole === 'admin' && profile.role === 'super_admin');
        if (!roleMatch) {
          VAuth.redirectByRole(profile.role, depth);
          return;
        }
        resolve({ user, profile });
      });
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
//  VDB — Firestore CRUD helpers
// ═══════════════════════════════════════════════════════════════════════════
window.VDB = {

  async getUser(uid) {
    const s = await _db.collection('users').doc(uid).get();
    return s.exists ? s.data() : null;
  },
  async updateUser(uid, data) {
    await _db.collection('users').doc(uid).update({ ...data, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
  },
  async getAllUsers(role = null) {
    let q = _db.collection('users');
    if (role) q = q.where('role', '==', role);
    const snap = await q.orderBy('createdAt', 'desc').get();
    return snap.docs.map(d => d.data());
  },

  async getPatient(uid) {
    const s = await _db.collection('patients').doc(uid).get();
    return s.exists ? s.data() : null;
  },
  async updatePatient(uid, data) {
    await _db.collection('patients').doc(uid).set(data, { merge: true });
  },

  async saveVitals(patientId, vitalsData) {
    await _db.collection('vitals').doc(patientId).collection('readings').add({
      ...vitalsData,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      source: vitalsData.source || 'device'
    });
  },
  async getVitalsHistory(patientId, limitDays = 7) {
    const cacheKey = `vitals:${patientId}:${limitDays}`;
    const cached = VCache.get(cacheKey);
    if (cached) return cached;

    const since = new Date();
    since.setDate(since.getDate() - limitDays);
    const snap = await _db.collection('vitals').doc(patientId).collection('readings')
      .where('timestamp', '>=', since)
      .orderBy('timestamp', 'asc')
      .get();
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    VCache.set(cacheKey, data);
    return data;
  },

  async createConsultation(data) {
    const ref = await _db.collection('consultations').add({
      ...data,
      status: 'pending',
      startTime: firebase.firestore.FieldValue.serverTimestamp()
    });
    return ref.id;
  },
  async getConsultation(consultId) {
    const s = await _db.collection('consultations').doc(consultId).get();
    return s.exists ? { id: s.id, ...s.data() } : null;
  },
  async updateConsultation(consultId, data) {
    await _db.collection('consultations').doc(consultId).update(data);
  },
  async getPatientConsultations(patientId) {
    const snap = await _db.collection('consultations')
      .where('patientId', '==', patientId)
      .orderBy('startTime', 'desc')
      .limit(20)
      .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async getDoctorConsultations(doctorId, statusFilter = null) {
    let q = _db.collection('consultations').where('doctorId', '==', doctorId);
    if (statusFilter) q = q.where('status', '==', statusFilter);
    const snap = await q.orderBy('startTime', 'desc').limit(30).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  subscribeMessages(consultId, callback) {
    return _db.collection('messages').doc(consultId).collection('items')
      .orderBy('timestamp', 'asc')
      .onSnapshot(snap => {
        const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(msgs);
      });
  },
  async sendMessage(consultId, data) {
    await _db.collection('messages').doc(consultId).collection('items').add({
      ...data,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
  },

  async createMedicalRecord(data) {
    const ref = await _db.collection('medicalRecords').add({
      ...data,
      date: firebase.firestore.FieldValue.serverTimestamp()
    });
    return ref.id;
  },
  async getPatientRecords(patientId) {
    const snap = await _db.collection('medicalRecords')
      .where('patientId', '==', patientId)
      .orderBy('date', 'desc')
      .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async sendNotification(uid, { title, body, type = 'info', data = {} }) {
    await _db.collection('notifications').doc(uid).collection('items').add({
      title, body, type, data, read: false,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
  },
  async sendNotificationToAll(notifData, role = null) {
    const users = await VDB.getAllUsers(role);
    const batch = _db.batch();
    users.forEach(u => {
      const ref = _db.collection('notifications').doc(u.uid).collection('items').doc();
      batch.set(ref, { ...notifData, read: false, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
    });
    await batch.commit();
  },
  subscribeNotifications(uid, callback) {
    return _db.collection('notifications').doc(uid).collection('items')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .onSnapshot(snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  },
  async markNotificationRead(uid, notifId) {
    await _db.collection('notifications').doc(uid).collection('items').doc(notifId).update({ read: true });
  },
  async getUnreadCount(uid) {
    const snap = await _db.collection('notifications').doc(uid).collection('items')
      .where('read', '==', false).get();
    return snap.size;
  },

  async createArticle(data) {
    const ref = await _db.collection('articles').add({
      ...data,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      status: data.status || 'draft'
    });
    return ref.id;
  },
  async updateArticle(articleId, data) {
    await _db.collection('articles').doc(articleId).update({
      ...data,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  },
  async getPublishedArticles(category = null) {
    let q = _db.collection('articles').where('status', '==', 'published');
    if (category) q = q.where('category', '==', category);
    const snap = await q.orderBy('publishedAt', 'desc').limit(20).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async getAllArticles() {
    const snap = await _db.collection('articles').orderBy('createdAt', 'desc').get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async deleteArticle(articleId) {
    await _db.collection('articles').doc(articleId).delete();
  },

  async getStats() {
    const [usersSnap, consultSnap, articlesSnap] = await Promise.all([
      _db.collection('users').get(),
      _db.collection('consultations').where('status', '==', 'completed').get(),
      _db.collection('articles').where('status', '==', 'published').get()
    ]);
    const patients = usersSnap.docs.filter(d => d.data().role === 'patient').length;
    const doctors = usersSnap.docs.filter(d => d.data().role === 'doctor').length;
    return {
      totalUsers: usersSnap.size, patients, doctors,
      completedConsultations: consultSnap.size,
      publishedArticles: articlesSnap.size
    };
  },

  async getHerbals(category = null) {
    let q = _db.collection('herbals').orderBy('name', 'asc');
    const snap = await q.get();
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (category && category !== 'semua') {
      return all.filter(h => h.categories && h.categories.includes(category));
    }
    return all;
  },

  async getHerbal(id) {
    const doc = await _db.collection('herbals').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async getHerbalFormulas(indication = null) {
    const snap = await _db.collection('herbalFormulas').orderBy('name', 'asc').get();
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (indication) {
      return all.filter(f => f.indications && f.indications.includes(indication));
    }
    return all;
  },

  async getHerbalFormula(id) {
    const doc = await _db.collection('herbalFormulas').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async getHerbalFormulasByCondition(condition, limitN = 20, lastDoc = null) {
    let q = _db.collection('herbalFormulas')
      .where('indications', 'array-contains', condition)
      .orderBy('name', 'asc')
      .limit(limitN);
    if (lastDoc) q = q.startAfter(lastDoc);
    const snap = await q.get();
    return {
      formulas: snap.docs.map(d => ({ id: d.id, ...d.data() })),
      lastDoc: snap.docs[snap.docs.length - 1] || null,
      hasMore: snap.docs.length === limitN
    };
  },

  async getHerbalFormulasPage(limitN = 20, lastDoc = null, category = null) {
    let q = _db.collection('herbalFormulas').orderBy('name', 'asc').limit(limitN);
    if (category) q = _db.collection('herbalFormulas')
      .where('category', '==', category)
      .orderBy('name', 'asc')
      .limit(limitN);
    if (lastDoc) q = q.startAfter(lastDoc);
    const snap = await q.get();
    return {
      formulas: snap.docs.map(d => ({ id: d.id, ...d.data() })),
      lastDoc: snap.docs[snap.docs.length - 1] || null,
      hasMore: snap.docs.length === limitN
    };
  },

  async getHerbalsByCategory(category) {
    if (!category || category === 'semua') return VDB.getHerbals();
    const snap = await _db.collection('herbals')
      .where('categories', 'array-contains', category)
      .orderBy('name', 'asc')
      .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async batchSeedHerbals(herbalsArray) {
    const CHUNK = 490;
    let total = 0;
    for (let i = 0; i < herbalsArray.length; i += CHUNK) {
      const batch = _db.batch();
      herbalsArray.slice(i, i + CHUNK).forEach(h => {
        const ref = _db.collection('herbals').doc(h.id || _db.collection('herbals').doc().id);
        batch.set(ref, { ...h, seededAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      });
      await batch.commit();
      total += Math.min(CHUNK, herbalsArray.length - i);
    }
    return total;
  },

  async searchHerbalFormulas(query, limitN = 200) {
    if (!query || !query.trim()) return VDB.getHerbalFormulasPage(limitN);
    const q = query.toLowerCase().trim();
    const snap = await _db.collection('herbalFormulas').limit(limitN).get();
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const matches = all.filter(f =>
      (f.name || '').toLowerCase().includes(q) ||
      (f.condition || '').toLowerCase().includes(q) ||
      (f.indications || []).some(i => i.includes(q)) ||
      (f.tags || []).some(t => t.includes(q)) ||
      (f.ingredients || []).some(ing => (ing.herb || '').toLowerCase().includes(q))
    );
    return { formulas: matches, lastDoc: null, hasMore: false };
  },

  async batchSeedFormulas(formulasArray) {
    const CHUNK = 490;
    let total = 0;
    for (let i = 0; i < formulasArray.length; i += CHUNK) {
      const batch = _db.batch();
      formulasArray.slice(i, i + CHUNK).forEach(f => {
        const ref = _db.collection('herbalFormulas').doc(f.id || _db.collection('herbalFormulas').doc().id);
        batch.set(ref, { ...f, seededAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      });
      await batch.commit();
      total += Math.min(CHUNK, formulasArray.length - i);
    }
    return total;
  },

  // ── SCREENING RESULTS (Batch 17-22) ───────────────────────────────────────
  async saveScreeningResult(userId, disease, resultData) {
    return _db.collection('screeningResults').doc(userId)
      .collection(disease).add({
        ...resultData,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
  },

  async getScreeningHistory(userId, disease, limitN = 20) {
    const cacheKey = `screening:${userId}:${disease}:${limitN}`;
    const cached = VCache.get(cacheKey);
    if (cached) return cached;

    const snap = await _db.collection('screeningResults').doc(userId)
      .collection(disease)
      .orderBy('timestamp', 'desc').limit(limitN).get();
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    VCache.set(cacheKey, data);
    return data;
  },

  // ── HEALTH PROFILE (ML Tasks Batch 1.A) ──────────────────────────────
  async saveHealthProfile(userId, profileData) {
    const bmi = profileData.weightKg && profileData.heightCm
      ? profileData.weightKg / Math.pow(profileData.heightCm / 100, 2)
      : null;
    const completeness = VDB._calcCompleteness(profileData);
    return _db.collection('userHealthProfile').doc(userId).set({
      ...profileData,
      bmi: bmi ? parseFloat(bmi.toFixed(1)) : null,
      profileCompleteness: completeness,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  },

  async getHealthProfile(userId) {
    const cacheKey = `profile:${userId}`;
    const cached = VCache.get(cacheKey);
    if (cached !== null) return cached;

    const doc = await _db.collection('userHealthProfile').doc(userId).get();
    const data = doc.exists ? doc.data() : null;
    VCache.set(cacheKey, data);
    return data;
  },

  async updateHealthSection(userId, sectionData) {
    // Fetch existing profile to calculate completeness accurately
    const doc = await _db.collection('userHealthProfile').doc(userId).get();
    const existingData = doc.exists ? doc.data() : {};
    const mergedData = { ...existingData, ...sectionData };
    const completeness = VDB._calcCompleteness(mergedData);

    return _db.collection('userHealthProfile').doc(userId).set({
      ...sectionData,
      profileCompleteness: completeness,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  },

  async saveLabResults(userId, labData) {
    // Fetch existing profile to calculate completeness accurately
    const doc = await _db.collection('userHealthProfile').doc(userId).get();
    const existingData = doc.exists ? doc.data() : {};
    const mergedData = { ...existingData, labResults: labData };
    const completeness = VDB._calcCompleteness(mergedData);

    return _db.collection('userHealthProfile').doc(userId).set({
      labResults: { ...labData, labDate: firebase.firestore.FieldValue.serverTimestamp() },
      profileCompleteness: completeness,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  },

  async saveRiskScore(userId, scores) {
    return _db.collection('userHealthProfile').doc(userId)
      .collection('riskScores').add({
        ...scores,
        calculatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
  },

  async getLatestRiskScore(userId) {
    const snap = await _db.collection('userHealthProfile').doc(userId)
      .collection('riskScores')
      .orderBy('calculatedAt', 'desc').limit(1).get();
    return snap.empty ? null : snap.docs[0].data();
  },

  async getRiskScoreHistory(userId, limitN = 30) {
    const snap = await _db.collection('userHealthProfile').doc(userId)
      .collection('riskScores')
      .orderBy('calculatedAt', 'desc').limit(limitN).get();
    return snap.docs.map(d => d.data());
  },

  _calcCompleteness(p) {
    const required = ['dateOfBirth', 'gender', 'heightCm', 'weightKg', 'waistCircumferenceCm',
      'smokingStatus', 'exerciseFreqPerWeek', 'sleepHoursPerNight',
      'sugarIntake', 'saltIntake', 'familyHistory', 'knownConditions'];
    const filled = required.filter(k => p[k] !== undefined && p[k] !== null);
    return Math.round((filled.length / required.length) * 100);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
//  VitalsManager — Real-time buffer + 1-minute Firestore upload
// ═══════════════════════════════════════════════════════════════════════════
window.VitalsManager = (() => {
  let _patientId = null;
  let _buffer = {
    hr: '--', spo2: '--', temperature: '--', steps: 0,
    respirationRate: '--', stress: '--', source: 'none'
  };
  let _subscribers = [];
  let _uploadInterval = null;
  let _isStarted = false;

  async function _uploadToFirestore() {
    if (!_patientId || _buffer.source !== 'ble' || _buffer.hr === '--') return;
    try {
      await VDB.saveVitals(_patientId, { ..._buffer });
    } catch (e) {
      console.warn('Vitals upload failed:', e.message);
    }
  }

  return {
    start(patientId) {
      if (_isStarted) return;
      _patientId = patientId;
      _isStarted = true;
      // Upload to Firestore every 60s (only when BLE data exists)
      _uploadInterval = setInterval(_uploadToFirestore, 60000);
    },
    stop() {
      clearInterval(_uploadInterval);
      _isStarted = false;
      _subscribers = [];
    },
    getCurrent() { return { ..._buffer }; },
    subscribe(callback) {
      _subscribers.push(callback);
      callback({ ..._buffer });
      return () => { _subscribers = _subscribers.filter(c => c !== callback); };
    },
    /**
     * Inject BLE data into vitals buffer — satu-satunya sumber data
     */
    injectBLE(bleData) {
      if (!bleData) return;

      // Map BLE field names to buffer field names
      const mapping = {
        hr: 'hr',
        spo2: 'spo2',
        temp: 'temperature',
        temperature: 'temperature',
        rr: 'respirationRate',
        respirationRate: 'respirationRate',
        hrv: 'hrv',
        sdnn: 'sdnn',
        rmssd: 'rmssd',
        pnn50: 'pnn50',
        steps: 'steps',
        battery: 'batteryLevel',
        batteryLevel: 'batteryLevel',
        stress: 'stress',
        movement: 'movement',
        gsr: 'gsr'
      };

      Object.entries(mapping).forEach(([bleKey, bufferKey]) => {
        if (bleKey in bleData && bleData[bleKey] !== undefined) {
          _buffer[bufferKey] = bleData[bleKey];
        }
      });

      _buffer.source = 'ble';
      _buffer.bleTimestamp = bleData.timestamp || new Date().toISOString();

      // Notify subscribers immediately
      _subscribers.forEach(cb => cb({ ..._buffer }));
    },
    async getHistory(patientId, days = 7) {
      return await VDB.getVitalsHistory(patientId, days);
    },
    forceUpload() { return _uploadToFirestore(); }
  };
})();

console.log('[HerboraTech] Firebase initialized. VAuth, VDB, VitalsManager ready.');
