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

module.exports = { updateCaseStatus, postFIR };
