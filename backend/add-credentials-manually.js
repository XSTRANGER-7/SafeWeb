// Script to manually add police and bank credentials to Firestore
// This will create Firebase Auth users AND store in Firestore
// Run: node add-credentials-manually.js

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccountPath = path.resolve('./serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: serviceAccountKey.json not found');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const auth = admin.auth();

// Test credentials to create
const testCredentials = [
  {
    email: 'police@test.com',
    password: 'police123',
    name: 'Test Police Officer',
    role: 'police',
    officialId: 'POLICE001'
  },
  {
    email: 'bank@test.com',
    password: 'bank123',
    name: 'Test Bank Official',
    role: 'bank',
    officialId: 'BANK001'
  }
];

async function addCredentials() {
  console.log('🚀 Adding credentials to Firebase Auth and Firestore...\n');

  for (const cred of testCredentials) {
    try {
      let userRecord;
      
      // Check if user exists in Firebase Auth
      try {
        userRecord = await auth.getUserByEmail(cred.email);
        console.log(`⚠️  User ${cred.email} already exists in Firebase Auth`);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          // Create new user
          userRecord = await auth.createUser({
            email: cred.email,
            password: cred.password,
            displayName: cred.name,
            emailVerified: false
          });
          console.log(`✅ Created Firebase Auth user: ${cred.email}`);
        } else {
          throw error;
        }
      }

      const userId = userRecord.uid;

      // Store in officials collection
      await db.collection('officials').doc(userId).set({
        email: cred.email,
        name: cred.name,
        role: cred.role,
        officialId: cred.officialId,
        createdAt: new Date().toISOString(),
        createdBy: 'manual-script'
      }, { merge: true });
      console.log(`✅ Stored in Firestore 'officials' collection`);

      // Store in users collection
      await db.collection('users').doc(userId).set({
        email: cred.email,
        name: cred.name,
        role: cred.role,
        officialId: cred.officialId,
        createdAt: new Date().toISOString()
      }, { merge: true });
      console.log(`✅ Stored in Firestore 'users' collection`);

      console.log(`\n✅ ${cred.role.toUpperCase()} Account Ready:`);
      console.log(`   Email: ${cred.email}`);
      console.log(`   Password: ${cred.password}`);
      console.log(`   Login: http://localhost:5173/login/${cred.role}\n`);
      console.log('─'.repeat(60) + '\n');

    } catch (error) {
      console.error(`❌ Error with ${cred.email}:`, error.message);
      console.log('');
    }
  }

  console.log('✨ Done! Credentials are ready to use.\n');
  process.exit(0);
}

addCredentials().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

