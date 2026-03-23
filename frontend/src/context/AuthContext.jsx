import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../../firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { getUserRoleProfile, upsertUserProfile } from '../auth/profileService'

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

        try {
          const roleProfile = await getUserRoleProfile(u.uid)

          if (roleProfile.data) {
            const hydratedProfile = {
              ...roleProfile.data,
              name: roleProfile.data.name || u.displayName || '',
              email: roleProfile.data.email || u.email || '',
              role: roleProfile.role || null
            }
            setProfile(hydratedProfile)

            // Mirror officials profile into users collection for compatibility.
            if (roleProfile.source === 'officials') {
              try {
                await upsertUserProfile(u.uid, {
                  name: hydratedProfile.name,
                  email: hydratedProfile.email,
                  role: hydratedProfile.role,
                  officialId: hydratedProfile.officialId || '',
                  updatedAt: new Date().toISOString()
                })
              } catch (syncErr) {
                console.warn('Could not mirror official profile into users collection:', syncErr)
              }
            }
          } else {
            const defaultProfile = {
              name: u.displayName || '',
              email: u.email || '',
              role: 'normal',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }

            try {
              await upsertUserProfile(u.uid, defaultProfile)
            } catch (writeErr) {
              console.error('Failed to create user profile:', writeErr)
            }

            setProfile(defaultProfile)
          }
        } catch (readErr) {
          if (readErr.code === 'permission-denied' || readErr.message?.includes('permission')) {
            console.warn('⚠️ Firestore permission denied. Using auth data for profile.')
            console.warn('💡 To fix: Update Firestore security rules in Firebase Console')
            setProfile({ name: u.displayName || '', email: u.email || '', role: null })
          } else if (readErr.message?.includes('ERR_BLOCKED_BY_CLIENT') || readErr.message?.includes('blocked')) {
            console.warn('⚠️ Firestore request blocked (likely by ad blocker). Using auth data for profile.')
            setProfile({ name: u.displayName || '', email: u.email || '', role: null })
          } else {
            console.error('Failed to read user profile:', readErr)
            setProfile({ name: u.displayName || '', email: u.email || '', role: null })
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
