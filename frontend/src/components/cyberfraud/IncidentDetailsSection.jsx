import React from "react";

export default function IncidentDetailsSection({
  form,
  setForm,
  onPrev,
  onNext
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="mb-6 hidden rounded-r-lg border-l-4 border-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50 py-4 pl-6 sm:block">
        <div className="flex items-center gap-3 mb-2">
          <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h4 className="text-xl font-bold text-gray-900">Incident Information</h4>
        </div>
        <p className="text-sm text-gray-600">Capture the fraud timeline, financial trail, scammer information, and a clear complaint narrative.</p>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-6 hidden rounded-3xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-900 sm:block">
          Fill the incident step as accurately as possible. Use exact dates, transaction references, and platform details wherever available.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Date of Incident <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.incidentDate}
              onChange={(e) => setForm({ ...form, incidentDate: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Time of Incident <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={form.incidentTime}
              onChange={(e) => setForm({ ...form, incidentTime: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Date of Reporting
            </label>
            <input
              type="date"
              value={form.reportingDate}
              onChange={(e) => setForm({ ...form, reportingDate: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Time of Reporting
            </label>
            <input
              type="time"
              value={form.reportingTime}
              onChange={(e) => setForm({ ...form, reportingTime: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Location / Place of Occurrence
          </label>
          <input
            type="text"
            placeholder="City, State or Online/Website name"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          />
          <p className="mt-1 hidden items-center gap-1 text-xs text-gray-500 sm:flex">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Physical location or online platform where incident occurred
          </p>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Incident Type <span className="text-red-500">*</span>
          </label>
          <select
            value={form.incidentType}
            onChange={(e) => setForm({ ...form, incidentType: e.target.value })}
            required
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          >
            <option value="">Select Incident Type</option>
            <option value="UPI Fraud">UPI Fraud</option>
            <option value="Phishing">Phishing</option>
            <option value="OTP Scam">OTP Scam</option>
            <option value="Online Job Scam">Online Job Scam</option>
            <option value="Sextortion">Sextortion</option>
            <option value="Loan App Fraud">Loan App Fraud</option>
            <option value="Credit Card Fraud">Credit Card Fraud</option>
            <option value="Debit Card Fraud">Debit Card Fraud</option>
            <option value="Online Shopping Fraud">Online Shopping Fraud</option>
            <option value="Social Media Fraud">Social Media Fraud</option>
            <option value="Investment Scam">Investment Scam</option>
            <option value="Romance Scam">Romance Scam</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Amount Lost (₹)
            </label>
            <input
              type="number"
              placeholder="0.00"
              value={form.amountLost}
              onChange={(e) => setForm({ ...form, amountLost: e.target.value })}
              min="0"
              step="0.01"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Transaction ID / Reference No.
            </label>
            <input
              type="text"
              placeholder="From UPI, bank, or card statement"
              value={form.transactionId}
              onChange={(e) => setForm({ ...form, transactionId: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bank Name
            </label>
            <input
              type="text"
              placeholder="e.g., SBI, HDFC, ICICI"
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Wallet / Payment App
            </label>
            <input
              type="text"
              placeholder="e.g., Paytm, PhonePe, Google Pay"
              value={form.walletName}
              onChange={(e) => setForm({ ...form, walletName: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="mt-6 border-t border-amber-200 pt-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">👤 Scammer Account Details</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Number
              </label>
              <input
                type="text"
                placeholder="Scammer's account number"
                value={form.scammerAccountNumber}
                onChange={(e) => setForm({ ...form, scammerAccountNumber: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                IFSC Code
              </label>
              <input
                type="text"
                placeholder="Bank IFSC code"
                value={form.scammerIFSC}
                onChange={(e) => setForm({ ...form, scammerIFSC: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                UPI ID
              </label>
              <input
                type="text"
                placeholder="e.g., scammer@paytm"
                value={form.scammerUPIId}
                onChange={(e) => setForm({ ...form, scammerUPIId: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mode of Fraud
            </label>
            <select
              value={form.modeOfFraud}
              onChange={(e) => setForm({ ...form, modeOfFraud: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            >
              <option value="">Select Mode</option>
              <option value="Phone Call">Phone Call</option>
              <option value="SMS/WhatsApp Link">SMS/WhatsApp Link</option>
              <option value="Fake Website">Fake Website</option>
              <option value="Social Media">Social Media</option>
              <option value="Mobile App">Mobile App</option>
              <option value="Email">Email</option>
              <option value="In-Person">In-Person</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Device / Platform
            </label>
            <select
              value={form.devicePlatform}
              onChange={(e) => setForm({ ...form, devicePlatform: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            >
              <option value="">Select Platform</option>
              <option value="Android Phone">Android Phone</option>
              <option value="iPhone (iOS)">iPhone (iOS)</option>
              <option value="Laptop/Desktop">Laptop/Desktop</option>
              <option value="Website">Website</option>
              <option value="Tablet">Tablet</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Complaint Description <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Explain what happened, how you were contacted, and what action you already took."
            value={form.complaintDescription}
            onChange={(e) => setForm({ ...form, complaintDescription: e.target.value })}
            rows={6}
            required
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
          />
          <p className="mt-1 hidden text-xs text-gray-500 sm:block">Share the key sequence clearly so the case can be reviewed faster.</p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-200 sm:w-auto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Personal Details</span>
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-amber-600 hover:to-yellow-600 hover:shadow-xl sm:w-auto"
        >
          <span>Next: Upload Evidence</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
