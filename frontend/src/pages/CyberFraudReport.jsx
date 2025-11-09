import React, { useState, useEffect } from "react";
import { db } from "../../firebase.js";
import { collection, addDoc, doc, setDoc, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { useAuth } from "../context/AuthContext.jsx";
import { notifyNewComplaint } from "../utils/notifications.js";

// Allowed file types for evidence uploads
const ALLOWED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt']
};

const MAX_FILE_SIZE = 750 * 1024; // 750KB (Firestore document limit is 1MB, base64 increases size by ~33%)

function validateFile(file) {
  // Check file type
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  const isValidType = Object.values(ALLOWED_FILE_TYPES).some(extensions => 
    extensions.includes(fileExtension)
  ) || Object.keys(ALLOWED_FILE_TYPES).includes(file.type);
  
  if (!isValidType) {
    return { valid: false, error: `File type not allowed. Allowed types: PDF, Images (JPG, PNG, GIF, WEBP), Word (DOC, DOCX), TXT` };
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds 750KB limit. Your file is ${(file.size / 1024).toFixed(2)}KB` };
  }
  
  return { valid: true };
}

// Helper function to convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove data URL prefix (data:image/jpeg;base64,)
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

// Component to load and display evidence files from subcollection
function EvidenceFilesList({ caseId, evidenceMetadata }) {
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!caseId || !evidenceMetadata || evidenceMetadata.length === 0) {
      setEvidenceFiles([]);
      return;
    }

    // Load files from subcollection
    async function loadFiles() {
      setLoading(true);
      try {
        const evidenceCollection = collection(db, 'cases', caseId, 'evidence');
        const snapshot = await getDocs(evidenceCollection);
        const files = [];
        snapshot.forEach((doc) => {
          files.push({ id: doc.id, ...doc.data() });
        });
        setEvidenceFiles(files);
      } catch (error) {
        console.error('Error loading evidence files:', error);
        // Fallback: use metadata if subcollection fails
        setEvidenceFiles(evidenceMetadata.map((meta, idx) => ({ ...meta, id: idx })));
      } finally {
        setLoading(false);
      }
    }

    loadFiles();
  }, [caseId, evidenceMetadata]);

  if (loading) {
    return (
      <div className="pt-4 border-t border-amber-200">
        <span className="text-xs text-gray-500">Loading evidence files...</span>
      </div>
    );
  }

  if (!evidenceFiles || evidenceFiles.length === 0) {
    return null;
  }

  const handleDownload = (fileItem) => {
    try {
      const fileName = fileItem.name || 'file';
      const fileData = fileItem.data;
      const contentType = fileItem.contentType || 'application/octet-stream';

      // Handle URL format (old)
      if (typeof fileItem === 'string' || (fileItem.url && !fileData)) {
        window.open(fileItem.url || fileItem, '_blank');
        return;
      }

      // Handle base64 data
      if (fileData) {
        const byteCharacters = atob(fileData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: contentType });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  return (
    <div className="pt-4 border-t border-amber-200">
      <span className="text-xs text-gray-600 mb-2 block">📎 Evidence Files ({evidenceFiles.length})</span>
      <div className="flex flex-wrap gap-2">
        {evidenceFiles.map((fileItem, idx) => {
          const fileName = fileItem.name || `File ${idx + 1}`;
          const isUrl = typeof fileItem === 'string' || fileItem.url;
          
          if (isUrl) {
            return (
              <a
                key={fileItem.id || idx}
                href={fileItem.url || fileItem}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg text-xs text-amber-800 transition-colors"
                title={`Download ${fileName}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                📄 {fileName}
              </a>
            );
          }

          return (
            <button
              key={fileItem.id || idx}
              onClick={() => handleDownload(fileItem)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg text-xs text-amber-800 transition-colors cursor-pointer"
              title={`Download ${fileName}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              📄 {fileName}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Click files to download evidence (stored in Firestore subcollection)
      </p>
    </div>
  );
}

// Component to display cases list
function CasesList({ user, profile, onSwitchToFile }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCase, setExpandedCase] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let q;
    if (profile?.role === 'normal' || !profile?.role) {
      // Victims see only their own cases
      q = query(collection(db, 'cases'), where('victimUid', '==', user.uid));
    } else if (profile?.role === 'police') {
      // Police see all cases
      q = query(collection(db, 'cases'));
    } else if (profile?.role === 'bank') {
      // Bank sees all cases
      q = query(collection(db, 'cases'));
    }

    if (!q) {
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(q,
      (snap) => {
        const arr = [];
        snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
        // Sort by createdAt descending
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
            alert(`Firestore index required. Visit: ${indexUrl}`);
            window.open(indexUrl, '_blank');
          }
        }
      }
    );
    return () => unsub();
  }, [user, profile]);

  const getStatusConfig = (status) => {
    const configs = {
      'Pending': {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-300',
        icon: '⏳',
        dot: 'bg-amber-500',
        description: 'Your complaint has been received and is awaiting review'
      },
      'In Process': {
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-300',
        icon: '🔄',
        dot: 'bg-blue-500',
        description: 'Your complaint is being investigated by authorities'
      },
      'Funds Frozen': {
        bg: 'bg-violet-50',
        text: 'text-violet-800',
        border: 'border-violet-300',
        icon: '🔒',
        dot: 'bg-violet-500',
        description: 'Funds have been frozen pending investigation'
      },
      'Refunded': {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-300',
        icon: '✅',
        dot: 'bg-emerald-500',
        description: 'Amount has been refunded to your account'
      },
      'Closed': {
        bg: 'bg-gray-50',
        text: 'text-gray-800',
        border: 'border-gray-300',
        icon: '✔️',
        dot: 'bg-gray-500',
        description: 'Case has been closed'
      }
    };
    return configs[status] || configs['Pending'];
  };

  const getStatusProgress = (status) => {
    const progress = {
      'Pending': 20,
      'In Process': 50,
      'Funds Frozen': 70,
      'Refunded': 90,
      'Closed': 100
    };
    return progress[status] || 20;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-amber-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading cases...</p>
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
            ? "You haven't filed any complaints yet."
            : 'No cases available at the moment.'}
        </p>
        {profile?.role === 'normal' || !profile?.role ? (
          <button
            onClick={onSwitchToFile}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            File Your First Complaint
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
            {cases.filter(c => c.status === 'Pending').length}
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
            {cases.filter(c => c.status === 'In Process').length}
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
            {cases.filter(c => c.status === 'Refunded' || c.status === 'Closed').length}
          </div>
          <div className="text-sm text-gray-600 font-medium">Resolved</div>
        </div>
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        {cases.map((c, index) => {
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
                          className={`h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-1000 ease-out`}
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
                        <p className="text-sm font-semibold text-gray-800">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      {c.transactions && c.transactions[0] && (
                        <div className="bg-amber-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Amount Lost
                          </div>
                          <p className="text-sm font-bold text-amber-700">₹{c.transactions[0].amount || 0}</p>
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
                  {/* Description */}
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

                  {/* Transaction Details */}
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
                            <p className="text-lg font-bold text-amber-700 mt-1">₹{c.transactions[0].amount || 0}</p>
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

                  {/* Case Timeline - Enhanced */}
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
                            {/* Vertical Timeline Line */}
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-300"></div>
                            
                            <div className="space-y-6">
                              {c.timeline.map((item, idx) => {
                                const isLast = idx === c.timeline.length - 1;
                                return (
                                  <div key={idx} className="relative flex items-start gap-4">
                                    {/* Timeline Dot */}
                                    <div className="relative z-10 flex-shrink-0">
                                      <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                      </div>
                                    </div>
                                    
                                    {/* Timeline Content */}
                                    <div className="flex-1 pt-1">
                                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <p className="text-base font-bold text-gray-900 mb-1">{item.status || item.event}</p>
                                        <p className="text-sm text-gray-700 mb-2">{item.note || item.description}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          <span>
                                            {item.at ? new Date(item.at).toLocaleString() : item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}
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
                                );
                              })}
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

export default function CyberFraudReport({ user: userProp }) {
  const { user: userFromAuth, profile } = useAuth();
  const user = userProp || userFromAuth;
  const [viewMode, setViewMode] = useState('file'); // 'file' or 'track'
  const [currentSection, setCurrentSection] = useState(1); // 1: Personal, 2: Incident, 3: Evidence
  const [form, setForm] = useState({
    // Personal Details (Required)
    fullName: "",
    fathersName: "",
    mothersName: "",
    gender: "",
    age: "",
    contactNumber: "",
    email: user?.email || "",
    permanentAddress: "",
    currentAddress: "",
    occupation: "",
    preferredLanguage: "English",
    // Personal Details (Optional)
    idProofType: "",
    idProofNumber: "",
    
    // Incident Details (Required)
    incidentDate: "",
    incidentTime: "",
    reportingDate: new Date().toISOString().split('T')[0],
    reportingTime: new Date().toTimeString().slice(0, 5),
    location: "",
    incidentType: "",
    amountLost: "",
    transactionId: "",
    bankName: "",
    walletName: "",
    scammerAccountNumber: "",
    scammerIFSC: "",
    scammerUPIId: "",
    modeOfFraud: "",
    devicePlatform: "",
    complaintDescription: "",
  });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [locationData, setLocationData] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null
  });
  const [locationError, setLocationError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);

  // Load saved form data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('complaintFormDraft');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        let hasRestoredData = false;
        
        if (parsed.form) {
          setForm(parsed.form);
          hasRestoredData = true;
        }
        if (parsed.currentSection) {
          setCurrentSection(parsed.currentSection);
          hasRestoredData = true;
        }
        if (parsed.termsAccepted !== undefined) {
          setTermsAccepted(parsed.termsAccepted);
          hasRestoredData = true;
        }
        if (parsed.locationData && parsed.locationData.latitude) {
          setLocationData(parsed.locationData);
          hasRestoredData = true;
        }
        
        if (hasRestoredData) {
          setMessage({ 
            type: 'success', 
            text: '✅ Your previous form data has been restored. You can continue filling the form.' 
          });
          setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        }
      } catch (err) {
        console.error('Error loading saved form data:', err);
      }
    }
  }, []);

  // Save form data to localStorage whenever it changes (debounced to avoid too many writes)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const dataToSave = {
        form,
        currentSection,
        termsAccepted,
        locationData
      };
      try {
        localStorage.setItem('complaintFormDraft', JSON.stringify(dataToSave));
      } catch (err) {
        // Handle localStorage quota exceeded or other errors
        console.warn('Could not save form data to localStorage:', err);
      }
    }, 500); // Debounce by 500ms

    return () => clearTimeout(timeoutId);
  }, [form, currentSection, termsAccepted, locationData]);

  // Get user's geolocation when reaching section 3
  useEffect(() => {
    if (currentSection === 3 && !locationData.latitude && !gettingLocation && !locationPermissionDenied) {
      getCurrentLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSection]);

  function getCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser. Please enable location services.');
      return;
    }

    setGettingLocation(true);
    setLocationError('');
    setLocationPermissionDenied(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationData({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        });
        setLocationError('');
        setLocationPermissionDenied(false);
        setGettingLocation(false);
      },
      (error) => {
        let errorMessage = 'Unable to get your location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationPermissionDenied(true);
            errorMessage += 'Location access was denied. ';
            errorMessage += 'Please click the button below to try again, or enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable. Please check your device location settings.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage += 'An unknown error occurred. Please try again.';
            break;
        }
        setLocationError(errorMessage);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }

  function validateForm() {
    // Required fields validation
    const requiredFields = {
      fullName: 'Full Name',
      contactNumber: 'Contact Number',
      email: 'Email Address',
      incidentDate: 'Date of Incident',
      incidentTime: 'Time of Incident',
      incidentType: 'Incident Type',
      complaintDescription: 'Complaint Description'
    };

    for (const [key, label] of Object.entries(requiredFields)) {
      if (!form[key] || form[key].trim() === '') {
        setMessage({ type: 'error', text: `Please fill in the required field: ${label}` });
        // Scroll to the section containing this field
        if (key === 'fullName' || key === 'contactNumber' || key === 'email') {
          setCurrentSection(1);
        } else {
          setCurrentSection(2);
        }
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      setCurrentSection(1);
      return false;
    }

    // Phone validation (should be 10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(form.contactNumber.replace(/\D/g, ''))) {
      setMessage({ type: 'error', text: 'Please enter a valid 10-digit contact number' });
      setCurrentSection(1);
      return false;
    }

    // Terms and conditions validation
    if (!termsAccepted) {
      setMessage({ type: 'error', text: 'Please accept the Terms and Conditions to proceed' });
      setCurrentSection(3);
      return false;
    }

    // Location validation
    if (!locationData.latitude || !locationData.longitude) {
      setMessage({ type: 'error', text: 'Please allow location access. Your location is required to file a complaint.' });
      setCurrentSection(3);
      if (!gettingLocation) {
        getCurrentLocation();
      }
      return false;
    }

    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });
    
    try {
      const caseId = `CFCF-OD-${Date.now().toString().slice(-6)}`;
      const evidenceMetadata = []; // Store only file metadata in case document
      
      // Combine incident date and time
      const incidentDateTime = form.incidentDate && form.incidentTime 
        ? new Date(`${form.incidentDate}T${form.incidentTime}`).getTime()
        : Date.now();
      
      // Combine reporting date and time
      const reportingDateTime = form.reportingDate && form.reportingTime
        ? new Date(`${form.reportingDate}T${form.reportingTime}`).getTime()
        : Date.now();
      
      // Create case document first
      let caseRef;
      try {
        caseRef = await addDoc(collection(db, 'cases'), {
        caseId,
        ncrpId: null,
        victimUid: user.uid,
        // Personal Details
        victimName: form.fullName,
        victimPhone: form.contactNumber,
        victimEmail: form.email,
        fathersName: form.fathersName || '',
        mothersName: form.mothersName || '',
        gender: form.gender || '',
        age: form.age || '',
        permanentAddress: form.permanentAddress || '',
        currentAddress: form.currentAddress || form.permanentAddress || '',
        occupation: form.occupation || '',
        preferredLanguage: form.preferredLanguage || 'English',
        idProofType: form.idProofType || '',
        idProofNumber: form.idProofNumber || '',
        // Incident Details
        fraudType: form.incidentType,
        description: form.complaintDescription,
        incidentDate: incidentDateTime,
        reportingDate: reportingDateTime,
        location: form.location || '',
        amountLost: Number(form.amountLost) || 0,
        transactionId: form.transactionId || '',
        bankName: form.bankName || '',
        walletName: form.walletName || '',
        scammerAccountNumber: form.scammerAccountNumber || '',
        scammerIFSC: form.scammerIFSC || '',
        scammerUPIId: form.scammerUPIId || '',
        modeOfFraud: form.modeOfFraud || '',
        devicePlatform: form.devicePlatform || '',
        transactions: [{ 
          txnId: form.transactionId || '', 
          amount: Number(form.amountLost) || 0, 
          toAccount: form.scammerAccountNumber || form.scammerUPIId || '', 
          time: new Date(incidentDateTime).toISOString() 
        }],
        evidence: [], // Will be updated with metadata
        // Location data
        locationLatitude: locationData.latitude,
        locationLongitude: locationData.longitude,
        locationAccuracy: locationData.accuracy,
        locationTimestamp: locationData.timestamp,
        // Terms acceptance
        termsAccepted: true,
        termsAcceptedAt: Date.now(),
        status: 'Pending',
        timeline: [{ status: 'Pending', note: 'Complaint created by victim', at: Date.now() }],
        createdAt: Date.now(),
        updatedAt: Date.now()
        });
      } catch (createError) {
        // Handle permission errors specifically for case creation
        if (createError.code === 'permission-denied' || createError.message?.includes('permission') || createError.message?.includes('Missing or insufficient permissions')) {
          throw new Error('PERMISSION_DENIED: Please update Firestore security rules to allow case creation.');
        }
        throw createError;
      }
      
      // Notify police and bank about the new complaint
      try {
        const caseData = {
          caseId,
          victimName: form.fullName,
          amountLost: Number(form.amountLost) || 0
        }
        await notifyNewComplaint(caseId, caseData)
      } catch (notifError) {
        console.error('Failed to send notifications:', notifError)
        // Don't fail the complaint creation if notification fails
      }
      
      // Process files and store them in subcollection (to avoid document size limit)
      if (files.length > 0) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const evidenceCollection = collection(db, 'cases', caseRef.id, 'evidence');
        
        for (let f of files) {
          try {
            // Sanitize filename to avoid issues
            const sanitizedName = f.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            
            // Convert file to base64
            const base64File = await fileToBase64(f);
            
            // Check file size (1MB limit per document - base64 increases size by ~33%)
            const fileSizeMB = (base64File.length / 1024 / 1024);
            if (fileSizeMB > 0.75) { // ~750KB base64 = ~1MB original
              console.warn(`File ${f.name} is too large (${fileSizeMB.toFixed(2)}MB), skipping...`);
              continue;
            }
            
            // Process file through backend (validates and prepares for Firestore)
            const uploadResponse = await fetch(`${apiUrl}/upload/file`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                file: base64File,
                fileName: sanitizedName,
                caseId: caseId,
                contentType: f.type || 'application/octet-stream',
                userId: user?.uid || 'unknown'
              })
            });
            
            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json().catch(() => ({ error: 'Upload failed' }));
              console.error(`File ${f.name} processing failed:`, errorData);
              continue;
            }
            
            const uploadData = await uploadResponse.json();
            if (uploadData.success && uploadData.fileData) {
              try {
                // Store file in subcollection
                await addDoc(evidenceCollection, {
                  name: uploadData.fileData.name,
                  data: uploadData.fileData.data, // base64 string
                  contentType: uploadData.fileData.contentType,
                  size: uploadData.fileData.size,
                  uploadedAt: uploadData.fileData.uploadedAt
                });
                
                // Store only metadata in case document
                evidenceMetadata.push({
                  name: uploadData.fileData.name,
                  contentType: uploadData.fileData.contentType,
                  size: uploadData.fileData.size,
                  uploadedAt: uploadData.fileData.uploadedAt
                });
                
                console.log(`File ${f.name} stored successfully in subcollection`);
              } catch (evidenceError) {
                // Handle permission errors for evidence subcollection
                if (evidenceError.code === 'permission-denied' || evidenceError.message?.includes('permission')) {
                  console.warn(`File ${f.name}: Permission denied for evidence subcollection. Skipping file.`);
                } else {
                  console.error(`File ${f.name} evidence storage error:`, evidenceError);
                }
                // Continue with other files
              }
            }
          } catch (uploadError) {
            console.error(`File ${f.name} error:`, uploadError);
            // Handle ERR_BLOCKED_BY_CLIENT gracefully
            if (uploadError.message?.includes('ERR_BLOCKED_BY_CLIENT') || uploadError.message?.includes('blocked')) {
              console.warn(`File ${f.name}: Request blocked by browser extension. This is usually harmless.`);
            }
            // Continue with other files
          }
        }
        
        // Update case document with evidence metadata
        if (evidenceMetadata.length > 0) {
          try {
            await setDoc(caseRef, { evidence: evidenceMetadata }, { merge: true });
          } catch (updateError) {
            // Handle permission errors for updating case document
            if (updateError.code === 'permission-denied' || updateError.message?.includes('permission')) {
              console.warn('⚠️ Could not update case with evidence metadata due to permissions. Case created but evidence metadata not saved.');
            } else {
              console.error('Error updating case with evidence metadata:', updateError);
            }
            // Continue - case is already created
          }
        }
        
        // Show summary message
        if (files.length > 0 && evidenceMetadata.length === 0) {
          setMessage({ 
            type: 'error', 
            text: `Warning: All files failed to process. Case will be created without evidence files.` 
          });
        } else if (files.length > evidenceMetadata.length) {
          setMessage({ 
            type: 'error', 
            text: `Warning: ${files.length - evidenceMetadata.length} file(s) failed to process. ${evidenceMetadata.length} file(s) stored successfully.` 
          });
        }
      }
      
      if (files.length > 0 && evidenceMetadata.length === 0) {
        setMessage({
          type: 'error',
          text: `⚠️ Case filed (ID: ${caseId}) but all files failed to process. Case created without evidence files.`
        });
      } else if (files.length > 0 && evidenceMetadata.length < files.length) {
        setMessage({
          type: 'error',
          text: `⚠️ Case filed (ID: ${caseId}) but ${files.length - evidenceMetadata.length} file(s) failed. ${evidenceMetadata.length} file(s) stored successfully.`
        });
      } else {
        const evidenceMsg = evidenceMetadata.length > 0 ? ` with ${evidenceMetadata.length} evidence file(s)` : '';
        setMessage({
          type: 'success',
          text: `✅ Complaint filed successfully${evidenceMsg}! Case ID: ${caseId}. Files stored in Firestore.`
        });
      }
      
      // Reset form
      setForm({
        fullName: "",
        fathersName: "",
        mothersName: "",
        gender: "",
        age: "",
        contactNumber: "",
        email: user?.email || "",
        permanentAddress: "",
        currentAddress: "",
        occupation: "",
        preferredLanguage: "English",
        idProofType: "",
        idProofNumber: "",
        incidentDate: "",
        incidentTime: "",
        reportingDate: new Date().toISOString().split('T')[0],
        reportingTime: new Date().toTimeString().slice(0, 5),
        location: "",
        incidentType: "",
        amountLost: "",
        transactionId: "",
        bankName: "",
        walletName: "",
        scammerAccountNumber: "",
        scammerIFSC: "",
        scammerUPIId: "",
        modeOfFraud: "",
        devicePlatform: "",
        complaintDescription: "",
      });
      // Clear form and localStorage after successful submission
      setFiles([]);
      setTermsAccepted(false);
      setLocationData({ latitude: null, longitude: null, accuracy: null, timestamp: null });
      setLocationError('');
      setLocationPermissionDenied(false);
      setCurrentSection(1);
      localStorage.removeItem('complaintFormDraft');
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (err) {
      console.error('Submit error:', err);
      let errorMsg = 'Submit failed: ' + err.message;
      
      // Handle Firestore permission errors
      if (err.code === 'permission-denied' || err.message?.includes('permission') || err.message?.includes('Missing or insufficient permissions')) {
        errorMsg = '⚠️ Firestore permission denied. Please update Firestore security rules in Firebase Console to allow case creation.';
        console.warn('💡 To fix: Update Firestore security rules to allow authenticated users to create cases.');
        console.warn('💡 See firestore.rules file for the correct rules.');
      } else if (err.message?.includes('ERR_BLOCKED_BY_CLIENT') || err.message?.includes('blocked')) {
        // Ad blocker or browser extension blocking requests
        errorMsg = '⚠️ Request blocked by browser extension or ad blocker. Please disable ad blockers for this site and try again.';
        console.warn('⚠️ Firestore request blocked (likely by ad blocker). Please disable ad blockers.');
      } else if (err.message?.includes('CORS') || err.code === 'storage/unauthorized') {
        errorMsg = 'CORS Error: Please configure Firebase Storage CORS. See console for details.';
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        errorMsg = 'Network error: Please check your internet connection and try again.';
      }
      
      setMessage({ type: 'error', text: errorMsg });
      setTimeout(() => setMessage({ type: '', text: '' }), 10000);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Cyber Fraud</h1>
              <p className="text-gray-600 text-lg">Report and track cyber fraud incidents</p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="bg-white rounded-full p-1.5 shadow-lg border border-gray-200 inline-flex">
              <button
                type="button"
                onClick={() => setViewMode('file')}
                className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                  viewMode === 'file'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                File a Complaint
              </button>
              <button
                type="button"
                onClick={() => setViewMode('track')}
                className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                  viewMode === 'track'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Track Complaints
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {viewMode === 'track' ? (
          <CasesList user={user} profile={profile} onSwitchToFile={() => setViewMode('file')} />
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 lg:p-10">

          {/* Success/Error Messages */}
          {message.type === 'success' && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-800 font-medium text-sm">{message.text}</p>
              </div>
            </div>
          )}

          {message.type === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800 font-medium text-sm">{message.text}</p>
              </div>
            </div>
          )}

          {/* Auto-save indicator */}
          <div className="mb-4 flex items-center justify-end">
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Form auto-saves as you type</span>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setCurrentSection(1)}
                className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  currentSection === 1 
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg' 
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                1. Personal Details
              </button>
              <div className={`h-1.5 flex-1 mx-3 rounded-full transition-all duration-300 ${currentSection >= 2 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : 'bg-amber-200'}`}></div>
              <button
                type="button"
                onClick={() => currentSection >= 2 && setCurrentSection(2)}
                className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  currentSection === 2 
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg' 
                    : currentSection > 2
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                2. Incident Details
              </button>
              <div className={`h-1.5 flex-1 mx-3 rounded-full transition-all duration-300 ${currentSection >= 3 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : 'bg-amber-200'}`}></div>
              <button
                type="button"
                onClick={() => currentSection >= 3 && setCurrentSection(3)}
                className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  currentSection === 3 
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                3. Evidence
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Section 1: Personal Details */}
            {currentSection === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 pl-6 py-4 rounded-r-lg mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h4 className="text-xl font-bold text-gray-900">Personal Information</h4>
                  </div>
                  <p className="text-sm text-gray-600">Please provide your details as per ID proof</p>
                </div>

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
                      placeholder="As per PAN/Passport/Driving License"
                      value={form.fullName}
                      onChange={e => setForm({...form, fullName: e.target.value})}
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
                      onChange={e => setForm({...form, contactNumber: e.target.value.replace(/\D/g, '').slice(0, 10)})}
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
                      onChange={e => setForm({...form, email: e.target.value})}
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
                      onChange={e => setForm({...form, gender: e.target.value})}
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
                      onChange={e => setForm({...form, age: e.target.value})}
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
                      onChange={e => setForm({...form, fathersName: e.target.value})}
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
                      onChange={e => setForm({...form, occupation: e.target.value})}
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
                      onChange={e => setForm({...form, preferredLanguage: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Marathi">Marathi</option>
                      <option value="Gujarati">Gujarati</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Kannada">Kannada</option>
                      <option value="Malayalam">Malayalam</option>
                      <option value="Bengali">Bengali</option>
                      <option value="Punjabi">Punjabi</option>
                    </select>
                  </div>
                </div>

                <div>
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
                    onChange={e => setForm({...form, permanentAddress: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <div>
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
                    onChange={e => setForm({...form, currentAddress: e.target.value})}
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

                <div className="border-t-2 border-amber-200 pt-6 mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    <p className="text-sm font-semibold text-gray-700">ID Proof (Optional - for digital verification)</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        ID Proof Type
                      </label>
                      <select
                        value={form.idProofType}
                        onChange={e => setForm({...form, idProofType: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select ID Type</option>
                        <option value="PAN">PAN</option>
                        <option value="Passport">Passport</option>
                        <option value="Driving License">Driving License</option>
                        <option value="Voter ID">Voter ID</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        ID Proof Number
                      </label>
                      <input
                        type="text"
                        placeholder="ID number"
                        value={form.idProofNumber}
                        onChange={e => setForm({...form, idProofNumber: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setCurrentSection(2)}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <span>Next: Incident Details</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
          </div>
        )}

            {/* Section 2: Incident Details */}
            {currentSection === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 pl-6 py-4 rounded-r-lg mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h4 className="text-xl font-bold text-gray-900">Incident Information</h4>
                  </div>
                  <p className="text-sm text-gray-600">Provide details about the fraud or crime incident</p>
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
                      onChange={e => setForm({...form, incidentDate: e.target.value})}
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
                      onChange={e => setForm({...form, incidentTime: e.target.value})}
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
                      onChange={e => setForm({...form, reportingDate: e.target.value})}
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
                      onChange={e => setForm({...form, reportingTime: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
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
                    onChange={e => setForm({...form, location: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Physical location or online platform where incident occurred
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Incident Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.incidentType}
                    onChange={e => setForm({...form, incidentType: e.target.value})}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount Lost (₹)
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={form.amountLost}
                  onChange={e => setForm({...form, amountLost: e.target.value})}
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
                  onChange={e => setForm({...form, transactionId: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., SBI, HDFC, ICICI"
                  value={form.bankName}
                  onChange={e => setForm({...form, bankName: e.target.value})}
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
                  onChange={e => setForm({...form, walletName: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="border-t border-amber-200 pt-4">
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
                    onChange={e => setForm({...form, scammerAccountNumber: e.target.value})}
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
                    onChange={e => setForm({...form, scammerIFSC: e.target.value.toUpperCase()})}
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
                    onChange={e => setForm({...form, scammerUPIId: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mode of Fraud
                </label>
                <select
                  value={form.modeOfFraud}
                  onChange={e => setForm({...form, modeOfFraud: e.target.value})}
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
                  onChange={e => setForm({...form, devicePlatform: e.target.value})}
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Complaint Description <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Please provide a detailed description of the incident. Include: what happened, how you were contacted, what information you shared, steps you've taken, etc."
                value={form.complaintDescription}
                onChange={e => setForm({...form, complaintDescription: e.target.value})}
                rows={6}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">The more details you provide, the better we can help you</p>
            </div>

                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setCurrentSection(1)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Back to Personal Details</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentSection(3)}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <span>Next: Upload Evidence</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
          </div>
        )}

            {/* Section 3: Evidence */}
            {currentSection === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 pl-6 py-4 rounded-r-lg mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <h4 className="text-xl font-bold text-gray-900">Evidence & Documents</h4>
                  </div>
                  <p className="text-sm text-gray-600">Upload screenshots, transaction receipts, or any relevant documents</p>
                </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Evidence (Files) - Optional
              </label>
              <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800 font-medium mb-1">📎 Allowed file types:</p>
                <p className="text-xs text-blue-700">
                  PDF, Images (JPG, PNG, GIF, WEBP), Word Documents (DOC, DOCX), Text Files (TXT)
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Maximum file size: 750KB per file (stored in Firestore subcollection)
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  💡 Tip: Upload screenshots of transactions, chat conversations, emails, or any relevant documents
                </p>
                <p className="text-xs text-amber-700 mt-2 font-medium">
                  ⚠️ Note: File selections are not saved if you refresh the page. Please upload files just before submitting.
                </p>
              </div>
              <div className="relative">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.txt,application/pdf,image/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  onChange={e => {
                    const selectedFiles = Array.from(e.target.files);
                    const validFiles = [];
                    const errors = [];
                    
                    selectedFiles.forEach(file => {
                      const validation = validateFile(file);
                      if (validation.valid) {
                        validFiles.push(file);
                      } else {
                        errors.push(`${file.name}: ${validation.error}`);
                      }
                    });
                    
                    if (errors.length > 0) {
                      setMessage({ 
                        type: 'error', 
                        text: `Invalid files:\n${errors.join('\n')}` 
                      });
                      setTimeout(() => setMessage({ type: '', text: '' }), 8000);
                    }
                    
                    setFiles(validFiles);
                  }}
                  className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-700 file:cursor-pointer"
                />
                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-gray-700 font-medium">
                      {files.length} file(s) selected:
                    </p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-amber-50 rounded border border-amber-200">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <svg className="w-4 h-4 text-amber-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-xs text-gray-800 truncate">{file.name}</span>
                          </div>
                          <span className="text-xs text-gray-600 ml-2">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location Capture */}
            <div className="border border-amber-200 rounded-lg overflow-hidden">
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
                  <div className="bg-green-50 border border-green-200 rounded p-3">
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
                      <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
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
                      {gettingLocation ? (
                        <>
                          <svg className="animate-spin h-4 w-4 inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Getting location...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {locationPermissionDenied ? 'Try Again - Get My Location' : 'Get My Location'}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="border border-amber-200 rounded-lg p-4 bg-white">
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
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-gray-600 max-h-32 overflow-y-auto">
                    <p className="font-semibold mb-2">Terms and Conditions:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>I confirm that all information provided in this complaint is true and accurate to the best of my knowledge.</li>
                      <li>I understand that providing false information may result in legal consequences.</li>
                      <li>I authorize the authorities to use the provided information for investigation purposes.</li>
                      <li>I consent to the collection and storage of my location data for verification and investigation purposes.</li>
                      <li>I understand that my complaint will be processed according to applicable laws and regulations.</li>
                      <li>I acknowledge that the authorities may contact me using the provided contact information for follow-up.</li>
                      <li>I understand that the processing of my complaint is subject to the jurisdiction of the relevant authorities.</li>
                    </ol>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-semibold">📋 Summary:</span> Review your complaint before submitting
              </p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• Name: {form.fullName || 'Not provided'}</p>
                <p>• Contact: {form.contactNumber || 'Not provided'}</p>
                <p>• Incident Type: {form.incidentType || 'Not provided'}</p>
                <p>• Amount Lost: {form.amountLost ? `₹${form.amountLost}` : 'Not specified'}</p>
                <p>• Evidence Files: {files.length} file(s)</p>
                <p>• Location: {locationData.latitude ? 'Captured ✓' : 'Not captured'}</p>
                <p>• Terms Accepted: {termsAccepted ? 'Yes ✓' : 'No'}</p>
              </div>
            </div>

                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setCurrentSection(2)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Back to Incident Details</span>
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !termsAccepted || !locationData.latitude || !locationData.longitude}
                    className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
            )}
          </div>
          </form>
        )}
      </div>
    </div>
  );
}
