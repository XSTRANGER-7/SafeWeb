// Quick script to generate a random ADMIN_API_KEY
// Run with: node generate-admin-key.js

const crypto = require('crypto');

const adminKey = crypto.randomBytes(32).toString('hex');

console.log('\n========================================');
console.log('Generated ADMIN_API_KEY:');
console.log('========================================');
console.log(adminKey);
console.log('========================================\n');
console.log('Add this to your backend/.env file:');
console.log(`ADMIN_API_KEY=${adminKey}\n`);


