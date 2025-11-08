// backend/src/firebaseAdmin.js
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let dbInstance = null;
let bucketInstance = null;
let initialized = false;

function initFirebaseAdmin() {
  if (admin.apps.length === 0) {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || './serviceAccountKey.json';
    const resolvedPath = path.resolve(serviceAccountPath);
    
    // Check if file exists and is valid
    if (!fs.existsSync(resolvedPath)) {
      console.warn(`⚠️  Warning: Firebase service account file not found at ${resolvedPath}`);
      console.warn('⚠️  Backend will run but Firebase Admin features will not work.');
      console.warn('⚠️  To fix: Download serviceAccountKey.json from Firebase Console and place it in the backend folder.');
      return { admin: null, db: null, bucket: null };
    }

    try {
      const fileContent = fs.readFileSync(resolvedPath, 'utf8');
      
      // Check if file is empty
      if (!fileContent.trim()) {
        console.error(`❌ Error: serviceAccountKey.json is empty`);
        console.error('Please download your Firebase service account key from:');
        console.error('Firebase Console → Project Settings → Service Accounts → Generate New Private Key');
        return { admin: null, db: null, bucket: null };
      }

      const serviceAccount = JSON.parse(fileContent);
      
      // Validate required fields
      if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
        console.error('❌ Error: Invalid service account key. Missing required fields.');
        return { admin: null, db: null, bucket: null };
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`
      });

      dbInstance = admin.firestore();
      bucketInstance = admin.storage().bucket();
      initialized = true;
      
      console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error('❌ Error: Invalid JSON in serviceAccountKey.json');
        console.error('Please ensure the file contains valid JSON from Firebase Console.');
      } else if (error.message && (error.message.includes('invalid_grant') || error.message.includes('JWT'))) {
        console.error('❌ Error: Firebase service account key is invalid or expired.');
        console.error('');
        console.error('Possible causes:');
        console.error('  1. Server time is not synced - sync your system time');
        console.error('  2. Service account key has been revoked or expired');
        console.error('');
        console.error('Solution: Download a new service account key:');
        console.error('  1. Go to: https://console.firebase.google.com/project/safeweb-b3ea1/settings/serviceaccounts/adminsdk');
        console.error('  2. Click "Generate new private key"');
        console.error('  3. Replace backend/serviceAccountKey.json with the downloaded file');
        console.error('  4. Restart the backend server');
      } else {
        console.error('❌ Error initializing Firebase Admin:', error.message);
      }
      return { admin: null, db: null, bucket: null };
    }
  } else {
    // Already initialized, get instances
    if (!dbInstance) dbInstance = admin.firestore();
    if (!bucketInstance) bucketInstance = admin.storage().bucket();
  }

  return { admin, db: dbInstance, bucket: bucketInstance };
}

module.exports = initFirebaseAdmin;
