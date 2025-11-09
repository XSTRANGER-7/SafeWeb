// backend/src/routes/debugRoutes.js
const express = require('express');
const router = express.Router();
const { logOtp, verifyOtp } = require('../controllers/debugController');

// POST /api/debug/otp
router.post('/otp', logOtp);

// POST /api/debug/verify
router.post('/verify', verifyOtp);

module.exports = router;
