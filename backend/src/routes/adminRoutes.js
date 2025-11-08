// backend/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const verifyAdminKey = require('../middlewares/verifyAdminKey');
const { updateCaseStatus, postFIR } = require('../controllers/adminController');

router.post('/case/status', verifyAdminKey, updateCaseStatus);
router.post('/case/fir', verifyAdminKey, postFIR);

module.exports = router;
