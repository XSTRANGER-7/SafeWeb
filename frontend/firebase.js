// modular v9+ style
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID || '',
  appId: import.meta.env.VITE_FIREBASE_APPID || '',
}

const requiredEnvVars = ['VITE_FIREBASE_APIKEY', 'VITE_FIREBASE_AUTHDOMAIN', 'VITE_FIREBASE_PROJECTID']
const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName] || import.meta.env[varName].trim() === '')

let app
let auth
let db
let storage
let initError = null

try {
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    const missing = []
    if (!firebaseConfig.apiKey) missing.push('VITE_FIREBASE_APIKEY')
    if (!firebaseConfig.authDomain) missing.push('VITE_FIREBASE_AUTHDOMAIN')
    if (!firebaseConfig.projectId) missing.push('VITE_FIREBASE_PROJECTID')
    
    throw new Error(`Firebase configuration is incomplete. Missing: ${missing.join(', ')}.`)
  }

  // Initialize Firebase
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
  
  if (!auth || !auth.app) {
    throw new Error('Firebase Auth failed to initialize.')
  }
} catch (error) {
  initError = error
  console.error('❌ Firebase initialization error:', error?.message || error)
}

export { auth, db, storage }
export const firebaseStatus = {
  initialized: Boolean(app && auth && db),
  missingVars,
  initErrorMessage: initError?.message || null
}

export function getFirebaseSetupError() {
  if (missingVars.length) {
    return `Missing Firebase environment variables: ${missingVars.join(', ')}`
  }

  if (initError?.message) {
    return initError.message
  }

  if (!auth || !db) {
    return 'Firebase is not initialized. Check frontend .env and Firebase project configuration.'
  }

  return null
}

export default app
