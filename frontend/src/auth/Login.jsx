import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect
} from 'firebase/auth'
import { auth, getFirebaseSetupError } from '../../firebase'
import { ROLE } from './roleUtils'
import { upsertUserProfile } from './profileService'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const recoveredAuthRef = useRef(false)

  const finishUserLogin = async (user) => {
    await upsertUserProfile(user.uid, {
      email: user.email || '',
      name: user.displayName || '',
      role: ROLE.NORMAL,
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    navigate('/dashboard')
  }

  useEffect(() => {
    let isActive = true

    const handleGoogleRedirectResult = async () => {
      try {
        const redirectResult = await getRedirectResult(auth)
        if (isActive && redirectResult?.user) {
          recoveredAuthRef.current = true
          setError('')
          setNotice('')
          await finishUserLogin(redirectResult.user)
        }
      } catch (err) {
        if (!isActive) return
        console.error('Google redirect login failed:', err)
        if (err.code === 'auth/operation-not-allowed') {
          setError('Google sign-in is not enabled for this Firebase project. Enable Google in Firebase Console > Authentication > Sign-in method.')
        } else if (err.code === 'auth/unauthorized-domain') {
          setError('This domain is not authorized for Google sign-in. Add this domain in Firebase Console > Authentication > Settings > Authorized domains.')
        } else {
          setError('Google sign-in failed. Please try again.')
        }
      }
    }

    handleGoogleRedirectResult()

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!isActive || !currentUser || recoveredAuthRef.current) {
        return
      }

      recoveredAuthRef.current = true
      try {
        await finishUserLogin(currentUser)
      } catch (err) {
        console.error('Auth state recovery failed:', err)
      }
    })

    const setupError = getFirebaseSetupError()
    if (setupError && isActive) {
      setError(setupError)
    }

    return () => {
      isActive = false
      unsubscribe()
    }
  }, [])

  async function handleEmailLogin(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    setLoading(true)

    try {
      const setupError = getFirebaseSetupError()
      if (setupError) {
        setError(setupError)
        setLoading(false)
        return
      }

      const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
      await finishUserLogin(credential.user)
    } catch (err) {
      console.error('Email login failed:', err)
      if (err.code === 'auth/user-not-found') {
        setError('This email does not have an account. Use Google sign-in to register and continue.')
      } else if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password'
      ) {
        setError('Invalid email or password.')
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format.')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please wait and try again.')
      } else {
        setError(err.message || 'Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setError('')
    setNotice('')
    setLoading(true)

    try {
      const setupError = getFirebaseSetupError()
      if (setupError) {
        setError(setupError)
        setLoading(false)
        return
      }

      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })

      try {
        const popupResult = await signInWithPopup(auth, provider)
        recoveredAuthRef.current = true
        await finishUserLogin(popupResult.user)
        return
      } catch (popupErr) {
        if (
          popupErr.code === 'auth/popup-blocked' ||
          popupErr.code === 'auth/popup-closed-by-user' ||
          popupErr.message?.includes('Cross-Origin-Opener-Policy') ||
          popupErr.message?.includes('window.closed')
        ) {
          setNotice('Popup login blocked by browser policy. Redirecting to Google sign-in...')
          await signInWithRedirect(auth, provider)
          return
        }
        throw popupErr
      }
    } catch (err) {
      console.error('Google login failed:', err)
      if (err.code === 'auth/operation-not-allowed') {
        setError('Google sign-in is not enabled for this Firebase project. Enable Google in Firebase Console > Authentication > Sign-in method.')
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for Google sign-in. Add it in Firebase Console > Authentication > Settings > Authorized domains.')
      } else {
        setError(err.message || 'Google login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-6 sm:py-10 md:py-12 px-3 sm:px-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden">
          <div className="md:flex">
            <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 p-12 flex flex-col justify-center">
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-4">User Login</h1>
                <p className="text-lg text-amber-50 mb-8">
                  Login with Email/Password or Google to access your account.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">1</div>
                    <span className="text-amber-50">Email login for existing users</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">2</div>
                    <span className="text-amber-50">Google login for quick registration/login</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:w-1/2 p-5 sm:p-8 md:p-12">
              {/* <div className="md:hidden mb-5 rounded-lg bg-amber-50 border border-amber-100 px-4 py-3">
                <p className="font-semibold text-amber-900">User Login</p>
                <p className="text-xs text-amber-700">Email, password, or Google sign-in</p>
              </div> */}

              <div className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
                <p className="text-sm sm:text-base text-gray-600">Use your account credentials or continue with Google.</p>
              </div>

              {error && (
                <div className="mb-6 p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              {notice && (
                <div className="mb-6 p-3 sm:p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded-md text-sm">
                  {notice}
                </div>
              )}

              <div className="space-y-5 sm:space-y-6">
                <form onSubmit={handleEmailLogin} className="space-y-5 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 sm:py-3.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 sm:py-3.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white py-3 sm:py-3.5 rounded-lg font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Signing in...' : 'Sign In with Email'}
                  </button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full border-2 border-gray-300 text-gray-800 py-3 sm:py-3.5 rounded-lg font-semibold hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Please wait...' : 'Continue with Google'}
                </button>
              </div>

              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs sm:text-sm text-amber-900">
                <p className="font-semibold">Official login</p>
                <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <Link to="/login/police" className="underline hover:text-amber-700">Police Login</Link>
                  <span className="hidden sm:inline">|</span>
                  <Link to="/login/bank" className="underline hover:text-amber-700">Bank Login</Link>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-gray-200">
                <p className="text-xs text-center text-gray-500">
                  User login supports Email/Password and Google sign-in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
