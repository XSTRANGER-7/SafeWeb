import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  updateProfile
} from 'firebase/auth'
import { auth, getFirebaseSetupError } from '../../firebase'
import { ROLE } from './roleUtils'
import { upsertUserProfile } from './profileService'

function GoogleLogo() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 shrink-0" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.655 32.657 29.23 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.844 1.153 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917Z" />
      <path fill="#FF3D00" d="M6.306 14.691 12.881 19.51A11.955 11.955 0 0 1 24 12c3.059 0 5.844 1.153 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691Z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.193l-6.19-5.238C29.147 35.091 26.653 36 24 36c-5.21 0-9.624-3.316-11.284-7.946l-6.526 5.029C9.5 39.556 16.227 44 24 44Z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.058 12.058 0 0 1-4.084 5.569l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917Z" />
    </svg>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const [authMode, setAuthMode] = useState('signin')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const recoveredAuthRef = useRef(false)

  const isRegisterMode = authMode === 'register'

  const switchAuthMode = (mode) => {
    setAuthMode(mode)
    setPassword('')
    setConfirmPassword('')
    setError('')
    setNotice('')
  }

  const finishUserLogin = async (user, profilePatch = {}) => {
    const now = new Date().toISOString()
    const profileName = profilePatch.name ?? user.displayName ?? ''

    await upsertUserProfile(user.uid, {
      email: user.email || '',
      name: profileName,
      role: ROLE.NORMAL,
      lastLoginAt: now,
      updatedAt: now,
      ...profilePatch
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        return
      }

      const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
      recoveredAuthRef.current = true
      await finishUserLogin(credential.user)
    } catch (err) {
      console.error('Email login failed:', err)
      if (err.code === 'auth/user-not-found') {
        setError('This email does not have an account. Use Google sign-in or Register Now to create one.')
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

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    setLoading(true)

    try {
      const setupError = getFirebaseSetupError()
      if (setupError) {
        setError(setupError)
        return
      }

      const trimmedName = fullName.trim()
      const trimmedEmail = email.trim()
      const createdAt = new Date().toISOString()

      if (!trimmedName) {
        setError('Please enter your full name to create an account.')
        return
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters long.')
        return
      }

      if (password !== confirmPassword) {
        setError('Password and confirm password do not match.')
        return
      }

      const credential = await createUserWithEmailAndPassword(auth, trimmedEmail, password)
      recoveredAuthRef.current = true

      if (trimmedName) {
        try {
          await updateProfile(credential.user, { displayName: trimmedName })
        } catch (profileErr) {
          console.warn('Could not update display name for the new user:', profileErr)
        }
      }

      const activeUser = auth.currentUser || credential.user
      await finishUserLogin(activeUser, {
        name: trimmedName,
        createdAt
      })
    } catch (err) {
      console.error('User registration failed:', err)
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.')
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format.')
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.')
      } else {
        setError(err.message || 'Registration failed. Please try again.')
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

  const heading = isRegisterMode ? 'Create Your Account' : 'Sign In'
  const description = isRegisterMode
    ? 'Register with email and password, or continue with Google for a faster setup.'
    : 'Use your account credentials or continue with Google.'

  return (
    <div className="flex min-h-[calc(100vh-180px)] items-center justify-center px-3 py-5 sm:px-4 sm:py-8 md:py-12">
      <div className="w-full max-w-5xl">
        <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_25px_80px_-35px_rgba(15,23,42,0.45)] ring-1 ring-slate-200">
          <div className="md:grid md:grid-cols-[1.02fr_0.98fr]">
            <div className="hidden bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 p-12 md:flex md:flex-col md:justify-center">
              <div className="text-white">
                <h1 className="text-4xl font-bold leading-tight">User Access</h1>
                <p className="mt-4 text-lg text-amber-50">
                  Sign in securely, or register a new user account in a few quick steps.
                </p>
                <div className="mt-10 space-y-4">
                  <div className="flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 font-semibold">1</div>
                    <span className="text-amber-50">Email sign-in for returning users</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 font-semibold">2</div>
                    <span className="text-amber-50">Google sign-in with one tap access</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 font-semibold">3</div>
                    <span className="text-amber-50">New users can register directly from this page</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-7 md:p-12">
              <div className="mb-6 rounded-3xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 p-4 text-white shadow-lg md:hidden">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-100">User Access</p>
                <h2 className="mt-2 text-2xl font-bold">Login and register on any screen size</h2>
                <p className="mt-2 text-sm text-amber-50">
                  Mobile-friendly user sign-in with email, password, and Google access.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                  <span className="rounded-full bg-white/20 px-3 py-1">Email login</span>
                  <span className="rounded-full bg-white/20 px-3 py-1">Google sign-in</span>
                  <span className="rounded-full bg-white/20 px-3 py-1">New user register</span>
                </div>
              </div>

              <div className="mb-6 sm:mb-8">
                <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">{heading}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mb-6">
                  {error}
                </div>
              )}

              {notice && (
                <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 sm:mb-6">
                  {notice}
                </div>
              )}

              <div className="space-y-5 sm:space-y-6">
                <form onSubmit={isRegisterMode ? handleRegister : handleEmailLogin} className="space-y-4 sm:space-y-5">
                  {isRegisterMode && (
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name</label>
                      <input
                        type="text"
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base text-slate-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        autoComplete="name"
                        required={isRegisterMode}
                      />
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                    <input
                      type="email"
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base text-slate-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className={isRegisterMode ? 'grid gap-4 sm:grid-cols-2' : ''}>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                      <input
                        type="password"
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base text-slate-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder={isRegisterMode ? 'Create a password' : 'Enter your password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                        required
                      />
                    </div>

                    {isRegisterMode && (
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Confirm Password</label>
                        <input
                          type="password"
                          className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base text-slate-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-amber-500"
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          autoComplete="new-password"
                          required={isRegisterMode}
                        />
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-amber-600 hover:to-yellow-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
                  >
                    {loading
                      ? isRegisterMode
                        ? 'Creating account...'
                        : 'Signing in...'
                      : isRegisterMode
                        ? 'Create Account'
                        : 'Sign In with Email'}
                  </button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    <span className="bg-white px-3">Or continue</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
                >
                  <GoogleLogo />
                  <span>{loading ? 'Please wait...' : 'Continue with Google'}</span>
                </button>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {isRegisterMode ? 'Already have an account?' : 'New user?'}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">
                        {isRegisterMode
                          ? 'Switch back to sign in and continue to your dashboard.'
                          : 'Register now to create your user account with email or Google.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => switchAuthMode(isRegisterMode ? 'signin' : 'register')}
                      className="w-full rounded-xl border border-amber-300 bg-white px-4 py-3 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-50 sm:w-auto sm:min-w-[170px]"
                    >
                      {isRegisterMode ? 'Back to Sign In' : 'Register Now'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 sm:text-sm">
                <p className="font-semibold">Official login</p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                  <Link to="/login/police" className="underline underline-offset-2 transition-colors hover:text-amber-700">
                    Police Login
                  </Link>
                  <span className="hidden sm:inline">|</span>
                  <Link to="/login/bank" className="underline underline-offset-2 transition-colors hover:text-amber-700">
                    Bank Login
                  </Link>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-5 text-center">
                <p className="text-xs leading-5 text-slate-500 sm:text-sm">
                  User login supports Email/Password, Google sign-in, and direct registration for new users.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
