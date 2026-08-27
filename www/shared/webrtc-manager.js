/**
 * webrtc-manager.js — HerboraTech WebRTC via Firestore Signaling
 * =============================================================
 * Arsitektur: 100% Free
 *   STUN: Google STUN (gratis selamanya)
 *   TURN: Open Relay Project (gratis, openrelay.metered.ca)
 *   Signaling: Firebase Firestore (free tier)
 *
 * Usage:
 *   const wm = new VWebRTC();
 *
 *   // Dokter — mulai panggilan:
 *   const callId = await wm.startCall(doctorId, patientId, consultId);
 *
 *   // Pasien — terima panggilan:
 *   await wm.joinCall(callId, localVideoEl, remoteVideoEl);
 *
 *   // Akhiri panggilan:
 *   await wm.endCall();
 *
 * Requires: firebase.js loaded first (window.VFirebase, window.VDB available)
 */

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  {
    urls: [
      'turn:openrelay.metered.ca:80',
      'turn:openrelay.metered.ca:443',
      'turn:openrelay.metered.ca:443?transport=tcp'
    ],
    username: 'openrelayproject',
    credential: 'openrelayproject'
  }
];

class VWebRTCManager {
  constructor() {
    this.pc         = null;   // RTCPeerConnection
    this.localStream  = null;
    this.remoteStream = null;
    this.callId     = null;
    this._unsubscribers = [];
    this.onRemoteStream = null; // callback(stream)
    this.onCallEnded    = null; // callback()
    this.onError        = null; // callback(err)
    this._db = window.VFirebase?.db;
  }

  // ── Setup local media ────────────────────────────────────────────────
  async getLocalStream(video = true, audio = true) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ video, audio });
      return this.localStream;
    } catch (e) {
      // Fallback: audio only
      if (video) {
        this.localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        return this.localStream;
      }
      throw e;
    }
  }

  // ── Create PeerConnection ────────────────────────────────────────────
  _createPC() {
    if (this.pc) { this.pc.close(); }
    this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    this.remoteStream = new MediaStream();

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => this.pc.addTrack(track, this.localStream));
    }
    this.pc.ontrack = e => {
      e.streams[0].getTracks().forEach(track => this.remoteStream.addTrack(track));
      if (this.onRemoteStream) this.onRemoteStream(this.remoteStream);
    };
    this.pc.onconnectionstatechange = () => {
      if (['disconnected','failed','closed'].includes(this.pc.connectionState)) {
        if (this.onCallEnded) this.onCallEnded();
      }
    };
    return this.pc;
  }

  // ── CALLER: Dokter mulai panggilan ───────────────────────────────────
  async startCall(callerId, calleeId, consultId) {
    if (!this._db) throw new Error('Firebase not initialized');
    this._createPC();

    // Buat dokumen call di Firestore
    const callRef = this._db.collection('calls').doc();
    this.callId = callRef.id;

    await callRef.set({
      callerId, calleeId, consultId,
      status: 'pending',
      offer: null, answer: null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Kumpulkan ICE candidates caller
    this.pc.onicecandidate = async e => {
      if (e.candidate) {
        await callRef.collection('callerCandidates').add(e.candidate.toJSON());
      }
    };

    // Buat offer
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    await callRef.update({ offer: { type: offer.type, sdp: offer.sdp }, status: 'ringing' });

    // Dengarkan answer dari callee
    const unsubAnswer = callRef.onSnapshot(async snap => {
      const data = snap.data();
      if (data?.answer && !this.pc.currentRemoteDescription) {
        await this.pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
      if (data?.status === 'ended') {
        if (this.onCallEnded) this.onCallEnded();
      }
    });
    this._unsubscribers.push(unsubAnswer);

    // Dengarkan ICE candidates dari callee
    const unsubCallee = callRef.collection('calleeCandidates').onSnapshot(snap => {
      snap.docChanges().forEach(change => {
        if (change.type === 'added') {
          this.pc.addIceCandidate(new RTCIceCandidate(change.doc.data())).catch(() => {});
        }
      });
    });
    this._unsubscribers.push(unsubCallee);

    return this.callId;
  }

  // ── CALLEE: Pasien join panggilan ────────────────────────────────────
  async joinCall(callId) {
    if (!this._db) throw new Error('Firebase not initialized');
    this.callId = callId;
    const callRef = this._db.collection('calls').doc(callId);
    const callData = (await callRef.get()).data();
    if (!callData) throw new Error('Call not found');

    this._createPC();

    // Kumpulkan ICE candidates callee
    this.pc.onicecandidate = async e => {
      if (e.candidate) {
        await callRef.collection('calleeCandidates').add(e.candidate.toJSON());
      }
    };

    // Set remote description dari offer
    await this.pc.setRemoteDescription(new RTCSessionDescription(callData.offer));

    // Buat answer
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    await callRef.update({ answer: { type: answer.type, sdp: answer.sdp }, status: 'active' });

    // Dengarkan ICE candidates dari caller
    const unsubCaller = callRef.collection('callerCandidates').onSnapshot(snap => {
      snap.docChanges().forEach(change => {
        if (change.type === 'added') {
          this.pc.addIceCandidate(new RTCIceCandidate(change.doc.data())).catch(() => {});
        }
      });
    });
    this._unsubscribers.push(unsubCaller);

    // Dengarkan status call berakhir
    const unsubStatus = callRef.onSnapshot(snap => {
      if (snap.data()?.status === 'ended') {
        if (this.onCallEnded) this.onCallEnded();
      }
    });
    this._unsubscribers.push(unsubStatus);
  }

  // ── Akhiri panggilan ─────────────────────────────────────────────────
  async endCall() {
    if (this.callId && this._db) {
      await this._db.collection('calls').doc(this.callId).update({ status: 'ended' }).catch(() => {});
    }
    this._cleanup();
  }

  _cleanup() {
    this._unsubscribers.forEach(u => u());
    this._unsubscribers = [];
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = null;
    }
    if (this.pc) { this.pc.close(); this.pc = null; }
    this.callId = null;
  }

  // ── Toggle mic / camera ──────────────────────────────────────────────
  toggleMic() {
    if (!this.localStream) return false;
    const track = this.localStream.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; return track.enabled; }
    return false;
  }
  toggleCamera() {
    if (!this.localStream) return false;
    const track = this.localStream.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; return track.enabled; }
    return false;
  }

  // ── Listen untuk panggilan masuk (Pasien) ─────────────────────────────
  static listenForIncomingCall(calleeId, onIncoming) {
    const db = window.VFirebase?.db;
    if (!db) return () => {};
    return db.collection('calls')
      .where('calleeId', '==', calleeId)
      .where('status', '==', 'ringing')
      .onSnapshot(snap => {
        snap.docChanges().forEach(change => {
          if (change.type === 'added') {
            onIncoming({ callId: change.doc.id, ...change.doc.data() });
          }
        });
      });
  }
}

window.VWebRTC = VWebRTCManager;
