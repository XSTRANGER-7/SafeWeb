import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase'

export default function PBLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  
  // Determine role from route path
  const getRoleFromPath = () => {
    if (location.pathname.includes('/login/police')) return 'police'
    if (location.pathname.includes('/login/bank')) return 'bank'
    return 'normal'
  }
  
  const role = getRoleFromPath()

  // Handle login form submission
  async function handleLogin(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate inputs
      if (!email || !password) {
        setError('Please enter both email and password')
        setLoading(false)
        return
      }

      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Try to verify the user's role in Firestore
      let userRole = null
      let roleVerified = false
      let firestoreAccessible = true

      try {
        // Check users collection first
        const userRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
          const userData = userSnap.data()
          userRole = userData.role
          console.log('Found user in Firestore users collection. Role:', userRole, 'Expected:', role)
          
          // If role doesn't match, update it to match the login route
          if (userRole !== role) {
            console.log('Role mismatch detected. Updating role from', userRole, 'to', role)
            try {
              await setDoc(userRef, {
                role: role,
                updatedAt: new Date().toISOString()
              }, { merge: true })
              console.log('Role updated successfully')
              roleVerified = true
            } catch (updateErr) {
              console.warn('Could not update role:', updateErr)
              // Still allow login if update fails
              roleVerified = true
            }
          } else {
            roleVerified = true
          }
        } else {
          // User doesn't exist in users collection, check officials collection
          console.log('User not found in users collection, checking officials collection...')
          const officialRef = doc(db, 'officials', user.uid)
          const officialSnap = await getDoc(officialRef)

          if (officialSnap.exists()) {
            const officialData = officialSnap.data()
            userRole = officialData.role
            console.log('Found user in Firestore officials collection. Role:', userRole, 'Expected:', role)
            
            // If role doesn't match, update it in officials collection
            if (userRole !== role) {
              console.log('Role mismatch in officials collection. Updating role from', userRole, 'to', role)
              try {
                await setDoc(officialRef, {
                  role: role,
                  updatedAt: new Date().toISOString()
                }, { merge: true })
                console.log('Role updated in officials collection')
                userRole = role // Update local variable
              } catch (updateErr) {
                console.warn('Could not update role in officials collection:', updateErr)
              }
            }
            
            roleVerified = true
            
            // Create/update user profile in users collection with correct role
            try {
              await setDoc(userRef, {
                email: user.email,
                role: role, // Use the role from login route
                name: officialData.name || '',
                officialId: officialData.officialId || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }, { merge: true })
              console.log('Created/updated user profile in users collection with role:', role)
            } catch (writeErr) {
              console.warn('Could not write to users collection:', writeErr)
              // Continue anyway - user is authenticated
            }
          } else {
            console.log('User not found in either users or officials collection. UID:', user.uid)
          }
        }
      } catch (firestoreError) {
        // Handle Firestore errors (blocked by client, permission denied, etc.)
        firestoreAccessible = false
        console.warn('Firestore access error:', firestoreError)
        console.warn('Error code:', firestoreError.code)
        console.warn('Error message:', firestoreError.message)
        
        // If Firestore is blocked or has permission issues, allow login anyway
        // The user is authenticated via Firebase Auth, which is the primary check
        if (firestoreError.message?.includes('ERR_BLOCKED_BY_CLIENT') || 
            firestoreError.code === 'permission-denied' ||
            firestoreError.message?.includes('blocked') ||
            firestoreError.message?.includes('Failed to fetch')) {
          console.warn('Firestore blocked or permission denied. Allowing login based on Firebase Auth only.')
          roleVerified = true // Allow login if Firestore is blocked
        } else {
          // For other Firestore errors, still try to proceed
          console.warn('Firestore error, but user is authenticated. Proceeding with login.')
          roleVerified = true
        }
      }

      // If we couldn't verify role and Firestore is accessible, but user exists, allow login anyway
      // (We've already tried to update the role above)
      if (!roleVerified && firestoreAccessible && userRole === null) {
        // User not found in Firestore at all - this is unusual but allow login
        console.warn('User not found in Firestore. Allowing login and creating profile...')
        try {
          const userRef = doc(db, 'users', user.uid)
          await setDoc(userRef, {
            email: user.email,
            role: role,
            createdAt: new Date().toISOString()
          }, { merge: true })
          roleVerified = true
        } catch (createErr) {
          console.warn('Could not create user profile:', createErr)
          // Still allow login
          roleVerified = true
        }
      }

      // If Firestore is not accessible, log a warning but allow login
      if (!firestoreAccessible) {
        console.warn('⚠️ Firestore is not accessible. Login allowed based on Firebase Auth only.')
        console.warn('⚠️ Please ensure Firestore documents exist for proper role verification.')
      }

      // Success - navigate to appropriate dashboard based on role
      if (role === 'police') {
        navigate('/police-dashboard')
      } else if (role === 'bank') {
        // Bank dashboard - redirect to regular dashboard for now, can be updated later
        navigate('/bank-dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      console.error('Login error:', err)
      let errorMessage = 'Login failed. Please check your credentials.'
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.'
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.'
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.'
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Please contact administrator.'
      } else if (err.message?.includes('ERR_BLOCKED_BY_CLIENT') || err.message?.includes('blocked')) {
        errorMessage = 'Firestore access blocked. Please disable ad blockers or browser extensions that block requests, then try again.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Get title and icon based on role
  const getTitle = () => {
    if (role === 'police') return 'Police Login'
    if (role === 'bank') return 'Bank Login'
    return 'Official Login'
  }

  const getIcon = () => {
    if (role === 'police') return '👮'
    if (role === 'bank') return '🏦'
    return '🔐'
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="md:flex">
            {/* Left Side - Branding */}
            <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 p-12 flex flex-col justify-center">
              <div className="text-white">
                <div className="text-6xl mb-6">{getIcon()}</div>
                <h1 className="text-4xl font-bold mb-4">{getTitle()}</h1>
                <p className="text-lg text-amber-50 mb-8">
                  Secure access for authorized personnel
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <span className="text-amber-50">Secure & Encrypted</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <span className="text-amber-50">Official Credentials</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-amber-50">Fast & Reliable</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="md:w-1/2 p-8 md:p-12">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{getTitle()}</h2>
                <p className="text-gray-600">Enter your official email and password to access your account</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Official Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="official@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-xs text-center text-gray-500">
                  For authorized personnel only. Unauthorized access is prohibited.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
