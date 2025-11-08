// CORS setup script for Firebase Storage
// Run: node setup-cors.js (from backend folder)

const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

async function setupCORS() {
  try {
    // Check for service account key
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      console.error('❌ Error: serviceAccountKey.json not found at:', serviceAccountPath);
      console.error('Please download it from Firebase Console and place it in the backend folder.');
      process.exit(1);
    }

    const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
    if (!fileContent.trim()) {
      console.error('❌ Error: serviceAccountKey.json is empty');
      process.exit(1);
    }

    const serviceAccount = JSON.parse(fileContent);
    const storage = new Storage({
      keyFilename: serviceAccountPath,
      projectId: serviceAccount.project_id || 'cyber-fraud-dab6d'
    });

    // Get bucket name
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || 'cyber-fraud-dab6d.firebasestorage.app';
    const bucket = storage.bucket(bucketName);

    console.log(`📦 Configuring CORS for bucket: ${bucketName}`);

    const cors = [
      {
        origin: [
          'http://localhost:5173',
          'http://localhost:3000',
          'http://localhost:5174',
          'http://127.0.0.1:5173',
          'http://127.0.0.1:3000'
        ],
        method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
        responseHeader: [
          'Content-Type',
          'Authorization',
          'Content-Length',
          'User-Agent',
          'x-goog-resumable',
          'x-goog-upload-command',
          'x-goog-upload-header-content-length',
          'x-goog-upload-header-content-type'
        ],
        maxAgeSeconds: 3600
      }
    ];

    await bucket.setCorsConfiguration(cors);
    console.log('✅ CORS configuration updated successfully!');
    console.log('✅ Allowed origins:', cors[0].origin);
    console.log('✅ Allowed methods:', cors[0].method);
    console.log('\n🔄 Please restart your frontend dev server for changes to take effect.');
  } catch (error) {
    console.error('❌ Error setting up CORS:', error.message);
    if (error.message.includes('ENOENT')) {
      console.error('Make sure serviceAccountKey.json exists in the backend folder.');
    } else if (error.message.includes('permission')) {
      console.error('Make sure your service account has Storage Admin permissions.');
    }
    process.exit(1);
  }
}

setupCORS();

