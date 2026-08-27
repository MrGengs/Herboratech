/**
 * @file notification-audio.js
 * @description Provides audio notification system for HerboraTech web pages
 * Features: Multiple audio options, browser compatibility, fallback mechanisms
 * Usage: playNotificationSound('success'), playNotificationSound('warning'), etc.
 */

class HerboraTechNotificationAudio {
  constructor() {
    this.audioContext = null;
    this.sounds = {
      success: { freq: [1200, 1500, 1800], duration: [150, 150, 150] },
      warning: { freq: [800, 1000], duration: [200, 200] },
      error: { freq: [600, 400, 600], duration: [200, 200, 200] },
      info: { freq: [1000], duration: [300] },
      tick: { freq: [1200], duration: [100] },
      complete: { freq: [1200, 1400, 1600], duration: [200, 200, 200] }
    };
    this.enabled = localStorage.getItem('herboratech_notification_sound') !== 'disabled';
  }

  /**
   * Initialize Web Audio API context
   */
  initAudioContext() {
    if (!this.audioContext) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
      } catch (e) {
        console.warn('⚠️ Web Audio API not available:', e);
        return false;
      }
    }
    return true;
  }

  /**
   * Play a beep sequence using Web Audio API
   * @param {string} type - Sound type: success|warning|error|info|tick|complete
   */
  playNotificationSound(type = 'success') {
    if (!this.enabled) return;

    const sound = this.sounds[type];
    if (!sound) {
      console.warn(`⚠️ Unknown sound type: ${type}`);
      return;
    }

    // Try Web Audio first
    if (this.initAudioContext()) {
      this.playWebAudio(sound);
      return;
    }

    // Fallback: Try system sound file
    this.playSystemSound(type);
  }

  /**
   * Generate and play sound using Web Audio API
   * @private
   */
  playWebAudio(sound) {
    try {
      const ctx = this.audioContext;
      const now = ctx.currentTime;

      sound.freq.forEach((freq, i) => {
        const startTime = now + (i === 0 ? 0 : sound.duration.slice(0, i).reduce((a, b) => a + b, 0) / 1000);
        const duration = (sound.duration[i] || 100) / 1000;

        // Create oscillator
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.frequency.value = freq;
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch (e) {
      console.warn('⚠️ Web Audio playback failed:', e);
    }
  }

  /**
   * Fallback: Play system sound file
   * @private
   */
  playSystemSound(type = 'success') {
    const soundMap = {
      success: 'C:\\Windows\\Media\\tada.wav',
      warning: 'C:\\Windows\\Media\\chord.wav',
      error: 'C:\\Windows\\Media\\chime.wav',
      info: 'C:\\Windows\\Media\\notify.wav',
      tick: 'C:\\Windows\\Media\\pop-drip.wav',
      complete: 'C:\\Windows\\Media\\tada.wav'
    };

    const soundPath = soundMap[type];
    if (!soundPath) return;

    // Try to use Audio element as fallback
    try {
      const audio = new Audio(soundPath);
      audio.volume = 0.5;
      audio.play().catch(() => {
        console.warn(`⚠️ Could not play system sound: ${soundPath}`);
      });
    } catch (e) {
      console.warn('⚠️ Audio element fallback failed:', e);
    }
  }

  /**
   * Toggle sound notifications
   */
  toggleNotifications(enabled) {
    this.enabled = enabled;
    localStorage.setItem('herboratech_notification_sound', enabled ? 'enabled' : 'disabled');
    console.log(`📢 Notifications ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Show visual + audio notification together
   */
  notifyComplete(title = 'Selesai!', subtitle = 'Tugas sudah berhasil.') {
    this.playNotificationSound('success');
    showToast(`✅ ${title}: ${subtitle}`, 'success');
  }

  /**
   * Show error notification
   */
  notifyError(title = 'Error', subtitle = 'Terjadi kesalahan.') {
    this.playNotificationSound('error');
    showToast(`❌ ${title}: ${subtitle}`, 'error');
  }

  /**
   * Show warning notification
   */
  notifyWarning(title = 'Peringatan', subtitle = 'Silahkan perhatikan.') {
    this.playNotificationSound('warning');
    showToast(`⚠️ ${title}: ${subtitle}`, 'warning');
  }
}

// Global instance
const herboratechAudio = new HerboraTechNotificationAudio();

/**
 * Simplified API for quick notification
 * Usage: playNotification('success'), playNotification('error'), etc.
 */
function playNotification(type = 'success') {
  herboratechAudio.playNotificationSound(type);
}

/**
 * Notify task completion with sound + toast
 * Usage: notifyCompletion('Profile Saved'), notifyCompletion()
 */
function notifyCompletion(message = 'Selesai!') {
  herboratechAudio.playNotificationSound('complete');
  showToast(`✅ ${message}`, 'success');
}

/**
 * Notify with only sound (no toast)
 * Usage: beep('tick'), beep('success')
 */
function beep(type = 'tick') {
  herboratechAudio.playNotificationSound(type);
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Resume audio context on first user interaction (iOS requirement)
  document.addEventListener('click', () => {
    if (herboratechAudio.audioContext && herboratechAudio.audioContext.state === 'suspended') {
      herboratechAudio.audioContext.resume().then(() => {
        console.log('✅ Web Audio API resumed');
      });
    }
  }, { once: true });

  console.log('✅ HerboraTech Notification Audio System initialized');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HerboraTechNotificationAudio, herboratechAudio, playNotification, notifyCompletion, beep };
}
