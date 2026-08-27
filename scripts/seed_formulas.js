#!/usr/bin/env node

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
// Uses GOOGLE_APPLICATION_CREDENTIALS env var or serviceAccountKey.json
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(__dirname, '../serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Service account key not found at:', serviceAccountPath);
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS or place serviceAccountKey.json in project root');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();

async function seedFormulas() {
  try {
    const filePath = path.join(__dirname, '../data/final/formulas_merged.json');

    if (!fs.existsSync(filePath)) {
      console.error('❌ formulas_merged.json not found at:', filePath);
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const formulas = data.formulas || [];

    console.log(`📚 Seeding ${formulas.length} formulas to Firestore...`);

    let successCount = 0;
    let errorCount = 0;
    let batchSize = 0;
    let batch = db.batch();

    for (let i = 0; i < formulas.length; i++) {
      const formula = formulas[i];

      // Use existing ID if available, otherwise create new doc
      const docRef = formula.id ? db.collection('formulas').doc(formula.id) : db.collection('formulas').doc();

      const dataToSeed = {
        ...formula,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        doctorVerified: formula.doctorVerified || false,
        isTopical: formula.isTopical || false
      };

      batch.set(docRef, dataToSeed);
      batchSize++;

      // Commit in batches of 500
      if (batchSize === 500 || i === formulas.length - 1) {
        await batch.commit();
        successCount += batchSize;
        console.log(`✅ Committed ${successCount}/${formulas.length} formulas`);
        batchSize = 0;
        batch = db.batch();
      }
    }

    // Hitung statistik dari data aktual
    const evCount = { A: 0, B: 0, C: 0 };
    const cats = new Set();
    formulas.forEach(f => {
      const ev = f.evidenceLevel || 'C';
      evCount[ev] = (evCount[ev] || 0) + 1;
      (f.indications || f.category ? [f.category].filter(Boolean) : []).forEach(c => cats.add(c));
    });

    console.log(`\n Successfully seeded ${successCount} formulas to Firestore!`);
    console.log(`Statistics:`);
    console.log(`   - Total formulas : ${formulas.length}`);
    console.log(`   - Evidence A     : ${evCount.A}`);
    console.log(`   - Evidence B     : ${evCount.B}`);
    console.log(`   - Evidence C     : ${evCount.C}`);
    console.log(`   - Sumber FOHAI   : ${formulas.filter(f => f.sourceRef && f.sourceRef.sourceType === 'evidence-based').length}`);
    console.log(`   - Sumber OCR     : ${formulas.filter(f => f.sourceRef && f.sourceRef.sourceType === 'book-ocr').length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding formulas:', error);
    process.exit(1);
  }
}

seedFormulas();
