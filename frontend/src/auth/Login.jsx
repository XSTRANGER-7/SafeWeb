import React, { useState, useEffect } from 'react'
import { useI18n } from '../../i18n/index.jsx'
import PhoneLogin from './PhoneLogin'
import AadhaarAuth from './AadhaarAuth'
import { useNavigate, useLocation } from 'react-router-dom'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../../firebase'

export default function Login() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState(null)
  const [step, setStep] = useState(1) // 1 = Mobile, 2 = Aadhaar
  const [mobileVerified, setMobileVerified] = useState(false)
  const [mobileUser, setMobileUser] = useState(null)
  
  // Determine role from route path
  const getRoleFromPath = () => {
    if (location.pathname.includes('/login/police')) return 'police'
    if (location.pathname.includes('/login/bank')) return 'bank'
    return 'normal'
  }
  
  const role = getRoleFromPath()

  // Handle mobile verification success
  const onMobileVerified = (user) => {
    setMobileUser(user)
    setMobileVerified(true)
    setStep(2) // Move to Aadhaar verification
  }

  // Handle Aadhaar verification success - complete login
  const onAadhaarVerified = async (user) => {
    // Both steps completed, now save profile and navigate
    await onLoginSuccess(mobileUser || user)
  }

  // after successful Firebase sign-in, ensure profile role is set in Firestore
  async function onLoginSuccess(user) {
    try {
      const ref = doc(db, 'users', user.uid)
      await setDoc(ref, { role }, { merge: true })
      navigate('/dashboard')
    } catch (err) {
      console.error('Failed to save profile role:', err)
      // If permission error, still navigate to dashboard
      if (err.code === 'permission-denied' || err.message?.includes('permission')) {
        console.warn('Firestore permission denied. User logged in but profile update failed.')
        // Still navigate - the user is authenticated
        navigate('/dashboard')
      } else {
        setError('Failed to save profile: ' + err.message)
        // Still navigate after a delay even if there's an error
        setTimeout(() => navigate('/dashboard'), 2000)
      }
    }
  }

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Get title based on role
  const getTitle = () => {
    if (role === 'police') return 'Police Login'
    if (role === 'bank') return 'Bank Login'
    return 'Welcome to Safeweb'
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="max-w-5xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="md:flex">
            {/* Left Side - Branding */}
            <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 p-12 flex flex-col justify-center">
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-4">{getTitle()}</h1>
                <p className="text-lg text-amber-50 mb-8">
                  Two-step verification for enhanced security
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
                    <span className="text-amber-50">Two-Step Verification</span>
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
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Two-Step Verification</h2>
                <p className="text-gray-600">Complete both steps to securely access your account</p>
              </div>

              {/* Progress Tracker */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  {/* Step 1 - Mobile */}
                  <div className="flex flex-col items-center flex-1 relative z-10">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                      step >= 1 
                        ? mobileVerified
                          ? 'bg-green-500 text-white shadow-lg scale-110'
                          : 'bg-amber-500 text-white shadow-md'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {mobileVerified ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span>1</span>
                      )}
                    </div>
                    <span className={`mt-2 text-xs font-medium text-center transition-colors duration-300 ${
                      step >= 1 ? 'text-amber-600' : 'text-gray-400'
                    }`}>
                      Mobile Verification
                    </span>
                  </div>

                  {/* Progress Line with Animation */}
                  <div className="flex-1 h-1.5 mx-4 relative -mt-6">
                    {/* Background gray line - always visible from step 1 to step 2 */}
                    <div className="absolute top-0 left-0 h-full w-full bg-gray-200 rounded-full" />
                    
                    {/* Animated yellow/golden line - fills when mobile is verified */}
                    <div 
                      className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-in-out ${
                        mobileVerified 
                          ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 w-full shadow-md' 
                          : 'bg-gray-200 w-full'
                      }`}
                      style={{
                        transition: mobileVerified 
                          ? 'background 1s ease-in-out, box-shadow 0.5s ease-in-out' 
                          : 'background 0.3s ease-in-out'
                      }}
                    />
                  </div>

                  {/* Step 2 - Aadhaar */}
                  <div className="flex flex-col items-center flex-1 relative z-10">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                      step >= 2
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      <span>2</span>
                    </div>
                    <span className={`mt-2 text-xs font-medium text-center transition-colors duration-300 ${
                      step >= 2 ? 'text-amber-600' : 'text-gray-400'
                    }`}>
                      Aadhaar Verification
                    </span>
                  </div>
                </div>
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

              {/* Authentication Forms */}
              <div className="mt-8">
                {step === 1 ? (
                  <PhoneLogin onSuccess={onMobileVerified} />
                ) : (
                  <AadhaarAuth onSuccess={onAadhaarVerified} />
                )}
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-xs text-center text-gray-500">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
