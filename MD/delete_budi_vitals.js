const admin = require('firebase-admin');
const serviceAccount = require('./firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();
const auth = admin.auth();

async function deleteBudiVitals() {
  try {
    console.log('🔍 Searching for user budi.santoso@herboratech.id...');
    
    // Get user by email
    const userRecord = await auth.getUserByEmail('budi.santoso@herboratech.id');
    const budiUid = userRecord.uid;
    
    console.log('✅ Found user budi with UID:', budiUid);

    // Get all readings
    const vitalsDocRef = db.collection('vitals').doc(budiUid);
    const readingsSnapshot = await vitalsDocRef.collection('readings').get();
    const readingCount = readingsSnapshot.size;
    
    console.log(`📊 Found ${readingCount} vital readings`);

    if (readingCount === 0) {
      console.log('ℹ️  No readings to delete');
      process.exit(0);
    }

    // Delete all readings in batch
    console.log('🗑️  Deleting all readings...');
    const batch = db.batch();
    readingsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`✅ Successfully deleted ${readingCount} readings`);

    // Verify
    const verifySnapshot = await vitalsDocRef.collection('readings').get();
    console.log(`📍 Verification: ${verifySnapshot.size} readings remaining`);
    
    if (verifySnapshot.size === 0) {
      console.log('✨ All clean! Data budi sudah dihapus. Sekarang data akan show -- pada monitoring.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deleteBudiVitals();
