import React, { useState } from 'react'

export default function CyberFraudReport() {
  const [formData, setFormData] = useState({
    fraudType: '',
    amount: '',
    method: '',
    description: '',
    date: '',
    bankAccount: '',
    transactionId: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    // This is a placeholder - replace with actual API call
    console.log('Fraud report submitted:', formData)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({
        fraudType: '',
        amount: '',
        method: '',
        description: '',
        date: '',
        bankAccount: '',
        transactionId: ''
      })
    }, 3000)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cyber Fraud Report</h1>
          <p className="text-gray-600">Report any cyber fraud incident. Your report will be forwarded to the appropriate authorities.</p>
        </div>

        {submitted ? (
          <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg text-center">
            <svg className="w-16 h-16 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-green-900 mb-2">Report Submitted Successfully</h3>
            <p className="text-green-700">Your fraud report has been received. A case number will be generated and shared with you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type of Fraud <span className="text-red-500">*</span>
              </label>
              <select
                name="fraudType"
                value={formData.fraudType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="">Select fraud type</option>
                <option value="phishing">Phishing</option>
                <option value="upi">UPI Fraud</option>
                <option value="credit-card">Credit Card Fraud</option>
                <option value="online-shopping">Online Shopping Fraud</option>
                <option value="investment">Investment Scam</option>
                <option value="loan">Loan Fraud</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Lost (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Incident <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                name="method"
                value={formData.method}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="">Select payment method</option>
                <option value="upi">UPI</option>
                <option value="net-banking">Net Banking</option>
                <option value="credit-card">Credit Card</option>
                <option value="debit-card">Debit Card</option>
                <option value="wallet">Digital Wallet</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID / Reference Number
              </label>
              <input
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleChange}
                placeholder="Enter transaction ID if available"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Account / Wallet Details (if applicable)
              </label>
              <input
                type="text"
                name="bankAccount"
                value={formData.bankAccount}
                onChange={handleChange}
                placeholder="Account number or wallet ID"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                placeholder="Provide detailed description of the fraud incident, including how it happened, who contacted you, etc."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Submit Fraud Report
            </button>
          </form>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">📞 Important Contacts</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li><strong>Cyber Crime Helpline:</strong> 1930</li>
            <li><strong>National Cyber Crime Portal:</strong> www.cybercrime.gov.in</li>
            <li><strong>Police:</strong> 100</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

