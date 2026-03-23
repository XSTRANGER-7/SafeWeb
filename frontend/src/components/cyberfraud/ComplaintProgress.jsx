import React from "react";

export default function ComplaintProgress({ currentSection, sectionCompletion, moveToSection }) {
  return (
    <>
      <div className="sticky top-2 z-20 mb-8 hidden rounded-[28px] border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur md:block">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
              Step {currentSection} of 3
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {currentSection === 1
                ? 'Verify your identity and personal details'
                : currentSection === 2
                  ? 'Capture incident information and financial details'
                  : 'Upload documents, confirm terms, and submit'}
            </p>
          </div>
          <div className="hidden rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 sm:block">
            Auto-saved draft
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => moveToSection(1)}
            className={`flex min-w-max items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all sm:px-5 ${
              currentSection === 1
                ? 'border-transparent bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg'
                : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            1. Personal Details
          </button>
          <div className={`hidden h-1.5 flex-1 rounded-full transition-all duration-300 md:block ${currentSection >= 2 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : 'bg-amber-200'}`}></div>
          <button
            type="button"
            onClick={() => moveToSection(2)}
            className={`flex min-w-max items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all sm:px-5 ${
              currentSection === 2
                ? 'border-transparent bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg'
                : sectionCompletion[1]
                  ? 'border-amber-200 bg-amber-100 text-amber-800'
                  : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            2. Incident Details
          </button>
          <div className={`hidden h-1.5 flex-1 rounded-full transition-all duration-300 md:block ${currentSection >= 3 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : 'bg-amber-200'}`}></div>
          <button
            type="button"
            onClick={() => moveToSection(3)}
            className={`flex min-w-max items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all sm:px-5 ${
              currentSection === 3
                ? 'border-transparent bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg'
                : sectionCompletion[2]
                  ? 'border-amber-200 bg-amber-100 text-amber-800'
                  : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            3. Documents & Review
          </button>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6 md:hidden">
        <button
          type="button"
          onClick={() => moveToSection(1)}
          className="flex w-full items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-sm font-bold text-white">
              1
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Personal Details</p>
              <p className="text-xs text-gray-500">PAN scan and identity check</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
              {currentSection === 1 ? 'Open' : sectionCompletion[1] ? 'Done' : 'Start'}
            </span>
            <svg className={`h-4 w-4 text-amber-700 transition-transform ${currentSection === 1 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        <button
          type="button"
          onClick={() => moveToSection(2)}
          className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold ${currentSection === 2 ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white' : sectionCompletion[1] ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-400'}`}>
              2
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Incident Details</p>
              <p className="text-xs text-gray-500">Timeline, amount, and complaint summary</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${currentSection === 2 ? 'bg-amber-50 text-amber-700' : sectionCompletion[2] ? 'bg-green-50 text-green-700' : sectionCompletion[1] ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
              {currentSection === 2 ? 'Open' : sectionCompletion[2] ? 'Done' : sectionCompletion[1] ? 'Next' : 'Locked'}
            </span>
            <svg className={`h-4 w-4 transition-transform ${currentSection === 2 ? 'rotate-180 text-amber-700' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        <button
          type="button"
          onClick={() => moveToSection(3)}
          className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold ${currentSection === 3 ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white' : sectionCompletion[2] ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-400'}`}>
              3
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Documents & Review</p>
              <p className="text-xs text-gray-500">Attach proof, capture location, submit</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${currentSection === 3 ? 'bg-amber-50 text-amber-700' : sectionCompletion[3] ? 'bg-green-50 text-green-700' : sectionCompletion[2] ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
              {currentSection === 3 ? 'Open' : sectionCompletion[3] ? 'Done' : sectionCompletion[2] ? 'Next' : 'Locked'}
            </span>
            <svg className={`h-4 w-4 transition-transform ${currentSection === 3 ? 'rotate-180 text-amber-700' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      </div>
    </>
  );
}
