import React from "react";
import { AADHAAR_SCAN_ACCEPT, AADHAAR_OCR_INITIAL_STATE } from "./helpers.js";

export default function AadhaarCardScanner({
  aadhaarOcr,
  setAadhaarOcr,
  aadhaarDocumentFile,
  setAadhaarDocumentFile,
  handleAadhaarScan
}) {
  return (
    <div className="mb-6 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30 p-3.5 sm:p-5 shadow-xs">
      <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
        {/* Aadhaar Image Preview */}
        <div className="w-full md:w-64 lg:w-72 shrink-0">
          <div className="relative overflow-hidden rounded-xl border-2 border-amber-200/80 bg-white p-2 shadow-xs transition hover:shadow-sm">
            <img
              src={aadhaarOcr.previewUrl || '/mock_aadhaar.webp'}
              alt="Aadhaar Card Preview"
              className="h-36 sm:h-42 w-full rounded-lg object-contain"
            />
            {aadhaarDocumentFile && (
              <div className="absolute top-3 right-3 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow">
                ✓ Attached
              </div>
            )}
          </div>
        </div>

        {/* Actions & Status */}
        <div className="flex-1 w-full flex flex-col justify-center">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 text-white shadow-xs">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            </div>
            <div>
              <h5 className="text-base sm:text-lg font-bold text-gray-900">Aadhaar Card</h5>
            </div>
          </div>

          {/* Two Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-2.5 sm:py-3 px-5 text-sm font-semibold text-white shadow-sm shadow-amber-500/20 transition hover:from-amber-600 hover:to-yellow-600 hover:shadow active:scale-[0.98]">
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Aadhaar
              <input
                type="file"
                accept={AADHAAR_SCAN_ACCEPT}
                onChange={handleAadhaarScan}
                className="hidden"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-2.5 sm:py-3 px-5 text-sm font-semibold text-gray-700 shadow-2xs transition hover:border-gray-400 hover:bg-gray-50 active:scale-[0.98]">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Camera Scan
              <input
                type="file"
                accept={AADHAAR_SCAN_ACCEPT}
                capture="environment"
                onChange={handleAadhaarScan}
                className="hidden"
              />
            </label>
          </div>

          {/* Progress Bar when reading */}
          {aadhaarOcr.loading && (
            <div className="mt-3 pt-2.5 border-t border-amber-200/60">
              <div className="mb-1 flex items-center justify-between text-xs font-semibold text-amber-700">
                <span>Reading card...</span>
                <span>{aadhaarOcr.progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-amber-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-300"
                  style={{ width: `${aadhaarOcr.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error message */}
          {aadhaarOcr.error && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs sm:text-sm font-medium text-red-700">
              {aadhaarOcr.error}
            </div>
          )}

          {/* Attached file status */}
          {aadhaarDocumentFile && !aadhaarOcr.loading && (
            <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/90 px-3.5 py-2 text-xs sm:text-sm font-semibold text-emerald-800">
              <div className="flex items-center gap-2 truncate">
                <svg className="h-4 w-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="truncate">Aadhaar attached: {aadhaarDocumentFile.name}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAadhaarDocumentFile(null);
                  setAadhaarOcr(AADHAAR_OCR_INITIAL_STATE);
                }}
                className="ml-2 shrink-0 text-xs sm:text-sm font-semibold text-emerald-700 hover:text-red-600 transition"
              >
                ✕ Remove
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
