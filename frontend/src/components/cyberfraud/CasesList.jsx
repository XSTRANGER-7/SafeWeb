import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../../firebase.js";
import EvidenceFilesList from "./EvidenceFilesList.jsx";
import { useI18n } from "../../../i18n/index.jsx";

export default function CasesList({ user, profile, onSwitchToFile }) {
  const { locale, formatCurrency, translateText: tt } = useI18n();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCase, setExpandedCase] = useState(null);
  const formatDate = (value) => (value ? new Date(value).toLocaleDateString(locale) : tt('N/A'));
  const formatDateTime = (value) => (value ? new Date(value).toLocaleString(locale) : tt('N/A'));

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let q;
    if (profile?.role === 'normal' || !profile?.role) {
      q = query(collection(db, 'cases'), where('victimUid', '==', user.uid));
    } else if (profile?.role === 'police' || profile?.role === 'bank') {
      q = query(collection(db, 'cases'));
    }

    if (!q) {
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr = [];
        snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
        arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setCases(arr);
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
            alert(`${tt('Firestore index required. Visit:')} ${indexUrl}`);
            window.open(indexUrl, '_blank');
          }
        }
      }
    );
    return () => unsub();
  }, [user, profile]);

  const getStatusConfig = (status) => {
    const configs = {
      Pending: {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-300',
        icon: '⏳',
        dot: 'bg-amber-500',
        description: tt('Your complaint has been received and is awaiting review')
      },
      'In Process': {
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-300',
        icon: '🔄',
        dot: 'bg-blue-500',
        description: tt('Your complaint is being investigated by authorities')
      },
      'Funds Frozen': {
        bg: 'bg-violet-50',
        text: 'text-violet-800',
        border: 'border-violet-300',
        icon: '🔒',
        dot: 'bg-violet-500',
        description: tt('Funds have been frozen pending investigation')
      },
      Refunded: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-300',
        icon: '✅',
        dot: 'bg-emerald-500',
        description: tt('Amount has been refunded to your account')
      },
      Closed: {
        bg: 'bg-gray-50',
        text: 'text-gray-800',
        border: 'border-gray-300',
        icon: '✔️',
        dot: 'bg-gray-500',
        description: tt('Case has been closed')
      }
    };
    return configs[status] || configs['Pending'];
  };

  const getStatusProgress = (status) => {
    const progress = {
      Pending: 20,
      'In Process': 50,
      'Funds Frozen': 70,
      Refunded: 90,
      Closed: 100
    };
    return progress[status] || 20;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-amber-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{tt('Loading cases...')}</p>
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Cases Found</h3>
        <p className="text-gray-500 mb-4">
          {profile?.role === 'normal' || !profile?.role
            ? tt("You haven't filed any complaints yet.")
            : tt('No cases available at the moment.')}
        </p>
        {profile?.role === 'normal' || !profile?.role ? (
          <button
            onClick={onSwitchToFile}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {tt('File Your First Complaint')}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800">{cases.length}</div>
          <div className="text-sm text-gray-600 font-medium">Total Cases</div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl shadow-md border border-amber-200 p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">⏳</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-700">
            {cases.filter((c) => c.status === 'Pending').length}
          </div>
          <div className="text-sm text-gray-600 font-medium">Pending</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-md border border-blue-200 p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🔄</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-700">
            {cases.filter((c) => c.status === 'In Process').length}
          </div>
          <div className="text-sm text-gray-600 font-medium">In Process</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl shadow-md border border-emerald-200 p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">✅</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-700">
            {cases.filter((c) => c.status === 'Refunded' || c.status === 'Closed').length}
          </div>
          <div className="text-sm text-gray-600 font-medium">Resolved</div>
        </div>
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        {cases.map((c) => {
          const statusConfig = getStatusConfig(c.status);
          const progress = getStatusProgress(c.status);
          const isExpanded = expandedCase === c.id;

          return (
            <div
              key={c.id || c.caseId}
              className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* Case Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 ${statusConfig.bg} rounded-xl flex items-center justify-center text-2xl`}>
                        {statusConfig.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-gray-900">{c.fraudType || 'Unknown Fraud'}</h3>
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 ${statusConfig.border} ${statusConfig.bg} ${statusConfig.text} flex items-center gap-1.5`}>
                            <span className={`w-2 h-2 ${statusConfig.dot} rounded-full`}></span>
                            {c.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 font-mono">Case ID: {c.caseId}</p>
                      </div>
                    </div>

                    {/* Status Description */}
                    <div className={`${statusConfig.bg} border-l-4 ${statusConfig.border} p-3 rounded-r-lg mb-4`}>
                      <p className={`text-sm font-medium ${statusConfig.text}`}>{statusConfig.description}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-600">Case Progress</span>
                        <span className="text-xs font-bold text-amber-600">{progress}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Filed On
                        </div>
                        <p className="text-sm font-semibold text-gray-800">{formatDate(c.createdAt)}</p>
                      </div>

                      {c.transactions && c.transactions[0] && (
                        <div className="bg-amber-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Amount Lost
                          </div>
                          <p className="text-sm font-bold text-amber-700">{formatCurrency(c.transactions[0].amount || 0)}</p>
                        </div>
                      )}

                      {c.location && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            Location
                          </div>
                          <p className="text-sm font-semibold text-gray-800 truncate">{c.location}</p>
                        </div>
                      )}

                      {(profile?.role === 'police' || profile?.role === 'bank') && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Victim
                          </div>
                          <p className="text-sm font-semibold text-gray-800 truncate">{c.victimName || 'Unknown'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable Details */}
                <button
                  onClick={() => setExpandedCase(isExpanded ? null : c.id)}
                  className="w-full flex items-center justify-between text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                >
                  <span>{isExpanded ? 'Hide Details' : 'View Full Details'}</span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50 p-6 space-y-6">
                  {c.description && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Complaint Description
                      </h4>
                      <p className="text-sm text-gray-700 bg-white p-4 rounded-lg border border-gray-200">{c.description}</p>
                    </div>
                  )}

                  {c.transactions && c.transactions[0] && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Transaction Details
                      </h4>
                      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-gray-500">Amount Lost</span>
                            <p className="text-lg font-bold text-amber-700 mt-1">{formatCurrency(c.transactions[0].amount || 0)}</p>
                          </div>
                          {c.transactions[0].txnId && (
                            <div>
                              <span className="text-xs text-gray-500">Transaction ID</span>
                              <p className="text-sm font-mono text-gray-800 mt-1 break-all">{c.transactions[0].txnId}</p>
                            </div>
                          )}
                          {c.bankName && (
                            <div>
                              <span className="text-xs text-gray-500">Bank Name</span>
                              <p className="text-sm font-semibold text-gray-800 mt-1">{c.bankName}</p>
                            </div>
                          )}
                          {c.walletName && (
                            <div>
                              <span className="text-xs text-gray-500">Wallet/Payment App</span>
                              <p className="text-sm font-semibold text-gray-800 mt-1">{c.walletName}</p>
                            </div>
                          )}
                        </div>
                        {c.scammerAccountNumber && (
                          <div className="pt-3 border-t border-gray-200">
                            <span className="text-xs text-gray-500">Scammer Account Details</span>
                            <div className="mt-2 space-y-1">
                              {c.scammerAccountNumber && (
                                <p className="text-sm text-gray-800"><span className="font-semibold">Account:</span> {c.scammerAccountNumber}</p>
                              )}
                              {c.scammerIFSC && (
                                <p className="text-sm text-gray-800"><span className="font-semibold">IFSC:</span> {c.scammerIFSC}</p>
                              )}
                              {c.scammerUPIId && (
                                <p className="text-sm text-gray-800"><span className="font-semibold">UPI ID:</span> {c.scammerUPIId}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Case Timeline */}
                  {(profile?.role === 'normal' || !profile?.role) && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Case Timeline & Progress
                      </h4>
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        {c.timeline && c.timeline.length > 0 ? (
                          <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-300"></div>
                            <div className="space-y-6">
                              {c.timeline.map((item, idx) => (
                                <div key={idx} className="relative flex items-start gap-4">
                                  <div className="relative z-10 flex-shrink-0">
                                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  </div>
                                  <div className="flex-1 pt-1">
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                      <p className="text-base font-bold text-gray-900 mb-1">{item.status || item.event}</p>
                                      <p className="text-sm text-gray-700 mb-2">{item.note || item.description}</p>
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>
                                          {item.at ? formatDateTime(item.at) : item.timestamp ? formatDateTime(item.timestamp) : 'N/A'}
                                        </span>
                                        {item.by && (
                                          <>
                                            <span>•</span>
                                            <span>by {item.by}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-gray-500">No timeline updates yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Evidence Files */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Evidence Files
                    </h4>
                    <EvidenceFilesList caseId={c.id} evidenceMetadata={c.evidence || []} />
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
