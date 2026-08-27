const admin = require('firebase-admin');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const serviceAccount = require(path.join(ROOT, 'serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function resetConsultations() {
  console.log('Fetching active/pending consultations...');
  const activeStatuses = ['pending', 'active', 'started', 'ongoing'];
  
  let totalReset = 0;
  
  for (const status of activeStatuses) {
    const snap = await db.collection('consultations').where('status', '==', status).get();
    
    if (!snap.empty) {
      console.log(`Resetting ${snap.size} consultations with status: ${status}`);
      const batch = db.batch();
      
      snap.forEach(doc => {
        batch.update(doc.ref, { 
          status: 'cancelled',
          endTime: admin.firestore.FieldValue.serverTimestamp(),
          resetBy: 'system-admin'
        });
        totalReset++;
      });
      
      await batch.commit();
    }
  }

  if (totalReset > 0) {
    console.log(`\nSuccessfully reset ${totalReset} consultations to 'cancelled'.`);
  } else {
    console.log('\nNo active consultations found to reset.');
  }
}

resetConsultations()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
