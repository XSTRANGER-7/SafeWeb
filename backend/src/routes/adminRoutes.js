// backend/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const verifyAdminKey = require('../middlewares/verifyAdminKey');
const { updateCaseStatus, postFIR, createOfficial } = require('../controllers/adminController');

router.post('/case/status', verifyAdminKey, updateCaseStatus);
router.post('/case/fir', verifyAdminKey, postFIR);
router.post('/create-official', verifyAdminKey, createOfficial);

module.exports = router;
