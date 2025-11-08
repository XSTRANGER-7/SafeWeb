// backend/src/routes/mockRoutes.js
const express = require('express');
const router = express.Router();
const { mockRegisterNCRP, mockFreezeNPCI } = require('../controllers/mockController');
const verifyAdminKey = require('../middlewares/verifyAdminKey');

router.post('/ncrp/register', verifyAdminKey, mockRegisterNCRP);
router.post('/npci/freeze', verifyAdminKey, mockFreezeNPCI);

module.exports = router;
