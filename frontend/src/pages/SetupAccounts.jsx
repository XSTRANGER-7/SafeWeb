import React, { useState } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase'

export default function SetupAccounts() {
  const [status, setStatus] = useState('Click to setup test accounts')

  const createAccounts = async () => {
    setStatus('Setting up accounts...\n')
    const accounts = [
      { email: 'police@test.com', pass: 'police123', role: 'police', id: 'POLICE001', name: 'Test Police Officer' },
      { email: 'bank@test.com', pass: 'bank123', role: 'bank', id: 'BANK001', name: 'Test Bank Official' },
      { email: 'police_admin@test.com', pass: 'police123', role: 'police', id: 'POLICE002', name: 'Fallback Police' },
      { email: 'bank_admin@test.com', pass: 'bank123', role: 'bank', id: 'BANK002', name: 'Fallback Bank' }
    ]

    for (const acc of accounts) {
      let uid = null;
      try {
        const cred = await createUserWithEmailAndPassword(auth, acc.email, acc.pass)
        uid = cred.user.uid
        setStatus(prev => prev + `\nCreated new Auth user for ${acc.email}...`)
      } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
          setStatus(prev => prev + `\n${acc.email} already exists. Attempting to log in to fix permissions...`)
          try {
            const loginCred = await signInWithEmailAndPassword(auth, acc.email, acc.pass)
            uid = loginCred.user.uid
            setStatus(prev => prev + `\nLogged in successfully.`)
          } catch (loginErr) {
            setStatus(prev => prev + `\nFailed to login to ${acc.email} (wrong password?). Please delete it in Firebase Console first. Error: ${loginErr.message}`)
            continue;
          }
        } else {
          setStatus(prev => prev + `\nError creating ${acc.email}: ${err.message}`)
          continue;
        }
      }

      if (uid) {
        try {
          // Add to officials collection
          await setDoc(doc(db, 'officials', uid), {
            email: acc.email,
            name: acc.name,
            role: acc.role,
            officialId: acc.id,
            createdAt: new Date().toISOString()
          }, { merge: true })
          
          // Add to users collection
          await setDoc(doc(db, 'users', uid), {
            email: acc.email,
            name: acc.name,
            role: acc.role,
            officialId: acc.id,
            createdAt: new Date().toISOString()
          }, { merge: true })
          
          setStatus(prev => prev + `\nSuccessfully set Firestore roles for ${acc.email}!`)
        } catch (dbErr) {
          setStatus(prev => prev + `\nFailed to write to Firestore for ${acc.email}: ${dbErr.message}`)
        }
      }
    }
    setStatus(prev => prev + '\n\nDone! If successful, you can now log in.')
  }

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold mb-4">Test Accounts Setup</h1>
      <button 
        onClick={createAccounts}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        Create Police & Bank Accounts
      </button>
      <pre className="text-left bg-gray-100 p-4 rounded whitespace-pre-wrap max-w-lg mx-auto text-sm">
        {status}
      </pre>
    </div>
  )
}
