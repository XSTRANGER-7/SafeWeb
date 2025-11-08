import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '../../firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setLoading(true)
      if (u) {
        setUser(u)
        // ensure profile doc exists
        try {
          const ref = doc(db, 'users', u.uid)
          const snap = await getDoc(ref)
          if (!snap.exists()) {
            // create default profile
            try {
              await setDoc(ref, { 
                name: u.displayName || '', 
                email: u.email || '', 
                role: 'normal',
                createdAt: new Date().toISOString()
              }, { merge: true })
              setProfile({ name: u.displayName || '', email: u.email || '', role: 'normal' })
            } catch (writeErr) {
              console.error('Failed to create user profile:', writeErr)
              // Set profile from auth data even if Firestore write fails
              setProfile({ name: u.displayName || '', email: u.email || '', role: 'normal' })
            }
          } else {
            setProfile(snap.data())
          }
        } catch (readErr) {
          // Handle permission errors gracefully
          if (readErr.code === 'permission-denied' || readErr.message?.includes('permission')) {
            console.warn('⚠️ Firestore permission denied. Using auth data for profile.')
            console.warn('💡 To fix: Update Firestore security rules in Firebase Console')
            setProfile({ name: u.displayName || '', email: u.email || '', role: 'normal' })
          } else if (readErr.message?.includes('ERR_BLOCKED_BY_CLIENT') || readErr.message?.includes('blocked')) {
            // Ad blocker or browser extension blocking requests - not a real error
            console.warn('⚠️ Firestore request blocked (likely by ad blocker). Using auth data for profile.')
            setProfile({ name: u.displayName || '', email: u.email || '', role: 'normal' })
          } else {
            console.error('Failed to read user profile:', readErr)
            // For other errors, still set basic profile
            setProfile({ name: u.displayName || '', email: u.email || '', role: 'normal' })
          }
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth)
      // State will be updated automatically by onAuthStateChanged
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  return <AuthContext.Provider value={{ user, profile, setProfile, loading, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
