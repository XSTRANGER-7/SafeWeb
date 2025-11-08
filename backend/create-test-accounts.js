// Script to create test police and bank accounts
// Run with: node create-test-accounts.js

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

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const auth = admin.auth();

// Test accounts to create
const testAccounts = [
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

async function createTestAccounts() {
  console.log('🚀 Creating test accounts...\n');

  for (const account of testAccounts) {
    try {
      // Create Firebase Auth user
      const userRecord = await auth.createUser({
        email: account.email,
        password: account.password,
        displayName: account.name,
        emailVerified: false
      });

      const userId = userRecord.uid;

      // Store in officials collection
      await db.collection('officials').doc(userId).set({
        email: account.email,
        name: account.name,
        role: account.role,
        officialId: account.officialId,
        createdAt: new Date().toISOString(),
        createdBy: 'test-script'
      });

      // Store in users collection
      await db.collection('users').doc(userId).set({
        email: account.email,
        name: account.name,
        role: account.role,
        officialId: account.officialId,
        createdAt: new Date().toISOString()
      });

      console.log(`✅ Created ${account.role} account:`);
      console.log(`   Email: ${account.email}`);
      console.log(`   Password: ${account.password}`);
      console.log(`   Login URL: http://localhost:5173/login/${account.role}`);
      console.log('');
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`⚠️  Account ${account.email} already exists, skipping...\n`);
      } else {
        console.error(`❌ Error creating ${account.email}:`, error.message);
        console.log('');
      }
    }
  }

  console.log('✨ Done! You can now log in with:');
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

createTestAccounts().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

