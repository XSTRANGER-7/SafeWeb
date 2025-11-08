// backend/src/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const { uploadFile } = require('../controllers/uploadController');

router.post('/file', uploadFile);

// Test endpoint - files are stored in Firestore, no storage bucket needed
router.get('/test', async (req, res) => {
  res.json({
    status: 'Upload endpoint working',
    message: 'Files are stored directly in Firestore as base64 strings',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

