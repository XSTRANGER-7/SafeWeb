import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../../firebase'

export async function getUserRoleProfile(uid) {
  const userRef = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    const data = userSnap.data()
    return {
      role: data?.role || null,
      source: 'users',
      data
    }
  }

  const officialRef = doc(db, 'officials', uid)
  const officialSnap = await getDoc(officialRef)

  if (officialSnap.exists()) {
    const data = officialSnap.data()
    return {
      role: data?.role || null,
      source: 'officials',
      data
    }
  }

  return {
    role: null,
    source: null,
    data: null
  }
}

export async function upsertUserProfile(uid, payload) {
  const ref = doc(db, 'users', uid)
  await setDoc(ref, payload, { merge: true })
}