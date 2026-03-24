const axios = require('axios');

// Fetch from env variables
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || 'YOUR_ACCESS_TOKEN';
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID || 'YOUR_PHONE_NUMBER_ID';
const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'YOUR_WEBHOOK_VERIFY_TOKEN';

// Send Interactive Menu
async function sendMenu(to) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: "👮 OP Safety Assistant\nChoose an option to proceed:" },
          action: {
            buttons: [
              { type: 'reply', reply: { id: 'complaint', title: 'File Complaint' } },
              { type: 'reply', reply: { id: 'status', title: 'Track Status' } },
              { type: 'reply', reply: { id: 'sos', title: 'SOS Emergency' } }
            ]
          }
        }
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error sending WhatsApp message:', error?.response?.data || error.message);
  }
}

// Verification Endpoint for Meta Webhook setup
exports.verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
};

// Main Webhook logic for incoming messages
exports.handleMessage = async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const msg = changes?.value?.messages?.[0];
    
    if (!msg) {
      return res.sendStatus(200); // Important to return 200 so WhatsApp doesn't retry
    }

    const from = msg.from; // Sender phone number

    // If message is an interactive button response
    if (msg.type === 'interactive') {
      const id = msg.interactive?.button_reply?.id;

      if (id === 'complaint') {
        // Send next step (complaint flow)
        await axios.post(`https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`, {
          messaging_product: 'whatsapp', to: from, type: 'text',
          text: { body: "Please reply with your complaint details." },
        }, { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' } });
        return res.sendStatus(200);
      }

      if (id === 'status') {
        // Ask for case ID
        await axios.post(`https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`, {
          messaging_product: 'whatsapp', to: from, type: 'text',
          text: { body: "Please provide your Case ID / Complaint Number to track the status." },
        }, { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' } });
        return res.sendStatus(200);
      }

      if (id === 'sos') {
        // Trigger emergency logic
        await axios.post(`https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`, {
          messaging_product: 'whatsapp', to: from, type: 'text',
          text: { body: "🚨 Emergency SOS Triggered. Help is on the way. You can contact Police on 112 immediately." },
        }, { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' } });
        return res.sendStatus(200);
      }
    } else {
      // Send interactive menu for any text or unknown message
      await sendMenu(from);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500); // Let FB know something failed if it was a deep error
  }
};
