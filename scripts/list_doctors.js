const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const serviceAccount = require(path.join(ROOT, 'serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function listDoctors() {
  console.log('Fetching doctors from Firestore...');
  const usersSnap = await db.collection('users').where('role', '==', 'doctor').get();
  
  if (usersSnap.empty) {
    console.log('No doctors found.');
    process.exit(0);
  }

  console.log(`Found ${usersSnap.size} doctors:`);
  usersSnap.forEach(doc => {
    const data = doc.data();
    console.log(`- ID: ${doc.id} | Name: ${data.name} | Email: ${data.email}`);
  });
  
  process.exit(0);
}

listDoctors().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
