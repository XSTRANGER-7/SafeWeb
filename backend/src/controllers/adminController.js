// backend/src/controllers/adminController.js
const initFirebaseAdmin = require('../firebaseAdmin');
const adminFieldArrayUnion = (obj) => require('firebase-admin').firestore.FieldValue.arrayUnion(obj);

async function updateCaseStatus(req, res) {
  // body: { caseId, status, note }
  const { db } = initFirebaseAdmin();
  if (!db) {
    return res.status(503).json({ error: 'Firebase Admin not initialized. Please check serviceAccountKey.json' });
  }
  const { caseId, status, note } = req.body || {};
  if (!caseId || !status) return res.status(400).json({ error: 'caseId and status required' });
  // Query by caseId field since document ID is auto-generated
  const snapshot = await db.collection('cases').where('caseId', '==', caseId).limit(1).get();
  if (snapshot.empty) return res.status(404).json({ error: 'case not found' });
  const docRef = snapshot.docs[0].ref;
  const currentData = snapshot.docs[0].data();
  const currentTimeline = currentData.timeline || [];
  await docRef.set({
    status,
    updatedAt: Date.now(),
    timeline: adminFieldArrayUnion({ status, note: note || '', at: Date.now() })
  }, { merge: true });
  const updated = await docRef.get();
  return res.json({ ok: true, case: updated.data() });
}

async function postFIR(req, res) {
  // body: { caseId, firNumber, policeStation, remark }
  const { db } = initFirebaseAdmin();
  if (!db) {
    return res.status(503).json({ error: 'Firebase Admin not initialized. Please check serviceAccountKey.json' });
  }
  const { caseId, firNumber, policeStation, remark } = req.body || {};
  if (!caseId || !firNumber) return res.status(400).json({ error: 'caseId and firNumber required' });
  // Query by caseId field since document ID is auto-generated
  const snapshot = await db.collection('cases').where('caseId', '==', caseId).limit(1).get();
  if (snapshot.empty) return res.status(404).json({ error: 'case not found' });
  const docRef = snapshot.docs[0].ref;
  await docRef.set({
    'police.firNumber': firNumber,
    'police.policeStation': policeStation,
    updatedAt: Date.now(),
    timeline: adminFieldArrayUnion({ status: 'FIR Filed', note: `FIR ${firNumber} at ${policeStation}. ${remark || ''}`, at: Date.now() })
  }, { merge: true });
  const updated = await docRef.get();
  return res.json({ ok: true, case: updated.data() });
}

async function createOfficial(req, res) {
  // body: { email, password, name, role, officialId }
  const { admin, db } = initFirebaseAdmin();
  if (!admin || !db) {
    return res.status(503).json({ 
      error: 'Firebase Admin not initialized. Please check serviceAccountKey.json. Error: The service account key may be invalid or expired. Please download a new key from Firebase Console → Project Settings → Service Accounts → Generate New Private Key' 
    });
  }
  
  const { email, password, name, role, officialId } = req.body || {};
  
  // Validate inputs
  if (!email || !password || !name || !role || !officialId) {
    return res.status(400).json({ error: 'All fields are required: email, password, name, role, officialId' });
  }
  
  if (role !== 'police' && role !== 'bank') {
    return res.status(400).json({ error: 'Role must be either "police" or "bank"' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  
  try {
    // Create user using Firebase Admin SDK
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: name,
      emailVerified: false
    });
    
    const userId = userRecord.uid;
    
    // Store official data in Firestore officials collection
    const officialRef = db.collection('officials').doc(userId);
    await officialRef.set({
      email: email,
      name: name,
      role: role,
      officialId: officialId,
      createdAt: new Date().toISOString(),
      createdBy: 'admin'
    });
    
    // Also create user profile in users collection
    const userRef = db.collection('users').doc(userId);
    await userRef.set({
      email: email,
      name: name,
      role: role,
      officialId: officialId,
      createdAt: new Date().toISOString()
    });
    
    return res.json({
      success: true,
      message: `Successfully created ${role} account for ${name}`,
      userId: userId,
      email: email
    });
  } catch (error) {
    console.error('Error creating official:', error);
    
    let errorMessage = 'Failed to create official account';
    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'This email is already registered. Please use a different email.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address format.';
    } else if (error.code === 'auth/invalid-password') {
      errorMessage = 'Password is too weak. Please use a stronger password.';
    } else {
      errorMessage = error.message || errorMessage;
    }
    
    return res.status(400).json({ error: errorMessage });
  }
}

module.exports = { updateCaseStatus, postFIR, createOfficial };
