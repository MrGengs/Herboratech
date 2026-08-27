const admin = require('firebase-admin');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const serviceAccount = require(path.join(ROOT, 'serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// IDs to KEEP
const keepIds = [
  'doctor-sarah-wijaya',
  'doctor-andi-rahmanto'
];

async function cleanupDoctors() {
  console.log('Fetching doctors from Firestore...');
  const usersSnap = await db.collection('users').where('role', '==', 'doctor').get();
  
  if (usersSnap.empty) {
    console.log('No doctors found.');
    return;
  }

  let deletedCount = 0;
  const batch = db.batch();

  usersSnap.forEach(doc => {
    if (!keepIds.includes(doc.id)) {
      console.log(`🗑️ Deleting doctor: ${doc.id} (${doc.data().name})`);
      batch.delete(doc.ref);
      deletedCount++;
    } else {
      console.log(`✅ Keeping doctor: ${doc.id} (${doc.data().name})`);
    }
  });

  if (deletedCount > 0) {
    await batch.commit();
    console.log(`\nSuccessfully deleted ${deletedCount} doctors.`);
  } else {
    console.log('\nNo doctors to delete.');
  }
}

cleanupDoctors()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
