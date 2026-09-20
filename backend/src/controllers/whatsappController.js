const axios = require('axios');
const initFirebaseAdmin = require('../firebaseAdmin');

// Environment variables
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || '';
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID || '';
const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'safeweb_verify_token_2026';

// In-memory conversation state keyed by sender phone number
const userSessions = new Map();

// Helper to get Firestore instance
function getDb() {
  const { db } = initFirebaseAdmin();
  return db;
}

/**
 * Send raw message to WhatsApp Graph API
 */
async function sendWhatsAppMessage(payload) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
    console.warn('⚠️ WHATSAPP_TOKEN or WHATSAPP_PHONE_ID is not configured in backend/.env');
    return null;
  }

  try {
    const res = await axios.post(
      `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_ID}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return res.data;
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error?.response?.data || error.message);
    return null;
  }
}

/**
 * Send plain text message
 */
async function sendText(to, text) {
  return sendWhatsAppMessage({
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text }
  });
}

/**
 * Send Interactive Quick Reply Buttons (Max 3 buttons allowed by WhatsApp)
 */
async function sendButtons(to, bodyText, buttons) {
  const formattedButtons = buttons.slice(0, 3).map((b) => ({
    type: 'reply',
    reply: {
      id: b.id,
      title: b.title.slice(0, 20) // WhatsApp limit is 20 chars per button title
    }
  }));

  return sendWhatsAppMessage({
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: bodyText },
      action: { buttons: formattedButtons }
    }
  });
}

/**
 * Send Main Menu
 */
async function sendMainMenu(to, welcomeText = "👮‍♂️ *SafeWeb Cyber Crime Portal*\nHow can I help you today?") {
  return sendButtons(to, welcomeText, [
    { id: 'MENU_COMPLAINT', title: '🛡️ File Complaint' },
    { id: 'MENU_TRACK', title: '🔍 Track Status' },
    { id: 'MENU_HELPLINE', title: '📞 Helpline 1930' }
  ]);
}

/**
 * Date Normalization Helper
 */
function normalizeDate(raw) {
  const v = raw.trim().toLowerCase();
  const now = new Date();
  if (v.includes('today')) return now.toISOString().split('T')[0];
  if (v.includes('yesterday')) {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return y.toISOString().split('T')[0];
  }
  if (v.includes('2 days') || v.includes('2 day')) {
    const d = new Date();
    d.setDate(d.getDate() - 2);
    return d.toISOString().split('T')[0];
  }
  // Try YYYY-MM-DD
  const isoMatch = raw.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    return `${isoMatch[1]}-${String(isoMatch[2]).padStart(2, '0')}-${String(isoMatch[3]).padStart(2, '0')}`;
  }
  // Fallback Date.parse
  const parsed = new Date(raw);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return now.toISOString().split('T')[0];
}

/**
 * Step Question Prompts
 */
async function promptCurrentStep(to, session) {
  const { step } = session;

  switch (step) {
    case 'FULL_NAME':
      return sendText(to, "👮‍♂️ *SafeWeb Complaint Registration*\n\n👤 *Step 1/11:* What is your *Full Name*?");

    case 'CONTACT_NUMBER':
      return sendText(to, `📱 *Step 2/11:* Enter your 10-digit mobile number (or reply *"${to}"* to use your current WhatsApp number):`);

    case 'GENDER':
      return sendButtons(to, "⚧ *Step 3/11:* What is your gender?", [
        { id: 'GENDER_MALE', title: 'Male' },
        { id: 'GENDER_FEMALE', title: 'Female' },
        { id: 'GENDER_OTHER', title: 'Other' }
      ]);

    case 'AGE':
      return sendText(to, "🎂 *Step 4/11:* What is your *Age*? (e.g. 25)");

    case 'INCIDENT_TYPE':
      return sendButtons(to, "🛡️ *Step 5/11:* What type of cyber fraud did you experience?", [
        { id: 'FRAUD_UPI', title: 'UPI / Bank Fraud' },
        { id: 'FRAUD_OTP', title: 'OTP Scam' },
        { id: 'FRAUD_OTHER', title: 'Other Scam' }
      ]);

    case 'INCIDENT_DATE':
      return sendButtons(to, "📅 *Step 6/11:* On which date did the incident happen?", [
        { id: 'DATE_TODAY', title: 'Today' },
        { id: 'DATE_YESTERDAY', title: 'Yesterday' },
        { id: 'DATE_2DAYS', title: '2 Days Ago' }
      ]);

    case 'INCIDENT_TIME':
      return sendText(to, "🕐 *Step 7/11:* At what time did it happen? (e.g. 10:30 AM or 15:00)");

    case 'LOCATION':
      return sendText(to, "📌 *Step 8/11:* In which city / district did this happen? (e.g., Bhubaneswar, Cuttack, Remote):");

    case 'AMOUNT_LOST':
      return sendText(to, "💸 *Step 9/11:* How much money was lost? (Enter amount in ₹, or 0 if no financial loss):");

    case 'BANK_NAME':
      return sendText(to, "🏦 *Step 10/11:* Which bank or payment app was involved? (e.g. SBI, HDFC, PhonePe, Paytm, or say None):");

    case 'TRANSACTION_ID':
      return sendText(to, "🔢 *Step 11/11:* What is the Transaction / Reference ID (UTR / Ref ID)? (or type *None*):");

    case 'KNOWS_SCAMMER':
      return sendButtons(to, "🎯 Do you know any details about the scammer (Phone, UPI ID, Bank Account, or Website link)?", [
        { id: 'SCAMMER_YES', title: 'Yes, I have details' },
        { id: 'SCAMMER_NO', title: 'No, I don\'t know' }
      ]);

    case 'SCAMMER_DETAILS':
      return sendText(to, "🎯 Please enter the scammer's details (Phone number, UPI ID, account number, or website):");

    case 'DESCRIPTION':
      return sendText(to, "📝 Please describe what happened in a few sentences:");

    case 'CONFIRMATION': {
      const d = session.data;
      const summary = [
        `📋 *Complaint Summary Review:*`,
        ``,
        `👤 *Name:* ${d.fullName || 'N/A'}`,
        `📱 *Phone:* ${d.contactNumber || 'N/A'}`,
        `⚧ *Gender:* ${d.gender || 'N/A'} | *Age:* ${d.age || 'N/A'}`,
        `🛡️ *Fraud Type:* ${d.incidentType || 'N/A'}`,
        `📅 *Date:* ${d.incidentDate || 'N/A'} at ${d.incidentTime || 'N/A'}`,
        `📌 *Location:* ${d.location || 'N/A'}`,
        `💸 *Amount Lost:* ₹${Number(d.amountLost || 0).toLocaleString('en-IN')}`,
        `🏦 *Bank/App:* ${d.bankName || 'N/A'}`,
        `🔢 *Txn ID:* ${d.transactionId || 'N/A'}`,
        d.scammerDetails && d.scammerDetails !== 'None' ? `🎯 *Scammer Info:* ${d.scammerDetails}` : null,
        `📝 *Description:* ${d.complaintDescription || 'N/A'}`,
        ``,
        `⚠️ *Is everything correct? Tap below to submit directly to Police & Bank:*`
      ].filter(Boolean).join('\n');

      return sendButtons(to, summary, [
        { id: 'CONFIRM_SUBMIT', title: '✅ Submit Complaint' },
        { id: 'CONFIRM_RESET', title: '🔄 Start Over' },
        { id: 'CONFIRM_CANCEL', title: '❌ Cancel' }
      ]);
    }

    default:
      return sendMainMenu(to);
  }
}

/**
 * Handle Step Input
 */
async function handleStepInput(to, text, buttonId, session) {
  const { step, data } = session;
  const input = (text || '').trim();

  switch (step) {
    case 'FULL_NAME':
      if (input.length < 2) {
        return sendText(to, "⚠️ Please provide a valid full name (at least 2 characters):");
      }
      data.fullName = input;
      session.step = 'CONTACT_NUMBER';
      return promptCurrentStep(to, session);

    case 'CONTACT_NUMBER': {
      const phone = input.replace(/\D/g, '');
      if (phone.length >= 10) {
        data.contactNumber = phone.slice(-10);
      } else {
        data.contactNumber = to.replace(/\D/g, '').slice(-10);
      }
      session.step = 'GENDER';
      return promptCurrentStep(to, session);
    }

    case 'GENDER':
      if (buttonId === 'GENDER_MALE' || input.toLowerCase().includes('male')) data.gender = 'Male';
      else if (buttonId === 'GENDER_FEMALE' || input.toLowerCase().includes('female')) data.gender = 'Female';
      else data.gender = 'Other';
      session.step = 'AGE';
      return promptCurrentStep(to, session);

    case 'AGE': {
      const ageNum = parseInt(input.replace(/\D/g, ''));
      data.age = !isNaN(ageNum) && ageNum > 0 && ageNum < 120 ? String(ageNum) : '25';
      session.step = 'INCIDENT_TYPE';
      return promptCurrentStep(to, session);
    }

    case 'INCIDENT_TYPE':
      if (buttonId === 'FRAUD_UPI' || input.toLowerCase().includes('upi') || input.toLowerCase().includes('bank')) {
        data.incidentType = 'UPI/Bank Fraud';
      } else if (buttonId === 'FRAUD_OTP' || input.toLowerCase().includes('otp')) {
        data.incidentType = 'OTP Fraud';
      } else if (input.toLowerCase().includes('phishing') || input.toLowerCase().includes('link')) {
        data.incidentType = 'Phishing';
      } else if (input.toLowerCase().includes('job')) {
        data.incidentType = 'Job Fraud';
      } else if (input.toLowerCase().includes('investment') || input.toLowerCase().includes('crypto')) {
        data.incidentType = 'Investment Scam';
      } else {
        data.incidentType = input || 'Online Cyber Fraud';
      }
      session.step = 'INCIDENT_DATE';
      return promptCurrentStep(to, session);

    case 'INCIDENT_DATE':
      if (buttonId === 'DATE_TODAY') data.incidentDate = normalizeDate('today');
      else if (buttonId === 'DATE_YESTERDAY') data.incidentDate = normalizeDate('yesterday');
      else if (buttonId === 'DATE_2DAYS') data.incidentDate = normalizeDate('2 days ago');
      else data.incidentDate = normalizeDate(input);
      session.step = 'INCIDENT_TIME';
      return promptCurrentStep(to, session);

    case 'INCIDENT_TIME':
      data.incidentTime = input || '12:00 PM';
      session.step = 'LOCATION';
      return promptCurrentStep(to, session);

    case 'LOCATION':
      data.location = input || 'Odisha (Remote)';
      session.step = 'AMOUNT_LOST';
      return promptCurrentStep(to, session);

    case 'AMOUNT_LOST': {
      const cleanAmt = input.replace(/[^0-9.]/g, '');
      data.amountLost = cleanAmt ? Number(cleanAmt) : 0;
      session.step = 'BANK_NAME';
      return promptCurrentStep(to, session);
    }

    case 'BANK_NAME':
      data.bankName = input.toLowerCase() === 'none' || input.toLowerCase() === 'no' ? '' : input;
      session.step = 'TRANSACTION_ID';
      return promptCurrentStep(to, session);

    case 'TRANSACTION_ID':
      data.transactionId = input.toLowerCase() === 'none' || input.toLowerCase() === 'no' ? '' : input;
      session.step = 'KNOWS_SCAMMER';
      return promptCurrentStep(to, session);

    case 'KNOWS_SCAMMER':
      if (buttonId === 'SCAMMER_NO' || input.toLowerCase().includes('no') || input.toLowerCase().includes('don')) {
        data.scammerDetails = 'None';
        session.step = 'DESCRIPTION';
      } else {
        session.step = 'SCAMMER_DETAILS';
      }
      return promptCurrentStep(to, session);

    case 'SCAMMER_DETAILS':
      data.scammerDetails = input;
      session.step = 'DESCRIPTION';
      return promptCurrentStep(to, session);

    case 'DESCRIPTION':
      data.complaintDescription = input || 'Cyber fraud reported via WhatsApp bot.';
      session.step = 'CONFIRMATION';
      return promptCurrentStep(to, session);

    case 'CONFIRMATION':
      if (buttonId === 'CONFIRM_SUBMIT' || input.toLowerCase().includes('submit') || input.toLowerCase().includes('yes')) {
        return submitComplaintToDb(to, session);
      } else if (buttonId === 'CONFIRM_RESET' || input.toLowerCase().includes('reset') || input.toLowerCase().includes('start over')) {
        userSessions.set(to, { step: 'FULL_NAME', data: {} });
        return promptCurrentStep(to, userSessions.get(to));
      } else {
        userSessions.delete(to);
        return sendMainMenu(to, "Complaint cancelled. How else can I help you?");
      }

    default:
      return sendMainMenu(to);
  }
}

/**
 * Submit Case into Firestore and Notify Police & Bank
 */
async function submitComplaintToDb(to, session) {
  const db = getDb();
  if (!db) {
    await sendText(to, "⚠️ Database is temporarily unavailable. Please try again or visit https://safe-web-pi.vercel.app");
    return;
  }

  try {
    await sendText(to, "⏳ Submitting your complaint to Odisha Cyber Crime Portal... Please wait.");

    const caseId = `CFCF-OD-${Date.now().toString().slice(-6)}`;
    const now = Date.now();
    const d = session.data;

    let scammerUpi = '';
    let scammerPhone = '';
    let scammerAcc = '';
    if (d.scammerDetails && d.scammerDetails !== 'None') {
      const sd = d.scammerDetails.trim();
      if (sd.includes('@')) scammerUpi = sd;
      else if (/^[0-9]{10}$/.test(sd.replace(/\D/g, ''))) scammerPhone = sd.replace(/\D/g, '');
      else if (/^[0-9]{9,18}$/.test(sd.replace(/\D/g, ''))) scammerAcc = sd;
    }

    const incidentDateTime = d.incidentDate && d.incidentTime
      ? new Date(`${d.incidentDate}T12:00:00`).getTime()
      : now;

    // 1. Create Case Document in Firestore
    const caseDoc = {
      caseId,
      ncrpId: null,
      victimUid: `whatsapp_${to}`,
      victimName: d.fullName || 'Citizen',
      victimPhone: d.contactNumber || to,
      victimEmail: '',
      fathersName: '',
      mothersName: '',
      gender: d.gender || 'Other',
      age: d.age || '25',
      permanentAddress: d.location || 'Odisha',
      currentAddress: d.location || 'Odisha',
      occupation: '',
      preferredLanguage: 'English',
      idProofType: 'WhatsApp Verified',
      idProofNumber: '',
      aadhaarCardAttached: false,
      panCardAttached: false,
      fraudType: d.incidentType || 'UPI/Bank Fraud',
      description: d.complaintDescription || '',
      incidentDate: incidentDateTime,
      reportingDate: now,
      location: d.location || 'Odisha',
      amountLost: Number(d.amountLost) || 0,
      transactionId: d.transactionId || '',
      bankName: d.bankName || '',
      walletName: '',
      scammerAccountNumber: scammerAcc,
      scammerIFSC: '',
      scammerUPIId: scammerUpi,
      scammerPhone: scammerPhone,
      scammerDetails: d.scammerDetails || '',
      modeOfFraud: d.incidentType || '',
      devicePlatform: 'WhatsApp',
      transactions: [{
        txnId: d.transactionId || '',
        amount: Number(d.amountLost) || 0,
        toAccount: d.scammerDetails || '',
        time: new Date(incidentDateTime).toISOString()
      }],
      evidence: [],
      termsAccepted: true,
      termsAcceptedAt: now,
      status: 'Pending',
      timeline: [{ status: 'Pending', note: 'Complaint registered via WhatsApp Bot', at: now }],
      tracking: [{
        event: 'Complaint Registered',
        description: 'Citizen filed cyber fraud complaint via WhatsApp Bot',
        timestamp: now,
        by: 'SafeWeb WhatsApp Bot'
      }],
      source: 'whatsapp_bot',
      createdAt: now,
      updatedAt: now
    };

    await db.collection('cases').add(caseDoc);

    // 2. Dispatch notifications to Police and Bank
    try {
      const notifTitle = '🚨 New Complaint via WhatsApp';
      const notifMsg = `New Case ${caseId} filed via WhatsApp. Victim: ${d.fullName}. Amount: ₹${Number(d.amountLost || 0).toLocaleString('en-IN')}`;

      // Notification for Police
      await db.collection('notifications').add({
        recipientRole: 'police',
        recipientId: 'role_police',
        caseId,
        title: notifTitle,
        message: notifMsg,
        link: `/police-dashboard?caseId=${caseId}`,
        type: 'new_complaint',
        read: false,
        readBy: [],
        createdAt: now
      });

      // Notification for Bank
      await db.collection('notifications').add({
        recipientRole: 'bank',
        recipientId: 'role_bank',
        caseId,
        title: notifTitle,
        message: notifMsg,
        link: `/bank-dashboard?caseId=${caseId}`,
        type: 'new_complaint',
        read: false,
        readBy: [],
        createdAt: now
      });
    } catch (notifErr) {
      console.warn('Could not dispatch notifications from WhatsApp controller:', notifErr);
    }

    // 3. Clear Session
    userSessions.delete(to);

    // 4. Send Confirmation back to user on WhatsApp
    const successMsg = [
      `✅ *Complaint Registered Successfully!*`,
      ``,
      `🆔 *Case ID:* \`${caseId}\``,
      `📅 *Date:* ${new Date().toLocaleDateString('en-IN')}`,
      `👮 *Assigned To:* Odisha Cyber Crime Cell & Nodal Bank`,
      ``,
      `🔍 *Track Status:* Reply *TRACK ${caseId}* anytime to see live updates from Police & Bank.`,
      ``,
      `🌐 *Web Portal:* https://safe-web-pi.vercel.app`,
      `📞 *Emergency Helpline:* 1930`
    ].join('\n');

    await sendText(to, successMsg);
    await sendMainMenu(to, "Need any other assistance?");
  } catch (error) {
    console.error('Error creating case from WhatsApp:', error);
    await sendText(to, "❌ Failed to submit complaint due to a server error. Please try again or visit https://safe-web-pi.vercel.app");
  }
}

/**
 * Handle Track Status Command
 */
async function handleTrackStatus(to, inputCaseId) {
  const db = getDb();
  if (!db) {
    return sendText(to, "Database is temporarily unavailable. Please check https://safe-web-pi.vercel.app");
  }

  const cleanId = (inputCaseId || '').trim().toUpperCase();
  if (!cleanId || cleanId.length < 4) {
    return sendText(to, "🔍 Please provide a valid Case ID (e.g., *TRACK CFCF-OD-123456*):");
  }

  try {
    const snapshot = await db.collection('cases').where('caseId', '==', cleanId).limit(1).get();
    if (snapshot.empty) {
      return sendText(to, `❌ No complaint found matching Case ID *${cleanId}*. Please check the ID and try again.`);
    }

    const caseData = snapshot.docs[0].data();
    const statusIcons = {
      'Pending': '⏳ Pending Verification',
      'In Process': '🔄 In Process (Police Investigation)',
      'Funds Frozen': '❄️ Funds Frozen by Bank',
      'Refunded': '💰 Refund Processed',
      'Closed': '✅ Case Closed'
    };

    const statusText = [
      `📋 *Case Status Report:*`,
      ``,
      `🆔 *Case ID:* ${caseData.caseId}`,
      `🛡️ *Fraud Type:* ${caseData.fraudType}`,
      `💸 *Amount:* ₹${Number(caseData.amountLost || 0).toLocaleString('en-IN')}`,
      `📌 *Current Status:* ${statusIcons[caseData.status] || caseData.status}`,
      caseData.firNumber ? `📑 *FIR Number:* ${caseData.firNumber}` : null,
      caseData.bankInvestigationStatus ? `🏦 *Bank Action:* ${caseData.bankInvestigationStatus}` : null,
      ``,
      `🕒 *Last Updated:* ${new Date(caseData.updatedAt || caseData.createdAt).toLocaleString('en-IN')}`,
      ``,
      `🌐 Track on web: https://safe-web-pi.vercel.app/cyberfraud?view=track`
    ].filter(Boolean).join('\n');

    await sendText(to, statusText);
  } catch (err) {
    console.error('Error tracking case on WhatsApp:', err);
    await sendText(to, "❌ Error retrieving case status. Please try again later.");
  }
}

/**
 * Verification Endpoint for Meta Webhook setup
 */
exports.verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
      console.log('✅ Meta Webhook Verified Successfully');
      res.status(200).send(challenge);
    } else {
      console.warn('❌ Meta Webhook verification failed. Tokens do not match.');
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
};

/**
 * Main Webhook logic for incoming messages from Meta
 */
exports.handleMessage = async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const msg = changes?.value?.messages?.[0];

    // Important: Always acknowledge receipt with 200 OK so WhatsApp doesn't retry
    if (!msg) {
      return res.sendStatus(200);
    }

    const from = msg.from; // Sender WhatsApp Phone Number (e.g. "919876543210")
    let userText = '';
    let buttonId = null;

    if (msg.type === 'text') {
      userText = msg.text?.body || '';
    } else if (msg.type === 'interactive') {
      buttonId = msg.interactive?.button_reply?.id;
      userText = msg.interactive?.button_reply?.title || '';
    }

    const lower = userText.trim().toLowerCase();

    // Global Commands
    if (lower === 'hi' || lower === 'hello' || lower === 'menu' || lower === 'start' || lower === 'help') {
      userSessions.delete(from);
      await sendMainMenu(from);
      return res.sendStatus(200);
    }

    if (lower.startsWith('track')) {
      const parts = userText.trim().split(/\s+/);
      const queryId = parts.length > 1 ? parts[1] : '';
      if (queryId) {
        await handleTrackStatus(from, queryId);
      } else {
        userSessions.set(from, { step: 'TRACK_INPUT', data: {} });
        await sendText(from, "🔍 Please reply with your *Case ID* (e.g. CFCF-OD-123456):");
      }
      return res.sendStatus(200);
    }

    // Active session handling
    let session = userSessions.get(from);

    // Menu button triggers
    if (buttonId === 'MENU_COMPLAINT' || lower.includes('file complaint') || lower.includes('report fraud')) {
      session = { step: 'FULL_NAME', data: {} };
      userSessions.set(from, session);
      await promptCurrentStep(from, session);
      return res.sendStatus(200);
    }

    if (buttonId === 'MENU_TRACK' || lower.includes('track status')) {
      userSessions.set(from, { step: 'TRACK_INPUT', data: {} });
      await sendText(from, "🔍 Please enter your *Case ID* (e.g. CFCF-OD-123456) to track status:");
      return res.sendStatus(200);
    }

    if (buttonId === 'MENU_HELPLINE' || lower.includes('helpline')) {
      await sendText(
        from,
        "📞 *National Cybercrime Helpline:* 1930\n🚨 *Emergency Police:* 112\n🌐 *National Cyber Portal:* https://cybercrime.gov.in\n\nStay alert and never share OTPs or bank passwords with anyone."
      );
      await sendMainMenu(from, "How else can I help?");
      return res.sendStatus(200);
    }

    // If waiting for track case ID
    if (session && session.step === 'TRACK_INPUT') {
      userSessions.delete(from);
      await handleTrackStatus(from, userText);
      return res.sendStatus(200);
    }

    // If inside complaint registration flow
    if (session && session.step) {
      await handleStepInput(from, userText, buttonId, session);
      return res.sendStatus(200);
    }

    // Default: Show Menu
    await sendMainMenu(from);
    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.sendStatus(200); // Always respond 200 to WhatsApp
  }
};
