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
    <div className="mx-auto max-w-3xl px-1 sm:px-0">
      <div className="rounded-xl bg-white p-4 shadow-lg sm:p-8">
        <div className="mb-6">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">Women Safety Harassment Report</h1>
          <p className="text-sm text-gray-600 sm:text-base">
            Report any harassment or safety concern. Your report will be handled with confidentiality.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-lg border-2 border-green-200 bg-green-50 p-5 text-center sm:p-6">
            <svg className="mx-auto mb-4 h-12 w-12 text-green-600 sm:h-16 sm:w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mb-2 text-lg font-semibold text-green-900 sm:text-xl">Report Submitted Successfully</h3>
            <p className="text-sm text-green-700 sm:text-base">
              Your report has been received. Authorities will be notified and appropriate action will be taken.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Type of Incident <span className="text-red-500">*</span>
              </label>
              <select
                name="incidentType"
                value={formData.incidentType}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter location where incident occurred"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                placeholder="Provide detailed description of the incident"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Contact Number (Optional)</label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Your contact number for follow-up"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 px-6 py-3 font-medium text-white shadow-md transition-all duration-200 hover:from-pink-700 hover:to-rose-700 hover:shadow-lg"
            >
              Submit Report
            </button>
          </form>
        )}

        <div className="mt-8 rounded-lg border border-pink-200 bg-pink-50 p-4">
          <h3 className="mb-2 font-semibold text-pink-900">Emergency Contacts</h3>
          <ul className="space-y-1 text-sm text-pink-800">
            <li><strong>Women Helpline:</strong> 1091</li>
            <li><strong>Police:</strong> 100</li>
            <li><strong>Emergency:</strong> 112</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
