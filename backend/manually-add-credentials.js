// Script to manually add police and bank credentials to Firestore
// This creates Firebase Auth users AND stores data in Firestore
// Run with: node manually-add-credentials.js

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccountPath = path.resolve('./serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: serviceAccountKey.json not found in backend folder');
  console.error('Please download it from Firebase Console and place it in the backend folder');
  process.exit(1);
}

try {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  const db = admin.firestore();
  const auth = admin.auth();

  // Credentials to create
  const credentials = [
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

  async function createCredentials() {
    console.log('🚀 Creating credentials in Firebase Auth and Firestore...\n');

    for (const cred of credentials) {
      try {
        // Check if user already exists
        let userRecord;
        try {
          userRecord = await auth.getUserByEmail(cred.email);
          console.log(`⚠️  User ${cred.email} already exists in Firebase Auth, using existing user...`);
        } catch (error) {
          if (error.code === 'auth/user-not-found') {
            // Create new Firebase Auth user
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
        const officialRef = db.collection('officials').doc(userId);
        await officialRef.set({
          email: cred.email,
          name: cred.name,
          role: cred.role,
          officialId: cred.officialId,
          createdAt: new Date().toISOString(),
          createdBy: 'manual-script'
        }, { merge: true });
        console.log(`✅ Stored in Firestore 'officials' collection`);

        // Store in users collection
        const userRef = db.collection('users').doc(userId);
        await userRef.set({
          email: cred.email,
          name: cred.name,
          role: cred.role,
          officialId: cred.officialId,
          createdAt: new Date().toISOString()
        }, { merge: true });
        console.log(`✅ Stored in Firestore 'users' collection`);

        console.log(`\n✅ Successfully created ${cred.role} account:`);
        console.log(`   Email: ${cred.email}`);
        console.log(`   Password: ${cred.password}`);
        console.log(`   User ID: ${userId}`);
        console.log(`   Login URL: http://localhost:5173/login/${cred.role}\n`);
        console.log('─'.repeat(60) + '\n');

      } catch (error) {
        console.error(`❌ Error creating ${cred.email}:`, error.message);
        console.log('');
      }
    }

    console.log('✨ All credentials created!\n');
    console.log('📋 Login Credentials:');
    console.log('');
    console.log('Police Login:');
    console.log('  URL: http://localhost:5173/login/police');
    console.log('  Email: police@test.com');
    console.log('  Password: police123');
    console.log('');
    console.log('Bank Login:');
    console.log('  URL: http://localhost:5173/login/bank');
    console.log('  Email: bank@test.com');
    console.log('  Password: bank123');
    console.log('');

    process.exit(0);
  }

  createCredentials().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

} catch (error) {
  console.error('❌ Error reading serviceAccountKey.json:', error.message);
  process.exit(1);
}

