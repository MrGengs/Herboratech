/**
 * @file gemini-key-manager.js
 * @description API Key rotation manager for Gemini API
 * Features: Round-robin rotation, usage tracking, fallback strategy
 */

class GeminiKeyManager {
  constructor() {
    this.keys = [];
    this.currentIndex = 0;
    this.loadKeys();
  }

  /**
   * Load API keys from Firestore
   */
  async loadKeys() {
    try {
      const snap = await VFirebase.db.collection('gemini-api-keys')
        .where('active', '==', true)
        .orderBy('order', 'asc')
        .get();

      this.keys = snap.docs.map(doc => ({
        id: doc.id,
        key: doc.data().key,
        usage: doc.data().usage || 0,
        lastUsed: doc.data().lastUsed,
        limit: doc.data().limit || 10000,
        active: doc.data().active
      }));

      console.log(`✅ Loaded ${this.keys.length} Gemini API keys`);
    } catch (e) {
      console.warn('⚠️ Failed to load API keys:', e);
    }
  }

  /**
   * Get next API key (round-robin with usage awareness)
   */
  getNextKey() {
    if (this.keys.length === 0) {
      console.error('❌ No API keys available');
      return null;
    }

    // Find key with lowest usage below limit
    let bestKey = null;
    let lowestUsage = Infinity;

    for (let i = 0; i < this.keys.length; i++) {
      const key = this.keys[i];
      if (key.usage < key.limit && key.usage < lowestUsage) {
        bestKey = key;
        lowestUsage = key.usage;
      }
    }

    // If all keys exceeded, use round-robin
    if (!bestKey) {
      bestKey = this.keys[this.currentIndex];
      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    }

    console.log(`🔑 Using key ${bestKey.id} (usage: ${bestKey.usage}/${bestKey.limit})`);
    return bestKey.key;
  }

  /**
   * Increment usage for current key
   */
  async recordUsage(keyId) {
    try {
      await VFirebase.db.collection('gemini-api-keys').doc(keyId).update({
        usage: firebase.firestore.FieldValue.increment(1),
        lastUsed: new Date()
      });
    } catch (e) {
      console.warn('⚠️ Failed to record usage:', e);
    }
  }

  /**
   * Reset all keys to 0 usage (admin only, call daily)
   */
  async resetDailyUsage() {
    try {
      const batch = VFirebase.db.batch();
      this.keys.forEach(key => {
        batch.update(VFirebase.db.collection('gemini-api-keys').doc(key.id), {
          usage: 0,
          resetAt: new Date()
        });
      });
      await batch.commit();
      console.log('✅ Daily usage reset for all keys');
    } catch (e) {
      console.warn('⚠️ Failed to reset usage:', e);
    }
  }

  /**
   * Get key statistics
   */
  async getStats() {
    const stats = {
      totalKeys: this.keys.length,
      activeKeys: this.keys.filter(k => k.active).length,
      keys: this.keys.map(k => ({
        id: k.id,
        usage: k.usage,
        limit: k.limit,
        percentage: Math.round((k.usage / k.limit) * 100),
        status: k.usage >= k.limit ? '🔴 FULL' : '🟢 OK'
      }))
    };
    return stats;
  }
}

// Global instance
const geminiKeyManager = new GeminiKeyManager();

// Auto-reset usage at midnight
function scheduleNightlyReset() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const msUntilMidnight = tomorrow - now;
  setTimeout(() => {
    geminiKeyManager.resetDailyUsage();
    scheduleNightlyReset(); // Reschedule for next day
  }, msUntilMidnight);
}

// Start nightly reset
document.addEventListener('DOMContentLoaded', () => {
  if (typeof VFirebase !== 'undefined') {
    scheduleNightlyReset();
  }
});
