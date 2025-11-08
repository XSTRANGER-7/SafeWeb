import React, { useEffect, useRef, useState } from 'react'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { auth } from '../../firebase'

export default function PhoneLogin({ onSuccess }) {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [confirmationResult, setConfirmationResult] = useState(null)
  const [recaptchaError, setRecaptchaError] = useState(null)
  const [loading, setLoading] = useState(false)
  const recaptchaRef = useRef(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recaptchaRef.current) {
        try {
          recaptchaRef.current.clear()
        } catch (err) {
          // Ignore cleanup errors
        }
      }
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear()
        } catch (err) {
          // Ignore cleanup errors
        }
      }
    }
  }, [])

  async function sendOtp(e) {
    e.preventDefault()
    setRecaptchaError(null)
    setLoading(true)
    
    try {
      // Validate phone number
      if (!phone || phone.trim().length < 10) {
        alert('Please enter a valid phone number')
        setLoading(false)
        return
      }

      if (!auth || !auth.app) {
        const errorMsg = 'Firebase is not configured. Please check your configuration.'
        alert(errorMsg)
        setRecaptchaError(errorMsg)
        setLoading(false)
        return
      }

      const fullPhone = phone.startsWith('+') ? phone : `+91${phone}`
      
      // Validate phone format
      if (!/^\+?[1-9]\d{1,14}$/.test(fullPhone.replace(/\s/g, ''))) {
        alert('Please enter a valid phone number')
        setLoading(false)
        return
      }

      // Initialize reCAPTCHA verifier
      let appVerifier = window.recaptchaVerifier || recaptchaRef.current

      if (!appVerifier) {
        try {
          let container = document.getElementById('recaptcha-container')
          if (!container) {
            container = document.createElement('div')
            container.id = 'recaptcha-container'
            container.className = 'hidden'
            document.body.appendChild(container)
          }

          await new Promise(resolve => setTimeout(resolve, 100))

          if (!auth || !auth.app || !auth.settings) {
            await new Promise(resolve => setTimeout(resolve, 200))
          }

          if (window.recaptchaVerifier) {
            try {
              window.recaptchaVerifier.clear()
            } catch (e) {}
            window.recaptchaVerifier = null
          }

          await new Promise(resolve => setTimeout(resolve, 100))

          appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: () => {
              setRecaptchaError(null)
            },
            'expired-callback': () => {
              setRecaptchaError('reCAPTCHA expired. Please try again.')
            }
          })

          window.recaptchaVerifier = appVerifier
          recaptchaRef.current = appVerifier
        } catch (recaptchaErr) {
          console.error('reCAPTCHA initialization error:', recaptchaErr)
          setRecaptchaError('Failed to initialize security verification. Please refresh and try again.')
          setLoading(false)
          return
        }
      }

      if (!appVerifier || typeof appVerifier.verify !== 'function') {
        throw new Error('Security verification failed. Please refresh the page and try again.')
      }

      // Send OTP
      const result = await signInWithPhoneNumber(auth, fullPhone, appVerifier)
      setConfirmationResult(result)
      setRecaptchaError(null)
      setLoading(false)
    } catch (err) {
      console.error('OTP send error:', err)
      const errorMsg = err.message || 'Unknown error'
      
      let userFriendlyMsg = errorMsg
      if (errorMsg.includes('verify') || errorMsg.includes('appVerifier')) {
        userFriendlyMsg = 'Security verification failed. Please refresh and try again.'
      } else if (errorMsg.includes('quota') || errorMsg.includes('too-many-requests')) {
        userFriendlyMsg = 'Too many requests. Please wait a few minutes before trying again.'
      } else if (errorMsg.includes('invalid-phone-number')) {
        userFriendlyMsg = 'Invalid phone number format. Please check and try again.'
      } else if (errorMsg.includes('network')) {
        userFriendlyMsg = 'Network error. Please check your internet connection.'
      }
      
      setRecaptchaError(userFriendlyMsg)
      setLoading(false)
      
      if (recaptchaRef.current) {
        try {
          recaptchaRef.current.clear()
        } catch (e) {}
      }
      recaptchaRef.current = null
      window.recaptchaVerifier = null
    }
  }

  async function verifyOtp(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (!confirmationResult) {
        alert('Please request OTP first')
        setLoading(false)
        return
      }
      const userCredential = await confirmationResult.confirm(code)
      const user = userCredential.user
      onSuccess && onSuccess(user)
    } catch (err) {
      console.error(err)
      alert('OTP verification failed: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {recaptchaError && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{recaptchaError}</span>
          </div>
        </div>
      )}

      {!confirmationResult ? (
        <form onSubmit={sendOtp} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Step 1: Mobile Number
              </div>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">+91</span>
              </div>
              <input
                type="tel"
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                maxLength="10"
                required
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">We'll send you a 6-digit OTP for verification</p>
          </div>

          <div id="recaptcha-container" className="hidden" />

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
                <span>Sending OTP...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Send OTP</span>
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="space-y-6">
          <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-md">
            <div className="flex items-center gap-2 text-green-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">OTP sent successfully to +91{phone}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Enter OTP
              </div>
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-center text-2xl tracking-widest font-semibold"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength="6"
              required
            />
            <p className="mt-2 text-xs text-gray-500">Enter the 6-digit code sent to your mobile</p>
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Verify OTP</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setConfirmationResult(null)
              setCode('')
            }}
            className="w-full text-sm text-gray-600 hover:text-amber-600 transition-colors"
          >
            Change mobile number
          </button>
        </form>
      )}
    </div>
  )
}
