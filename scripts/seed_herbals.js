/**
 * seed_herbals.js — Seed merged herbal data to Firestore
 * 
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccount.json node scripts/seed_herbals.js
 * 
 * Or set env var before running.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS 
  || path.join(__dirname, '..', 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`❌ Service account key not found: ${serviceAccountPath}`);
  console.error('   Set GOOGLE_APPLICATION_CREDENTIALS env var or place serviceAccountKey.json in project root');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();

async function seedHerbals() {
  console.log('\n═══════════════════════════════════════');
  console.log('  HerboraTech — Seed Herbals to Firestore');
  console.log('═══════════════════════════════════════\n');

  try {
    // Load merged data
    const dataPath = path.join(__dirname, '..', 'data', 'final', 'herbals_merged.json');
    if (!fs.existsSync(dataPath)) {
      console.error(`❌ File not found: ${dataPath}`);
      process.exit(1);
    }

    const raw = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(raw);

    const herbals = Array.isArray(data) ? data : (data.herbals || data.herbs || []);
    const BATCH_SIZE = 490;

    console.log(`📊 Total herbals to seed: ${herbals.length}`);
    console.log(`📦 Batch size: ${BATCH_SIZE}\n`);

    let seeded = 0;
    const batchCount = Math.ceil(herbals.length / BATCH_SIZE);

    for (let i = 0; i < herbals.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const chunk = herbals.slice(i, i + BATCH_SIZE);
      const batchNum = Math.ceil((i + 1) / BATCH_SIZE);

      chunk.forEach(herb => {
        const docId = herb.id || db.collection('herbals').doc().id;
        const { id: _id, ...data } = herb;
        const ref = db.collection('herbals').doc(docId);
        batch.set(ref, {
          ...data,
          seedAt: admin.firestore.FieldValue.serverTimestamp(),
          seedSource: 'seed_herbals.js'
        }, { merge: true });
      });

      await batch.commit();
      seeded += chunk.length;
      const pct = Math.round((seeded / herbals.length) * 100);
      console.log(`✓ Batch ${batchNum}/${batchCount}: ${chunk.length} herbals (${pct}% total)`);
    }

    console.log(`\n✅ Seeding selesai: ${seeded} herbals → Firestore collection "herbals"\n`);
    process.exit(0);

  } catch (e) {
    console.error(`❌ Error: ${e.message}`);
    console.error(e);
    process.exit(1);
  }
}

seedHerbals();
