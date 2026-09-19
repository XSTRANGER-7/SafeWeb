import React from "react";
import { validateFile } from "./helpers.js";

export default function EvidenceSection({
  form,
  files,
  setFiles,
  selectedAttachments,
  aadhaarDocumentFile,
  locationData,
  gettingLocation,
  locationError,
  locationPermissionDenied,
  getCurrentLocation,
  termsAccepted,
  setTermsAccepted,
  submitting,
  getFileValidationErrorMessage,
  getInvalidFilesMessage,
  setMessage,
  formatCurrency,
  onPrev
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="mb-6 hidden rounded-r-lg border-l-4 border-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50 py-4 pl-6 sm:block">
        <div className="flex items-center gap-3 mb-2">
          <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <h4 className="text-xl font-bold text-gray-900">Documents & Review</h4>
        </div>
        <p className="text-sm text-gray-600">
          Upload valid supporting documents, confirm location access, and review the complaint before final submission.
        </p>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 space-y-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Supporting Documents
            </label>
            <div className="mb-3 rounded-2xl border border-blue-100 bg-blue-50/80 p-3 text-xs text-blue-900">
              Upload screenshots, statements, chats, or emails. Each file can be up to 750 KB.
            </div>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-amber-200 bg-amber-50/70 p-5 text-center transition hover:border-amber-300 hover:bg-amber-50">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.txt,application/pdf,image/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={(e) => {
                  const selectedFiles = Array.from(e.target.files || []);
                  const validFiles = [];
                  const errors = [];

                  selectedFiles.forEach((file) => {
                    const validation = validateFile(file);
                    if (validation.valid) {
                      validFiles.push(file);
                    } else {
                      errors.push(`${file.name}: ${getFileValidationErrorMessage(validation)}`);
                    }
                  });

                  if (errors.length > 0) {
                    setMessage({
                      type: 'error',
                      text: getInvalidFilesMessage(errors)
                    });
                    setTimeout(() => setMessage({ type: '', text: '' }), 8000);
                  }

                  setFiles(validFiles);
                }}
                className="hidden"
              />
              <svg className="h-10 w-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-3 text-sm font-semibold text-gray-900">Tap to upload documents</p>
              <p className="mt-1 text-xs text-gray-600">PDF, image, DOC/DOCX, or TXT</p>
            </label>

            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  {files.length} supporting file(s) selected
                </p>
                <div className="max-h-36 space-y-1 overflow-y-auto">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <svg className="h-4 w-4 flex-shrink-0 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="truncate text-xs text-gray-800">{file.name}</span>
                      </div>
                      <span className="ml-2 text-xs text-gray-600">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Identity Proof</p>
            {aadhaarDocumentFile ? (
              <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                <p className="font-semibold">Aadhaar card attached</p>
                <p className="mt-1 break-all text-xs">{aadhaarDocumentFile.name}</p>
                <p className="mt-2 text-xs">{(aadhaarDocumentFile.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
                Scan or upload an Aadhaar card in the first section to auto-fill details and attach the image here.
              </div>
            )}
            <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
              <p className="font-semibold text-gray-900">Ready attachments</p>
              <p className="mt-1 text-xs text-gray-600">{selectedAttachments.length} file(s) will be submitted with this complaint.</p>
            </div>
          </div>
        </div>

        {/* Location Capture */}
        <div className="border border-amber-200 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 bg-amber-50">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h4 className="text-sm font-bold text-gray-800">📍 Location Access (Required)</h4>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Your location is required to file a complaint. This helps authorities verify and process your complaint.
            </p>
            {gettingLocation ? (
              <div className="flex items-center gap-2 text-sm text-amber-700">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Getting your location...
              </div>
            ) : locationData.latitude && locationData.longitude ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-sm">Location captured successfully</span>
                </div>
                <div className="text-xs text-gray-700 space-y-1">
                  <p>Latitude: <span className="font-mono">{locationData.latitude.toFixed(6)}</span></p>
                  <p>Longitude: <span className="font-mono">{locationData.longitude.toFixed(6)}</span></p>
                  {locationData.accuracy && (
                    <p>Accuracy: ±{Math.round(locationData.accuracy)} meters</p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {locationError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
                    <p className="text-xs text-red-700 mb-2">{locationError}</p>
                    {locationPermissionDenied && (
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                        <p className="font-semibold mb-1">How to enable location access:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Click the lock icon (🔒) in your browser's address bar</li>
                          <li>Select "Allow" for Location permissions</li>
                          <li>Or go to your browser settings → Privacy → Location → Allow for this site</li>
                          <li>Then click "Get My Location" button again</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {gettingLocation ? 'Getting location...' : locationPermissionDenied ? 'Try Again - Get My Location' : 'Get My Location'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="rounded-2xl border border-amber-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="termsCheckbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 w-5 h-5 text-amber-600 border-amber-300 rounded focus:ring-amber-500 focus:ring-2"
              required
            />
            <label htmlFor="termsCheckbox" className="flex-1 text-sm text-gray-700 cursor-pointer">
              <span className="font-semibold">I accept the Terms and Conditions</span>
              <span className="text-red-500 ml-1">*</span>
              <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-gray-600">
                <p>I confirm the complaint details are accurate.</p>
                <p className="mt-1">I allow the authorities to use the attached information and location for verification.</p>
                <p className="mt-1">I understand officials may contact me on the shared phone number or email.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Summary Card */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="mb-2 text-sm text-gray-700">
            <span className="font-semibold">Summary:</span> Review before submit
          </p>
          <div className="space-y-1 text-xs text-gray-600">
            <p>Name: {form.fullName || 'Not provided'}</p>
            <p>Contact: {form.contactNumber || 'Not provided'}</p>
            <p>Incident Type: {form.incidentType || 'Not provided'}</p>
            <p>Amount Lost: {form.amountLost ? formatCurrency(form.amountLost) : 'Not specified'}</p>
            <p>Aadhaar Attached: {aadhaarDocumentFile ? 'Yes' : 'No'}</p>
            <p>Total Attachments: {selectedAttachments.length}</p>
            <p>Location: {locationData.latitude ? 'Captured' : 'Not captured'}</p>
            <p>Terms Accepted: {termsAccepted ? 'Yes' : 'No'}</p>
          </div>
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
          <span>Back to Incident Details</span>
        </button>
        <button
          type="submit"
          disabled={submitting || !termsAccepted || !locationData.latitude || !locationData.longitude}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-amber-600 hover:to-yellow-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {submitting ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Submit Complaint</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
