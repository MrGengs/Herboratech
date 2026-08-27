/**
 * chat-manager.js — HerboraTech Real-time Chat via Firestore
 * =========================================================
 * Usage:
 *   const chat = new VChatManager(consultId, currentUser);
 *   chat.onMessages(msgs => renderMessages(msgs));
 *   await chat.send('Halo dok!');
 *   await chat.sendVitalShare(vitalsData);
 *   chat.destroy();
 *
 * Requires: firebase.js loaded first
 */

class VChatManager {
  constructor(consultId, currentUser) {
    this.consultId   = consultId;
    this.currentUser = currentUser; // { uid, name, role }
    this._unsubscribe = null;
    this._db = window.VFirebase?.db;
  }

  // Dengarkan pesan baru (real-time)
  onMessages(callback) {
    if (this._unsubscribe) this._unsubscribe();
    if (!this._db) return;
    this._unsubscribe = this._db
      .collection('messages')
      .doc(this.consultId)
      .collection('items')
      .orderBy('timestamp', 'asc')
      .onSnapshot(snap => {
        const msgs = snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            isMine: data.senderId === this.currentUser.uid,
            // Convert Firestore timestamp to JS Date
            ts: data.timestamp?.toDate ? data.timestamp.toDate() : new Date()
          };
        });
        callback(msgs);
      });
  }

  // Kirim pesan teks
  async send(text) {
    if (!text.trim() || !this._db) return;
    await this._db.collection('messages').doc(this.consultId).collection('items').add({
      senderId:   this.currentUser.uid,
      senderName: this.currentUser.name,
      senderRole: this.currentUser.role,
      text:       text.trim(),
      type:       'text',
      timestamp:  firebase.firestore.FieldValue.serverTimestamp(),
      metadata:   {}
    });
  }

  // Kirim share vital signs
  async sendVitalShare(vitalsData) {
    if (!this._db) return;
    await this._db.collection('messages').doc(this.consultId).collection('items').add({
      senderId:   this.currentUser.uid,
      senderName: this.currentUser.name,
      senderRole: this.currentUser.role,
      text:       '📊 Data Vital Sign dibagikan',
      type:       'vital_share',
      timestamp:  firebase.firestore.FieldValue.serverTimestamp(),
      metadata:   { vitals: vitalsData }
    });
  }

  // Kirim resep (dari dokter)
  async sendPrescription(prescriptionData) {
    if (!this._db) return;
    await this._db.collection('messages').doc(this.consultId).collection('items').add({
      senderId:   this.currentUser.uid,
      senderName: this.currentUser.name,
      senderRole: this.currentUser.role,
      text:       '📋 Resep Digital dikirim',
      type:       'prescription',
      timestamp:  firebase.firestore.FieldValue.serverTimestamp(),
      metadata:   { prescription: prescriptionData }
    });
  }

  // Stop listening
  destroy() {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
  }

  // ── Static helpers ────────────────────────────────────────────────────

  // Render bubble HTML
  static renderBubble(msg) {
    const timeStr = msg.ts instanceof Date
      ? msg.ts.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      : '';

    if (msg.type === 'vital_share') {
      const v = msg.metadata?.vitals || {};
      return `<div class="chat-bubble ${msg.isMine ? 'sent' : 'received'}" style="padding:0;overflow:hidden;max-width:85%;">
        <div style="background:rgba(39,174,96,0.1);border:1px solid rgba(39,174,96,0.3);border-radius:14px;padding:12px 14px;">
          <div style="font-size:0.7rem;font-weight:700;color:#27AE60;margin-bottom:6px;">📊 DATA VITAL SIGN</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:0.72rem;">
            <span>HR: <b>${v.hr || '-'} bpm</b></span>
            <span>SpO2: <b>${v.spo2 || '-'}%</b></span>
            <span>Suhu: <b>${v.temperature || '-'}°C</b></span>
            <span>HRV: <b>${v.hrv || '-'} ms</b></span>
          </div>
          <div style="font-size:0.6rem;color:#8896A6;margin-top:4px;text-align:right;">${timeStr}</div>
        </div>
      </div>`;
    }

    if (msg.type === 'prescription') {
      return `<div class="chat-bubble ${msg.isMine ? 'sent' : 'received'}" style="padding:0;overflow:hidden;max-width:85%;">
        <div style="background:rgba(47,128,237,0.1);border:1px solid rgba(47,128,237,0.3);border-radius:14px;padding:12px 14px;cursor:pointer;">
          <div style="font-size:0.7rem;font-weight:700;color:#2F80ED;margin-bottom:4px;">📋 RESEP DIGITAL</div>
          <div style="font-size:0.78rem;">Lihat resep selengkapnya →</div>
          <div style="font-size:0.6rem;color:#8896A6;margin-top:4px;text-align:right;">${timeStr}</div>
        </div>
      </div>`;
    }

    // Normal text bubble
    return `<div class="chat-bubble ${msg.isMine ? 'sent' : 'received'}">
      <div style="margin-bottom:2px;">${VChatManager._escapeHtml(msg.text)}</div>
      <div style="font-size:0.6rem;opacity:0.6;text-align:right;margin-top:2px;">${timeStr}</div>
    </div>`;
  }

  static _escapeHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // Kelompokkan pesan by date untuk timestamp header
  static groupByDate(msgs) {
    const groups = {};
    msgs.forEach(msg => {
      const key = msg.ts instanceof Date
        ? msg.ts.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'Hari ini';
      if (!groups[key]) groups[key] = [];
      groups[key].push(msg);
    });
    return groups;
  }
}

window.VChatManager = VChatManager;
