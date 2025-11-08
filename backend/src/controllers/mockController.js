// backend/src/controllers/mockController.js
const initFirebaseAdmin = require('../firebaseAdmin');

// small helper to create FieldValue.arrayUnion structure for timeline updates
const adminFieldArrayUnion = (obj) => {
  const admin = require('firebase-admin');
  return admin.firestore.FieldValue.arrayUnion(obj);
};

function generateLocalCaseId() {
  const n = Date.now().toString().slice(-6);
  return `CFCF-OD-${new Date().getFullYear()}-${n}`;
}

async function mockRegisterNCRP(req, res) {
  // register complaint in NCRP mock and return ncrp id
  const payload = req.body || {};
  const ncrpId = `NCRP-${new Date().getFullYear()}-${Math.floor(Math.random()*900000+100000)}`;
  return res.json({ ok: true, ncrpId, received: payload });
}

async function mockFreezeNPCI(req, res) {
  // simulate freeze: expects { caseId, amount }
  const { caseId, amount } = req.body || {};
  const npciRef = `NPCI-${Math.floor(Math.random()*900000+100000)}`;
  // optionally update Firestore case status if exists
  const { db } = initFirebaseAdmin();
  if (caseId && db) {
    try {
      // Query by caseId field since document ID is auto-generated
      const snapshot = await db.collection('cases').where('caseId', '==', caseId).limit(1).get();
      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        await docRef.set({
          status: 'Funds Frozen',
          updatedAt: Date.now(),
          timeline: adminFieldArrayUnion({ status: 'Funds Frozen', note: `NPCI hold ${npciRef}`, at: Date.now() })
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error updating Firestore in mockFreezeNPCI:', error.message);
      // Continue even if Firestore update fails
    }
  }
  return res.json({ ok: true, npciRef, status: 'Funds Frozen', heldAmount: amount || 0 });
}

module.exports = { mockRegisterNCRP, mockFreezeNPCI };
