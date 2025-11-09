import React, { useState } from 'react'

// Aadhaar Authentication with dummy OTP generation
// In production, this would integrate with UIDAI API
// Note: User is already authenticated via mobile, we just verify Aadhaar here

export default function AadhaarAuth({ onSuccess }) {
  const [aadhaar, setAadhaar] = useState('')
  const [otp, setOtp] = useState('')
  const [sent, setSent] = useState(false)
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [loading, setLoading] = useState(false)

  // Generate a random 6-digit OTP
  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  async function sendOtp(e) {
    e.preventDefault()
    setLoading(true)

    // Validate Aadhaar number (12 digits)
    if (!/^\d{12}$/.test(aadhaar)) {
      console.error('Please enter a valid 12-digit Aadhaar number')
      setLoading(false)
      return
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Generate OTP (in production, this would come from backend/UIDAI)
    const otpValue = generateOtp()
    setGeneratedOtp(otpValue)

  try {
      // Send the generated OTP to backend so it can be logged to the server terminal
      // Backend endpoint should accept this POST and log it (for testing/debugging only)
      // Directly target backend on localhost during development
      const API_BASE = 'http://localhost:5000'
      const res = await fetch(`${API_BASE}/api/debug/otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaarNumber: aadhaar, otp: otpValue })
      })

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`)
      }

      // Mark as sent (OTP will be visible on backend terminal, not in frontend)
      setSent(true)
    } catch (err) {
      console.error('Failed to send OTP to backend:', err)
    } finally {
      setLoading(false)
    }
  }

  async function verify(e) {
    e.preventDefault()
    setLoading(true)
    if (otp.length !== 6) {
      console.error('Please enter a valid 6-digit OTP')
      setLoading(false)
      return
    }

    try {
      // Call backend verify endpoint
      const API_BASE = 'http://localhost:5000'
      const res = await fetch(`${API_BASE}/api/debug/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaarNumber: aadhaar, otp })
      })

      const data = await res.json()
      if (!res.ok) {
        console.error('OTP verification failed:', data && data.message)
        setLoading(false)
        return
      }

  // Successful verification: proceed to next step
  setLoading(false)
  onSuccess && onSuccess({ aadhaarVerified: true, aadhaarNumber: aadhaar })
  // Redirect to home page
  window.location.href = '/'
    } catch (err) {
      console.error('Aadhaar verification failed:', err)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Success message for mobile verification */}
      <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-md">
        <div className="flex items-center gap-2 text-green-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">Step 1 Complete: Mobile number verified successfully</span>
        </div>
      </div>

      {!sent ? (
        <form onSubmit={sendOtp} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                Step 2: Aadhaar Number
              </div>
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                value={aadhaar}
                onChange={e => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                placeholder="1234 5678 9012"
                maxLength="12"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Enter your 12-digit Aadhaar number. OTP will be sent to your registered mobile number.
            </p>
          </div>

          <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Secure Authentication</p>
                <p className="text-xs">Your Aadhaar number is encrypted and securely verified with UIDAI.</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || aadhaar.length !== 12}
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
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-md">
            <div className="flex flex-col gap-2 text-green-700">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">OTP generated and sent to backend (check backend terminal)</span>
              </div>

              <form onSubmit={verify} className="space-y-2">
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-center text-2xl tracking-widest font-semibold"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter OTP"
                  maxLength="6"
                  required
                />

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
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
                      <span>Verify & Login</span>
                    </>
                  )}
                </button>
              </form>

              <button
                type="button"
                onClick={() => {
                  setSent(false)
                  setOtp('')
                  setGeneratedOtp('')
                  setAadhaar('')
                }}
                className="w-full text-sm text-gray-600 hover:text-amber-600 transition-colors"
              >
                Change Aadhaar number
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
