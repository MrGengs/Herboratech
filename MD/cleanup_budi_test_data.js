const admin = require('firebase-admin');
const serviceAccount = require('./firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();

async function cleanupBudiData() {
  const budiUid = 'lliReocxyqWHPNeD8SwtXiPIMTU2'; // From previous search

  console.log(`🔍 Checking test data for budi (UID: ${budiUid})...\n`);

  try {
    // 1. Check and delete vitals/{uid}/readings
    console.log('📊 Checking vitals data...');
    const vitalsRef = db.collection('vitals').doc(budiUid).collection('readings');
    const vitalsSnapshot = await vitalsRef.get();

    if (vitalsSnapshot.size > 0) {
      console.log(`  Found ${vitalsSnapshot.size} vital readings`);
      console.log('  Deleting vitals...');
      const batch1 = db.batch();
      vitalsSnapshot.docs.forEach(doc => {
        batch1.delete(doc.ref);
      });
      await batch1.commit();
      console.log(`  ✅ Deleted ${vitalsSnapshot.size} vital readings\n`);
    } else {
      console.log('  ℹ️  No vital readings found\n');
    }

    // 2. Check and delete screening results
    console.log('🧪 Checking screening results...');
    const screeningTests = ['dyslipidemia', 'hypertension', 'nafld', 'metabolic_syndrome', 'obesity_insulin'];
    let totalScreeningDeleted = 0;

    for (const test of screeningTests) {
      try {
        const screeningRef = db.collection('screeningResults').doc(budiUid).collection(test);
        const screeningSnapshot = await screeningRef.get();

        if (screeningSnapshot.size > 0) {
          console.log(`  Found ${screeningSnapshot.size} ${test} results`);
          const batch2 = db.batch();
          screeningSnapshot.docs.forEach(doc => {
            batch2.delete(doc.ref);
          });
          await batch2.commit();
          console.log(`    ✅ Deleted ${screeningSnapshot.size} ${test} results`);
          totalScreeningDeleted += screeningSnapshot.size;
        }
      } catch (e) {
        // Collection might not exist
      }
    }

    if (totalScreeningDeleted === 0) {
      console.log('  ℹ️  No screening results found\n');
    } else {
      console.log(`  Total: ${totalScreeningDeleted} screening results deleted\n`);
    }

    // 3. Summary
    const finalVitals = await vitalsRef.get();
    console.log('📍 Verification:');
    console.log(`  Remaining vitals: ${finalVitals.size}`);
    console.log(`  ✨ Cleanup complete! Cards should now show placeholder state.\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupBudiData();
