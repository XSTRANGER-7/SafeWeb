import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../../firebase.js";
import EvidenceFilesList from "./EvidenceFilesList.jsx";
import { useI18n } from "../../../i18n/index.jsx";

function getStatusConfig(status) {
  const configs = {
    Pending: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-300',
      dot: 'bg-amber-500',
      label: 'P',
      description: 'Your complaint has been received and is awaiting review'
    },
    'In Process': {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-300',
      dot: 'bg-blue-500',
      label: 'I',
      description: 'Your complaint is being investigated by authorities'
    },
    'Funds Frozen': {
      bg: 'bg-violet-50',
      text: 'text-violet-800',
      border: 'border-violet-300',
      dot: 'bg-violet-500',
      label: 'F',
      description: 'Funds have been frozen pending investigation'
    },
    Refunded: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-300',
      dot: 'bg-emerald-500',
      label: 'R',
      description: 'Amount has been refunded to your account'
    },
    Closed: {
      bg: 'bg-gray-50',
      text: 'text-gray-800',
      border: 'border-gray-300',
      dot: 'bg-gray-500',
      label: 'C',
      description: 'Case has been closed'
    }
  };

  return configs[status] || configs.Pending;
}

function getStatusProgress(status) {
  const progress = {
    Pending: 20,
    'In Process': 50,
    'Funds Frozen': 70,
    Refunded: 90,
    Closed: 100
  };

  return progress[status] || 20;
}

export default function CasesList({ user, profile, onSwitchToFile }) {
  const { locale, formatCurrency } = useI18n();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCase, setExpandedCase] = useState(null);
  const formatDate = (value) => (value ? new Date(value).toLocaleDateString(locale) : 'N/A');
  const formatDateTime = (value) => (value ? new Date(value).toLocaleString(locale) : 'N/A');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let casesQuery;

    if (profile?.role === 'normal' || !profile?.role) {
      casesQuery = query(collection(db, 'cases'), where('victimUid', '==', user.uid));
    } else if (profile?.role === 'police' || profile?.role === 'bank') {
      casesQuery = query(collection(db, 'cases'));
    }

    if (!casesQuery) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      casesQuery,
      (snapshot) => {
        const nextCases = [];
        snapshot.forEach((doc) => nextCases.push({ id: doc.id, ...doc.data() }));
        nextCases.sort((first, second) => (second.createdAt || 0) - (first.createdAt || 0));
        setCases(nextCases);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching cases:', error);
        setLoading(false);
        if (error.code === 'permission-denied') {
          console.warn('Permission denied. Please check Firestore security rules.');
        } else if (error.code === 'failed-precondition') {
          const indexUrl = error.message?.match(/https:\/\/[^\s]+/)?.[0];
          if (indexUrl) {
            alert(`Firestore index required. Visit: ${indexUrl}`);
            window.open(indexUrl, '_blank');
          }
        }
      }
    );

    return () => unsubscribe();
  }, [profile, user]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xl">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-4 border-t-4 border-amber-600"></div>
        <p className="text-gray-600">Loading cases...</p>
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-yellow-100">
          <svg className="h-10 w-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="mb-2 text-xl font-semibold text-gray-800">No Cases Found</h3>
        <p className="mb-4 text-gray-500">
          {profile?.role === 'normal' || !profile?.role
            ? "You haven't filed any complaints yet."
            : 'No cases available at the moment.'}
        </p>
        {profile?.role === 'normal' || !profile?.role ? (
          <button
            onClick={onSwitchToFile}
            className="rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-amber-600 hover:to-yellow-600 hover:shadow-xl"
          >
            File Your First Complaint
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5 shadow-md transition-shadow hover:shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800">{cases.length}</div>
          <div className="text-sm font-medium text-gray-600">Total Cases</div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-md transition-shadow hover:shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-sm font-bold text-amber-700">P</div>
          </div>
          <div className="text-3xl font-bold text-amber-700">{cases.filter((item) => item.status === 'Pending').length}</div>
          <div className="text-sm font-medium text-gray-600">Pending</div>
        </div>
        <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-md transition-shadow hover:shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700">I</div>
          </div>
          <div className="text-3xl font-bold text-blue-700">{cases.filter((item) => item.status === 'In Process').length}</div>
          <div className="text-sm font-medium text-gray-600">In Process</div>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-md transition-shadow hover:shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700">R</div>
          </div>
          <div className="text-3xl font-bold text-emerald-700">
            {cases.filter((item) => item.status === 'Refunded' || item.status === 'Closed').length}
          </div>
          <div className="text-sm font-medium text-gray-600">Resolved</div>
        </div>
      </div>

      <div className="space-y-4">
        {cases.map((currentCase) => {
          const statusConfig = getStatusConfig(currentCase.status);
          const progress = getStatusProgress(currentCase.status);
          const isExpanded = expandedCase === currentCase.id;

          return (
            <div
              key={currentCase.id || currentCase.caseId}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:shadow-lg"
            >
              <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-3 flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-base font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                        {statusConfig.label}
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-3">
                          <h3 className="text-xl font-bold text-gray-900">{currentCase.fraudType || 'Unknown Fraud'}</h3>
                          <span className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-bold ${statusConfig.border} ${statusConfig.bg} ${statusConfig.text}`}>
                            <span className={`h-2 w-2 rounded-full ${statusConfig.dot}`}></span>
                            {currentCase.status}
                          </span>
                        </div>
                        <p className="font-mono text-sm text-gray-500">Case ID: {currentCase.caseId}</p>
                      </div>
                    </div>

                    <div className={`${statusConfig.bg} ${statusConfig.border} mb-4 rounded-r-lg border-l-4 p-3`}>
                      <p className={`text-sm font-medium ${statusConfig.text}`}>{statusConfig.description}</p>
                    </div>

                    <div className="mb-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600">Case Progress</span>
                        <span className="text-xs font-bold text-amber-600">{progress}%</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-1000 ease-out"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="rounded-lg bg-gray-50 p-3">
                        <div className="mb-1 flex items-center gap-1 text-xs text-gray-500">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Filed On
                        </div>
                        <p className="text-sm font-semibold text-gray-800">
                          {formatDate(currentCase.createdAt)}
                        </p>
                      </div>
                      {currentCase.transactions && currentCase.transactions[0] && (
                        <div className="rounded-lg bg-amber-50 p-3">
                          <div className="mb-1 flex items-center gap-1 text-xs text-gray-500">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Amount Lost
                          </div>
                          <p className="text-sm font-bold text-amber-700">{formatCurrency(currentCase.transactions[0].amount || 0)}</p>
                        </div>
                      )}
                      {currentCase.location && (
                        <div className="rounded-lg bg-gray-50 p-3">
                          <div className="mb-1 flex items-center gap-1 text-xs text-gray-500">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            Location
                          </div>
                          <p className="truncate text-sm font-semibold text-gray-800">{currentCase.location}</p>
                        </div>
                      )}
                      {(profile?.role === 'police' || profile?.role === 'bank') && (
                        <div className="rounded-lg bg-gray-50 p-3">
                          <div className="mb-1 flex items-center gap-1 text-xs text-gray-500">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Victim
                          </div>
                          <p className="truncate text-sm font-semibold text-gray-800">{currentCase.victimName || 'Unknown'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedCase(isExpanded ? null : currentCase.id)}
                  className="flex w-full items-center justify-between text-sm font-semibold text-amber-600 transition-colors hover:text-amber-700"
                >
                  <span>{isExpanded ? 'Hide Details' : 'View Full Details'}</span>
                  <svg
                    className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {isExpanded && (
                <div className="space-y-6 border-t border-gray-200 bg-gray-50 p-6">
                  {currentCase.description && (
                    <div>
                      <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-700">
                        <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Complaint Description
                      </h4>
                      <p className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">{currentCase.description}</p>
                    </div>
                  )}

                  {currentCase.transactions && currentCase.transactions[0] && (
                    <div>
                      <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700">
                        <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Transaction Details
                      </h4>
                      <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <span className="text-xs text-gray-500">Amount Lost</span>
                            <p className="mt-1 text-lg font-bold text-amber-700">Rs. {currentCase.transactions[0].amount || 0}</p>
                          </div>
                          {currentCase.transactions[0].txnId && (
                            <div>
                              <span className="text-xs text-gray-500">Transaction ID</span>
                              <p className="mt-1 break-all font-mono text-sm text-gray-800">{currentCase.transactions[0].txnId}</p>
                            </div>
                          )}
                          {currentCase.bankName && (
                            <div>
                              <span className="text-xs text-gray-500">Bank Name</span>
                              <p className="mt-1 text-sm font-semibold text-gray-800">{currentCase.bankName}</p>
                            </div>
                          )}
                          {currentCase.walletName && (
                            <div>
                              <span className="text-xs text-gray-500">Wallet/Payment App</span>
                              <p className="mt-1 text-sm font-semibold text-gray-800">{currentCase.walletName}</p>
                            </div>
                          )}
                        </div>
                        {currentCase.scammerAccountNumber && (
                          <div className="border-t border-gray-200 pt-3">
                            <span className="text-xs text-gray-500">Scammer Account Details</span>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-gray-800"><span className="font-semibold">Account:</span> {currentCase.scammerAccountNumber}</p>
                              {currentCase.scammerIFSC && (
                                <p className="text-sm text-gray-800"><span className="font-semibold">IFSC:</span> {currentCase.scammerIFSC}</p>
                              )}
                              {currentCase.scammerUPIId && (
                                <p className="text-sm text-gray-800"><span className="font-semibold">UPI ID:</span> {currentCase.scammerUPIId}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(profile?.role === 'normal' || !profile?.role) && (
                    <div>
                      <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-700">
                        <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Case Timeline & Progress
                      </h4>
                      <div className="rounded-lg border border-gray-200 bg-white p-6">
                        {currentCase.timeline && currentCase.timeline.length > 0 ? (
                          <div className="relative">
                            <div className="absolute bottom-0 left-4 top-0 w-0.5 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-300"></div>
                            <div className="space-y-6">
                              {currentCase.timeline.map((item, index) => (
                                <div key={index} className="relative flex items-start gap-4">
                                  <div className="relative z-10 flex-shrink-0">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg">
                                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  </div>
                                  <div className="flex-1 pt-1">
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                      <p className="mb-1 text-base font-bold text-gray-900">{item.status || item.event}</p>
                                      <p className="mb-2 text-sm text-gray-700">{item.note || item.description}</p>
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>
                                          {item.at ? formatDateTime(item.at) : item.timestamp ? formatDateTime(item.timestamp) : 'N/A'}
                                        </span>
                                        {item.by ? <span>by {item.by}</span> : null}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="py-8 text-center">
                            <svg className="mx-auto mb-3 h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-gray-500">No timeline updates yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700">
                      <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Evidence Files
                    </h4>
                    <EvidenceFilesList caseId={currentCase.id} evidenceMetadata={currentCase.evidence || []} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
