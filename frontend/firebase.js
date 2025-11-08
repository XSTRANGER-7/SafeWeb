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

// Validate Firebase config
const requiredEnvVars = ['VITE_FIREBASE_APIKEY', 'VITE_FIREBASE_AUTHDOMAIN', 'VITE_FIREBASE_PROJECTID']
const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName] || import.meta.env[varName].trim() === '')

if (missingVars.length > 0) {
  console.error('❌ Missing Firebase environment variables:', missingVars)
  console.error('Please create a .env file in the frontend directory with your Firebase configuration.')
  console.error('Example .env file:')
  console.error('VITE_FIREBASE_APIKEY=your_api_key')
  console.error('VITE_FIREBASE_AUTHDOMAIN=your_auth_domain')
  console.error('VITE_FIREBASE_PROJECTID=your_project_id')
  console.error('VITE_FIREBASE_STORAGEBUCKET=your_storage_bucket')
  console.error('VITE_FIREBASE_MESSAGINGSENDERID=your_sender_id')
  console.error('VITE_FIREBASE_APPID=your_app_id')
}

let app
let auth
let db
let storage

try {
  // Debug: Log environment variables (without exposing values)
  console.log('🔍 Checking Firebase environment variables...')
  const envCheck = {
    hasApiKey: !!import.meta.env.VITE_FIREBASE_APIKEY,
    hasAuthDomain: !!import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
    hasProjectId: !!import.meta.env.VITE_FIREBASE_PROJECTID,
    hasStorageBucket: !!import.meta.env.VITE_FIREBASE_STORAGEBUCKET,
    hasMessagingSenderId: !!import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID,
    hasAppId: !!import.meta.env.VITE_FIREBASE_APPID,
  }
  console.log('Environment variables check:', envCheck)

  // Check if config has required values
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    const missing = []
    if (!firebaseConfig.apiKey) missing.push('VITE_FIREBASE_APIKEY')
    if (!firebaseConfig.authDomain) missing.push('VITE_FIREBASE_AUTHDOMAIN')
    if (!firebaseConfig.projectId) missing.push('VITE_FIREBASE_PROJECTID')
    
    console.error('❌ Missing required Firebase config values:', missing)
    console.error('Current config values:', {
      apiKey: firebaseConfig.apiKey ? '***' + firebaseConfig.apiKey.slice(-4) : 'MISSING',
      authDomain: firebaseConfig.authDomain || 'MISSING',
      projectId: firebaseConfig.projectId || 'MISSING',
    })
    throw new Error(`Firebase configuration is incomplete. Missing: ${missing.join(', ')}. Please check your .env file in the frontend directory.`)
  }

  // Initialize Firebase
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
  
  // Verify auth is properly initialized
  if (!auth) {
    throw new Error('Firebase Auth object is null')
  }
  
  if (!auth.app) {
    throw new Error('Firebase Auth app reference is missing')
  }

  // Ensure auth.settings is initialized and accessible
  // auth.settings should be available immediately after getAuth()
  // Force initialization by accessing it
  try {
    if (auth.settings) {
      // Force access to ensure it's fully initialized
      const _ = auth.settings.appVerificationDisabledForTesting
      console.log('✅ Auth.settings is available and accessible')
    } else {
      console.warn('⚠️ Firebase Auth settings not immediately available.')
      console.warn('This might indicate a configuration issue.')
    }
  } catch (e) {
    console.error('❌ Error accessing auth.settings:', e)
    console.error('This will cause issues with Phone Authentication')
  }
  
  // Ensure settings object is properly initialized by accessing it multiple times
  // This helps with timing issues
  if (auth.settings) {
    try {
      // Access properties to ensure they're ready
      const test1 = auth.settings.appVerificationDisabledForTesting
      const test2 = auth.settings.appVerificationDisabledForTesting
      // Force property enumeration
      if (typeof auth.settings === 'object') {
        Object.keys(auth.settings)
      }
    } catch (e) {
      console.warn('Warning: Could not fully initialize auth.settings:', e)
    }
  }

  console.log('✅ Firebase initialized successfully')
  console.log('✅ Auth object:', auth ? 'Available' : 'Missing')
  console.log('✅ Auth.app:', auth?.app ? 'Available' : 'Missing')
  console.log('✅ Auth.settings:', auth?.settings ? 'Available' : '⚠️ NOT AVAILABLE - Phone auth will fail')
  
  // Log config values (partially masked) for debugging
  if (firebaseConfig.apiKey) {
    console.log('✅ Config loaded - API Key:', firebaseConfig.apiKey.substring(0, 10) + '...')
    console.log('✅ Config loaded - Auth Domain:', firebaseConfig.authDomain)
    console.log('✅ Config loaded - Project ID:', firebaseConfig.projectId)
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error)
  console.error('Error details:', error.message)
  console.error('Stack:', error.stack)
  
  // Initialize with empty/default values to prevent app crash
  // Components will handle the error state
  if (!app) {
    console.error('⚠️ Firebase app initialization failed. Some features may not work.')
  }
  if (!auth) {
    console.error('⚠️ Firebase Auth initialization failed. Phone login will not work.')
  }
  if (!db) {
    console.error('⚠️ Firestore initialization failed. Database features will not work.')
  }
}

// Always export (even if undefined) to prevent import errors
export { auth, db, storage }
export default app
