import React from "react";
import AadhaarCardScanner from "./AadhaarCardScanner.jsx";
import { AADHAAR_SCAN_ACCEPT } from "./helpers.js";

export default function PersonalDetailsSection({
  form,
  setForm,
  aadhaarOcr,
  setAadhaarOcr,
  aadhaarDocumentFile,
  setAadhaarDocumentFile,
  handleAadhaarScan,
  onNext
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="mb-6 hidden rounded-r-lg border-l-4 border-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50 py-4 pl-6 sm:block">
        <div className="flex items-center gap-3 mb-2">
          <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h4 className="text-xl font-bold text-gray-900">Personal Information</h4>
        </div>
        <p className="text-sm text-gray-600">Review and verify your personal details.</p>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        {/* Aadhaar Card Section */}
        <AadhaarCardScanner
          aadhaarOcr={aadhaarOcr}
          setAadhaarOcr={setAadhaarOcr}
          aadhaarDocumentFile={aadhaarDocumentFile}
          setAadhaarDocumentFile={setAadhaarDocumentFile}
          handleAadhaarScan={handleAadhaarScan}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="As per Aadhaar Card"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="10-digit mobile number"
              value={form.contactNumber}
              onChange={(e) => setForm({ ...form, contactNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              required
              maxLength={10}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              For OTP verification and follow-ups
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="your.email@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              For acknowledgment and updates
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Gender
            </label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Age
            </label>
            <input
              type="number"
              placeholder="Your age"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              min="1"
              max="120"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Father's / Mother's Name
            </label>
            <input
              type="text"
              placeholder="For identity verification"
              value={form.fathersName}
              onChange={(e) => setForm({ ...form, fathersName: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Occupation
            </label>
            <input
              type="text"
              placeholder="e.g., Student, Engineer, Business"
              value={form.occupation}
              onChange={(e) => setForm({ ...form, occupation: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              Preferred Language
            </label>
            <select
              value={form.preferredLanguage}
              onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Odia">Odia</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Permanent Address
          </label>
          <textarea
            placeholder="Complete permanent address"
            value={form.permanentAddress}
            onChange={(e) => setForm({ ...form, permanentAddress: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Current Address
          </label>
          <textarea
            placeholder="Current residential address (if different from permanent)"
            value={form.currentAddress}
            onChange={(e) => setForm({ ...form, currentAddress: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
          />
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Leave blank if same as permanent address
          </p>
        </div>

        {/* Dedicated Aadhaar ID Proof Section */}
        <div className="border-t-2 border-amber-200 pt-6 mt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 text-white shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Identity Proof: Aadhaar Card</h4>
                <p className="text-xs text-gray-500">Government issued 12-digit identity verification</p>
              </div>
            </div>
            <span className="w-fit rounded-full bg-amber-100/70 border border-amber-200 px-3 py-1 text-[11px] font-semibold text-amber-800">
              UIDAI Verification
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Aadhaar Number (12-Digit)
              </label>
              <input
                type="text"
                placeholder="XXXX XXXX XXXX"
                value={form.idProofNumber}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
                  const formatted =
                    raw.length > 8
                      ? `${raw.slice(0, 4)} ${raw.slice(4, 8)} ${raw.slice(8, 12)}`
                      : raw.length > 4
                        ? `${raw.slice(0, 4)} ${raw.slice(4)}`
                        : raw;
                  setForm({ ...form, idProofType: 'Aadhaar Card', idProofNumber: formatted });
                }}
                maxLength={14}
                className="w-full font-mono tracking-wider px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-400 mt-1">Pre-filled automatically when you scan or upload your Aadhaar card</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Aadhaar Card Attachment
              </label>
              {aadhaarDocumentFile ? (
                <div className="flex items-center justify-between p-3 rounded-lg border-2 border-emerald-200 bg-emerald-50/60">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={aadhaarOcr.previewUrl || '/mock_aadhaar.webp'}
                      alt="Aadhaar preview"
                      className="h-10 w-14 rounded object-cover border border-emerald-300 shadow-xs"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-emerald-900 truncate">{aadhaarDocumentFile.name}</p>
                      <p className="text-[11px] text-emerald-700 font-medium">Ready for verification</p>
                    </div>
                  </div>
                  <label className="shrink-0 cursor-pointer text-xs font-semibold text-amber-700 hover:text-amber-800 underline ml-2">
                    Change
                    <input
                      type="file"
                      accept={AADHAAR_SCAN_ACCEPT}
                      onChange={handleAadhaarScan}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-amber-300 rounded-lg bg-amber-50/40 hover:bg-amber-50 text-amber-800 text-sm font-semibold cursor-pointer transition-colors">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>Upload / Attach Aadhaar Card</span>
                  <input
                    type="file"
                    accept={AADHAAR_SCAN_ACCEPT}
                    onChange={handleAadhaarScan}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={onNext}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-amber-600 hover:to-yellow-600 hover:shadow-xl sm:w-auto"
        >
          <span>Next: Incident Details</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
