const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');

// GET request for Meta to verify the webhook token
router.get('/webhook', whatsappController.verifyWebhook);

// POST request to handle incoming messages
router.post('/webhook', whatsappController.handleMessage);

module.exports = router;
