import React, { useState } from 'react'

export default function WomenSafety() {
  const [formData, setFormData] = useState({
    incidentType: '',
    location: '',
    description: '',
    date: '',
    time: '',
    contact: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    // This is a placeholder - replace with actual API call
    console.log('Report submitted:', formData)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({
        incidentType: '',
        location: '',
        description: '',
        date: '',
        time: '',
        contact: ''
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Women Safety Harassment Report</h1>
          <p className="text-gray-600">Report any harassment or safety concern. Your report will be handled with confidentiality.</p>
        </div>

        {submitted ? (
          <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg text-center">
            <svg className="w-16 h-16 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-green-900 mb-2">Report Submitted Successfully</h3>
            <p className="text-green-700">Your report has been received. Authorities will be notified and appropriate action will be taken.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type of Incident <span className="text-red-500">*</span>
              </label>
              <select
                name="incidentType"
                value={formData.incidentType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="">Select incident type</option>
                <option value="verbal">Verbal Harassment</option>
                <option value="physical">Physical Harassment</option>
                <option value="stalking">Stalking</option>
                <option value="cyber">Cyber Harassment</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter location where incident occurred"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                placeholder="Provide detailed description of the incident"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number (Optional)
              </label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Your contact number for follow-up"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg font-medium hover:from-pink-700 hover:to-rose-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Submit Report
            </button>
          </form>
        )}

        <div className="mt-8 p-4 bg-pink-50 rounded-lg border border-pink-200">
          <h3 className="font-semibold text-pink-900 mb-2">🆘 Emergency Contacts</h3>
          <ul className="text-sm text-pink-800 space-y-1">
            <li><strong>Women Helpline:</strong> 1091</li>
            <li><strong>Police:</strong> 100</li>
            <li><strong>Emergency:</strong> 112</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

