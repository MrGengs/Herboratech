/**
 * seed_firestore.js — Seed Herbal Database ke Firestore
 *
 * Cara pakai:
 *   cd HERBORATECH
 *   npm install firebase-admin
 *   node scripts/seed_firestore.js
 *
 * Membutuhkan:
 *   - Service Account key di root folder (auto-detect *adminsdk*.json)
 *   - data/final/herbals_merged.json
 *   - data/final/formulas_merged.json
 */

const admin = require('firebase-admin');
const fs    = require('fs');
const path  = require('path');

const ROOT = path.join(__dirname, '..');

// ── Auto-detect service account key ───────────────────────────────────────
function findServiceAccount() {
  const candidates = fs.readdirSync(ROOT).filter(f =>
    f.endsWith('.json') && (f.includes('adminsdk') || f.includes('service'))
  );
  if (candidates.length === 0) {
    // Check uploads folder
    const uploadsDir = path.join(ROOT, '..', 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const uploadCandidates = fs.readdirSync(uploadsDir).filter(f =>
        f.endsWith('.json') && (f.includes('adminsdk') || f.includes('service'))
      );
      if (uploadCandidates.length > 0) return path.join(uploadsDir, uploadCandidates[0]);
    }
    return null;
  }
  return path.join(ROOT, candidates[0]);
}

const SA_PATH = findServiceAccount();
if (!SA_PATH) {
  console.error('❌ Service Account key tidak ditemukan.');
  console.error('   Letakkan file *adminsdk*.json di folder HERBORATECH/');
  process.exit(1);
}

console.log(`🔑 Service Account: ${path.basename(SA_PATH)}`);

// ── Init Firebase Admin ───────────────────────────────────────────────────
admin.initializeApp({
  credential: admin.credential.cert(require(SA_PATH)),
});
const db = admin.firestore();

// ── Batch writer helper ───────────────────────────────────────────────────
async function seedCollection(collectionName, docs, idField) {
  console.log(`\n📦 Seeding ${docs.length} docs → '${collectionName}'...`);

  const BATCH_SIZE = 490; // Firestore limit = 500
  let total = 0;

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const chunk = docs.slice(i, i + BATCH_SIZE);
    const batch = db.batch();

    for (const doc of chunk) {
      const docId = doc[idField] || `doc_${total + 1}`;
      const ref = db.collection(collectionName).document
        ? db.collection(collectionName).doc(docId)
        : db.collection(collectionName).doc(docId);
      batch.set(ref, doc, { merge: true });
      total++;
    }

    await batch.commit();
    console.log(`  ✓ ${Math.min(total, docs.length)}/${docs.length} committed`);

    // Small delay to avoid rate limits
    if (i + BATCH_SIZE < docs.length) {
      await new Promise(r => setTimeout(r, 300));
    }
  }

  return total;
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n═══════════════════════════════════════════');
  console.log('  HerboraTech — Firestore Seeding');
  console.log('═══════════════════════════════════════════');

  const HERBALS_FILE  = path.join(ROOT, 'data', 'final', 'herbals_merged.json');
  const FORMULAS_FILE = path.join(ROOT, 'data', 'final', 'formulas_merged.json');

  // Load herbals
  if (!fs.existsSync(HERBALS_FILE)) {
    console.error(`❌ ${HERBALS_FILE} tidak ditemukan`);
    process.exit(1);
  }
  const herbalsData = JSON.parse(fs.readFileSync(HERBALS_FILE, 'utf8'));
  const herbals = herbalsData.herbals || herbalsData;

  // Load formulas
  if (!fs.existsSync(FORMULAS_FILE)) {
    console.error(`❌ ${FORMULAS_FILE} tidak ditemukan`);
    process.exit(1);
  }
  const formulasData = JSON.parse(fs.readFileSync(FORMULAS_FILE, 'utf8'));
  const formulas = formulasData.formulas || formulasData;

  console.log(`\n📊 Herbals:  ${herbals.length} docs`);
  console.log(`📊 Formulas: ${formulas.length} docs`);

  // Seed herbals
  const h = await seedCollection('herbals', herbals, 'id');

  // Seed formulas
  const f = await seedCollection('herbalFormulas', formulas, 'id');

  // Cleanup test collection (if exists)
  try {
    await db.collection('_test').doc('connectivity_check').delete();
  } catch (e) { /* ignore */ }

  console.log(`\n${'═'.repeat(45)}`);
  console.log(`  ✅ SEEDING COMPLETE`);
  console.log(`${'═'.repeat(45)}`);
  console.log(`  herbals:         ${h} docs`);
  console.log(`  herbalFormulas:   ${f} docs`);
  console.log(`  Total:            ${h + f} docs`);
  console.log(`${'═'.repeat(45)}`);
  console.log(`\n🌐 Cek di: https://console.firebase.google.com/project/herboratech/firestore`);

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
