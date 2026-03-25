import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, useSearchParams } from "react-router-dom";
import { notifyVictimBankUpdate } from "../utils/notifications.js";
import { useI18n } from "../../i18n/index.jsx";

// Component to load and display evidence files from subcollection
function EvidenceFilesList({ caseId, evidenceMetadata }) {
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!caseId) {
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
        // Fallback: use metadata if subcollection fails and metadata exists
        if (evidenceMetadata && evidenceMetadata.length > 0) {
          setEvidenceFiles(evidenceMetadata.map((meta, idx) => ({ ...meta, id: idx })));
        } else {
          setEvidenceFiles([]);
        }
      } finally {
        setLoading(false);
      }
    }

    loadFiles();
  }, [caseId, evidenceMetadata]);

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

  if (loading) {
    return (
      <div className="border border-amber-200 rounded-lg p-4 bg-white">
        <div className="flex items-center gap-2 text-gray-600">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm">Loading evidence files...</span>
        </div>
      </div>
    );
  }

  if (!evidenceFiles || evidenceFiles.length === 0) {
    return null;
  }

  return (
    <div className="border border-amber-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-amber-50">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-bold text-gray-800">📎 Evidence Files ({evidenceFiles.length})</h3>
        </div>
      </div>
      <div className="p-4 bg-white">
        <div className="flex flex-wrap gap-2 mb-3">
          {evidenceFiles.map((fileItem, idx) => {
            const fileName = fileItem.name || `File ${idx + 1}`;
            const isUrl = typeof fileItem === 'string' || fileItem.url;
            const fileSize = fileItem.size ? `(${(fileItem.size / 1024).toFixed(1)} KB)` : '';
            
            if (isUrl) {
              return (
                <a
                  key={fileItem.id || idx}
                  href={fileItem.url || fileItem}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg text-sm text-amber-800 transition-colors"
                  title={`Download ${fileName}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  📄 {fileName} {fileSize}
                </a>
              );
            }

            return (
              <button
                key={fileItem.id || idx}
                onClick={() => handleDownload(fileItem)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg text-sm text-amber-800 transition-colors cursor-pointer"
                title={`Download ${fileName}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                📄 {fileName} {fileSize}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-500">
          Click files to download evidence (stored in Firestore subcollection)
        </p>
      </div>
    </div>
  );
}

function matchesCaseIdentifier(caseItem, focusedCaseId) {
  if (!caseItem || !focusedCaseId) return false;
  return caseItem.caseId === focusedCaseId || caseItem.id === focusedCaseId;
}

function hasTrackingEvent(caseItem, eventName) {
  return Array.isArray(caseItem?.tracking) && caseItem.tracking.some((entry) => entry?.event === eventName);
}

function isBankRelevantCase(caseItem) {
  if (!caseItem) return false;

  return Boolean(
    caseItem.forwardedToBank ||
    caseItem.bankActionRequired ||
    caseItem.bankInvestigationRequestedAt ||
    caseItem.bankHandledAt ||
    caseItem.bankInvestigationStatus ||
    ['Funds Frozen', 'Refunded'].includes(caseItem.status) ||
    hasTrackingEvent(caseItem, 'Bank Investigation Requested') ||
    hasTrackingEvent(caseItem, 'Funds Frozen') ||
    (Array.isArray(caseItem.messages) && caseItem.messages.some((entry) => entry?.from === 'bank'))
  );
}

function getBankCasePriority(caseItem, focusedCaseId) {
  if (matchesCaseIdentifier(caseItem, focusedCaseId)) {
    return 3;
  }
  if (caseItem?.bankActionRequired || caseItem?.bankInvestigationStatus === 'Requested') {
    return 2;
  }
  if (isBankRelevantCase(caseItem)) {
    return 1;
  }
  return 0;
}

function createTimelineEntry(status, note, at, by) {
  return { status, note, at, by };
}

export default function BankDashboard() {
  const { profile, loading, logout } = useAuth();
  const { locale } = useI18n();
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [selected, setSelected] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    personalDetails: true,
    incidentDetails: true,
    transactionDetails: true
  });
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    sortBy: 'newest' // 'newest', 'oldest', 'updated'
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focusedCaseId = searchParams.get('caseId');
  const bankOfficerName = profile?.name || profile?.email || 'Bank Officer';
  const formatDateTime = (value, fallback = 'Unknown') => (value ? new Date(value).toLocaleString(locale) : fallback);
  const bankRelevantCount = cases.filter((caseItem) => isBankRelevantCase(caseItem)).length;

  useEffect(() => {
    const q = query(collection(db, 'cases'), orderBy('createdAt','desc'));
    const unsub = onSnapshot(q, 
      (snap) => {
        const arr = []; 
        snap.forEach(d => arr.push({ ...d.data(), id: d.id })); 
        setCases(arr);
      },
      (error) => {
        console.error('Error fetching cases:', error);
        if (error.code === 'permission-denied') {
          const errorMsg = `Permission denied. Your role may not be set correctly.\n\n` +
            `To fix this:\n` +
            `1. Go to Firebase Console → Firestore Database\n` +
            `2. Find your user in the 'users' collection\n` +
            `3. Add/update the 'role' field to 'bank'\n` +
            `4. Refresh this page\n\n` +
            `Current user: ${profile?.email || 'Unknown'}\n` +
            `Current role: ${profile?.role || 'Not set'}`;
        } else if (error.code === 'failed-precondition') {
          const indexUrl = error.message?.match(/https:\/\/[^\s]+/)?.[0];
          if (indexUrl) {
            alert(`Firestore index required. Click OK to create it automatically, or visit: ${indexUrl}`);
            window.open(indexUrl, '_blank');
          } else {
            alert('Firestore index required. Please check the console for the index creation link.');
          }
        } else if (error.message?.includes('ERR_BLOCKED_BY_CLIENT') || error.message?.includes('network')) {
          console.warn('Network error (may be harmless):', error);
        }
      }
    );
    return () => unsub();
  }, [profile?.email, profile?.role]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...cases];
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(c => c.status === filters.status);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.caseId?.toLowerCase().includes(searchLower) ||
        c.fraudType?.toLowerCase().includes(searchLower) ||
        c.victimName?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const priorityDiff = getBankCasePriority(b, focusedCaseId) - getBankCasePriority(a, focusedCaseId);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      if (filters.sortBy === 'newest') {
        return (b.createdAt || 0) - (a.createdAt || 0);
      } else if (filters.sortBy === 'oldest') {
        return (a.createdAt || 0) - (b.createdAt || 0);
      } else if (filters.sortBy === 'updated') {
        return (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0);
      }
      return 0;
    });
    
    setFilteredCases(filtered);
  }, [cases, filters, focusedCaseId]);

  // Update selected case when cases update
  useEffect(() => {
    setSelected((currentSelected) => {
      if (!currentSelected) return currentSelected;
      const updated = cases.find(c => c.id === currentSelected.id);
      return updated || currentSelected;
    });
  }, [cases]);

  useEffect(() => {
    if (!focusedCaseId || cases.length === 0) {
      return;
    }

    const matchedCase = cases.find((caseItem) => matchesCaseIdentifier(caseItem, focusedCaseId));
    if (matchedCase) {
      setSelected(matchedCase);
    }
  }, [cases, focusedCaseId]);

  // Check if user has bank role
  if (!loading && profile && profile.role !== 'bank') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/30 to-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent mb-3">Access Denied</h2>
          <p className="text-gray-600 mb-6 text-lg">
            You don't have permission to access the Bank Dashboard.
          </p>
          <div className="text-left bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-xl text-sm text-gray-700 mb-6 border-2 border-amber-200 shadow-sm">
            <p className="font-bold mb-3 text-gray-800">Your current role: <span className="text-amber-700">{profile.role || 'Not set'}</span></p>
            <p className="font-bold mb-3 text-gray-800">To access Bank Dashboard:</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Go to Firebase Console → Firestore Database</li>
              <li>Navigate to <code className="bg-white px-2 py-1 rounded border border-amber-300 text-gray-800 font-mono text-xs">users</code> collection</li>
              <li>Find your user document (email: {profile.email || 'your email'})</li>
              <li>Add/update field: <code className="bg-white px-2 py-1 rounded border border-amber-300 text-gray-800 font-mono text-xs">role = "bank"</code></li>
              <li>Click "Update" and refresh this page</li>
            </ol>
          </div>
          <button 
            onClick={() => navigate('/login/bank')} 
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Go to Bank Login
          </button>
        </div>
      </div>
    );
  }

  async function handleLogout() {
    try {
      await logout();
      navigate('/login/bank', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to logout. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  async function sendMessage(caseDocId) {
    if (!messageText.trim()) {
      alert('Please enter a message');
      return;
    }
    
    setProcessing(true);
    try {
      const docRef = doc(db, 'cases', caseDocId);
      const currentDoc = await getDoc(docRef);
      if (!currentDoc.exists()) {
        throw new Error('Case not found');
      }
      const currentData = currentDoc.data();
      const currentMessages = currentData?.messages || [];
      const now = Date.now();
      
      const newMessage = {
        from: 'bank',
        message: messageText.trim(),
        timestamp: now,
        senderName: bankOfficerName
      };
      
      await updateDoc(docRef, {
        messages: [...currentMessages, newMessage],
        updatedAt: now
      });
      
      // Notify victim about bank message
      if (currentData.victimUid) {
        try {
          await notifyVictimBankUpdate(
            currentData.victimUid,
            currentData.caseId || caseDocId,
            'message',
            { message: messageText.trim() }
          )
        } catch (notifError) {
          console.error('Failed to notify victim:', notifError)
        }
      }
      
      setMessageText("");
      
      // Update selected case
      const updated = { ...selected, messages: [...currentMessages, newMessage] };
      setSelected(updated);
    } catch (err) {
      alert('Failed to send message: ' + err.message);
    } finally {
      setProcessing(false);
    }
  }

  async function initiateFreeze(caseDoc) {
    setProcessing(true);
    try {
      const amount = caseDoc.transactions?.[0]?.amount || 0;
      
      // Try to call backend API (optional - if it fails, we'll still update Firestore)
      let apiResponse = null;
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://safeweb-api.onrender.com';
        const adminKey = prompt("Admin key to call backend mock (optional - leave empty to skip):");
        
        if (adminKey) {
          const res = await fetch(`${apiUrl}/mock/npci/freeze`, {
            method: 'POST',
            headers: { 'Content-Type':'application/json', 'x-admin-key': adminKey },
            body: JSON.stringify({ caseId: caseDoc.caseId, amount: amount })
          });
          
          if (res.ok) {
            apiResponse = await res.json();
          } else {
            const errorText = await res.text();
            console.warn('Backend API error:', errorText);
            // Continue with Firestore update even if API fails
          }
        }
      } catch (apiError) {
        console.warn('Backend API not available or error:', apiError.message);
        // Continue with Firestore update even if API fails
      }
      
      // Update case status in Firestore
      const docRef = doc(db, 'cases', caseDoc.id);
      const currentDoc = await getDoc(docRef);
      
      if (!currentDoc.exists()) {
        throw new Error('Case not found in database');
      }
      
      const currentData = currentDoc.data();
      const currentMessages = currentData?.messages || [];
      const currentTracking = currentData?.tracking || [];
      const now = Date.now();
      const currentTimeline = currentData?.timeline || [];
      const freezeNote = `Funds frozen by bank. Amount: ₹${amount}`;
      const freezeMessage = {
        from: 'bank',
        message: `Funds frozen successfully. Amount: ₹${amount}`,
        timestamp: now,
        senderName: bankOfficerName
      };
      
      const updatedTracking = [...currentTracking, {
        event: 'Funds Frozen',
        description: freezeNote,
        timestamp: now,
        by: bankOfficerName
      }];
      
      await updateDoc(docRef, {
        status: 'Funds Frozen',
        bankActionRequired: false,
        forwardedToBank: true,
        bankHandledAt: now,
        bankInvestigationStatus: 'Funds Frozen',
        timeline: [...currentTimeline, createTimelineEntry('Funds Frozen', freezeNote, now, bankOfficerName)],
        messages: [...currentMessages, freezeMessage],
        tracking: updatedTracking,
        updatedAt: now
      });
      
      // Notify victim about funds freeze
      if (currentData.victimUid) {
        try {
          await notifyVictimBankUpdate(
            currentData.victimUid,
            currentData.caseId || caseDoc.id,
            'freeze',
            { amount }
          )
        } catch (notifError) {
          console.error('Failed to notify victim:', notifError)
        }
      }
      
      // Update selected case
      const updated = { 
        ...selected, 
        status: 'Funds Frozen',
        bankActionRequired: false,
        forwardedToBank: true,
        bankHandledAt: now,
        bankInvestigationStatus: 'Funds Frozen',
        timeline: [...currentTimeline, createTimelineEntry('Funds Frozen', freezeNote, now, bankOfficerName)],
        tracking: updatedTracking,
        messages: [...currentMessages, freezeMessage]
      };
      setSelected(updated);
      
      // Show success message
      if (apiResponse) {
        alert(`✅ Funds frozen successfully!\n\nAmount: ₹${amount}\n\nNPCI Response: ${JSON.stringify(apiResponse)}`);
      } else {
        alert(`✅ Funds frozen successfully!\n\nAmount: ₹${amount}\n\nNote: Backend API was not called (optional feature).`);
      }
    } catch (err) {
      console.error('Error freezing funds:', err);
      let errorMessage = 'Failed to freeze funds. ';
      
      if (err.message?.includes('not found')) {
        errorMessage += 'Case not found in database.';
      } else if (err.message?.includes('permission') || err.code === 'permission-denied') {
        errorMessage += 'Permission denied. Please check your Firestore security rules.';
      } else if (err.message?.includes('ERR_BLOCKED_BY_CLIENT') || err.message?.includes('network')) {
        errorMessage += 'Network error. Please disable ad blockers or browser extensions that block requests.';
      } else {
        errorMessage += err.message || 'Unknown error occurred.';
      }
      
      alert(`❌ ${errorMessage}`);
    } finally {
      setProcessing(false);
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-amber-100 text-amber-800 border-amber-300',
      'In Process': 'bg-blue-100 text-blue-800 border-blue-300',
      'Funds Frozen': 'bg-violet-100 text-violet-800 border-violet-300',
      'Refunded': 'bg-emerald-100 text-emerald-800 border-emerald-300',
      'Closed': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[status] || colors['Pending'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/30 to-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="mb-2 flex flex-col gap-3 text-2xl font-bold text-transparent sm:flex-row sm:items-center sm:text-4xl bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 shadow-md sm:h-12 sm:w-12">
                  <svg className="h-6 w-6 text-white sm:h-7 sm:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                Bank Dashboard
              </h1>
              <p className="text-base font-medium text-gray-700 sm:text-lg">Manage fund freezes and transactions</p>
              <p className="text-gray-500 text-sm mt-1">RBI/NPCI Compliant System</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button 
                onClick={() => navigate('/bank-stats')} 
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Statistics
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Process">In Process</option>
                <option value="Funds Frozen">Funds Frozen</option>
                <option value="Refunded">Refunded</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="updated">Recently Updated</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by Case ID, Fraud Type, or Victim Name"
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cases List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Case Queue</h2>
              <p className="text-xs text-gray-500">{bankRelevantCount} bank-related cases prioritized first</p>
            </div>
              <span className="ml-auto px-3 py-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 rounded-lg text-sm font-bold border-2 border-amber-300 shadow-sm">
                {filteredCases.length} / {cases.length}
              </span>
            </div>
          </div>

          <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
            {filteredCases.map((c, index) => (
              <div
                key={c.id || c.caseId}
                onClick={() => setSelected(c)}
                className={`bg-white rounded-xl shadow-sm border-2 cursor-pointer transition-all duration-200 p-4 hover:shadow-md hover:border-amber-300 ${
                  selected?.id === c.id ? 'ring-2 ring-amber-400 border-amber-400 shadow-lg scale-[1.01]' : 'border-gray-200'
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono text-gray-600 font-semibold">{c.caseId}</span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold border-2 ${getStatusColor(c.status)}`}>
                    {c.status}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-base">{c.fraudType || 'Unknown'}</h3>
                <p className="text-sm text-gray-600 mb-2">{c.victimName || 'Unknown Victim'}</p>
                {c.bankActionRequired && (
                  <p className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                    Bank action required
                  </p>
                )}
                {c.transactions && c.transactions[0] && (
                  <p className="text-sm text-amber-700 mt-2 font-bold">₹{c.transactions[0].amount || 0}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Case Details */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 px-4 py-8   sm:p-8">
              <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-gray-200">
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">Case Details</h2>
                <span className={`px-4 py-2 rounded-lg text-sm font-bold border-2 ${getStatusColor(selected.status)}`}>
                  {selected.status}
                </span>
              </div>

              <div className="space-y-6">
                {/* Tracking Progress */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-sm">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <label className="text-lg font-bold text-gray-900">Case Timeline</label>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 py-6 px-2 sm:p-6 rounded-xl shadow-sm">
                    {(() => {
                      // Build unified timeline array
                      const timeline = [];
                      
                      // Add complaint filed
                      if (selected.createdAt) {
                        timeline.push({
                          event: 'Complaint Filed',
                          description: 'Complaint created by victim',
                          timestamp: selected.createdAt,
                          by: selected.victimName || 'Victim',
                          color: 'green',
                          isDuplicate: false
                        });
                      }
                      
                      // First, add all tracking events (they have the most complete info)
                      if (selected.tracking && selected.tracking.length > 0) {
                        selected.tracking.forEach(track => {
                          // Determine color based on event type
                          let color = 'cyan';
                          if (track.event === 'Case Viewed') {
                            color = 'blue';
                          } else if (track.event === 'FIR Filed') {
                            color = 'purple';
                          } else if (track.event === 'Funds Frozen') {
                            color = 'purple';
                          } else if (track.event === 'Bank Investigation Requested') {
                            color = 'green';
                          } else if (track.event === 'Status Updated') {
                            color = 'cyan';
                          }
                          
                          timeline.push({
                            ...track,
                            color: color,
                            isDuplicate: false,
                            firNumber: track.event === 'FIR Filed' ? selected.firNumber : track.firNumber
                          });
                        });
                      }
                      
                      // Then, add viewedAt/firFiledAt only if they don't exist in tracking
                      if (selected.viewedAt) {
                        const alreadyInTracking = timeline.some(t => 
                          t.event === 'Case Viewed' && Math.abs(t.timestamp - selected.viewedAt) < 1000
                        );
                        if (!alreadyInTracking) {
                          timeline.push({
                            event: 'Case Viewed',
                            description: 'Police officer reviewed the case',
                            timestamp: selected.viewedAt,
                            by: 'Police Officer',
                            color: 'blue',
                            isDuplicate: false
                          });
                        }
                      }
                      
                      if (selected.firFiledAt) {
                        const alreadyInTracking = timeline.some(t => 
                          t.event === 'FIR Filed' && Math.abs(t.timestamp - selected.firFiledAt) < 1000
                        );
                        if (!alreadyInTracking) {
                          timeline.push({
                            event: 'FIR Filed',
                            description: `FIR filed with number: ${selected.firNumber || 'N/A'}`,
                            timestamp: selected.firFiledAt,
                            by: 'Police Officer',
                            color: 'purple',
                            isDuplicate: false,
                            firNumber: selected.firNumber
                          });
                        }
                      }
                      
                      // Sort by timestamp
                      timeline.sort((a, b) => a.timestamp - b.timestamp);
                      
                      return (
                        <div className="relative">
                          {/* Vertical line connecting all points */}
                          {timeline.length > 1 && (
                            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-300"></div>
                          )}
                          
                          <div className="space-y-0">
                            {timeline.map((item, idx) => {
                              const colorClasses = {
                                green: 'bg-emerald-500 border-emerald-500',
                                blue: 'bg-blue-500 border-blue-500',
                                purple: 'bg-violet-500 border-violet-500',
                                cyan: 'bg-gray-600 border-gray-600'
                              };
                              const colorClass = colorClasses[item.color] || 'bg-gray-600 border-gray-600';
                              
                              return (
                                <div key={idx} className="flex items-start gap-4 relative pb-6">
                                  {/* Timeline point */}
                                  <div className="relative z-10">
                                    <div className={`w-8 h-8 ${colorClass} rounded-full border-2 border-white shadow-lg flex items-center justify-center`}>
                                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  </div>
                                  
                                  {/* Content */}
                                  <div className="flex-1 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                    <p className="text-gray-900 font-bold text-base">{item.event}</p>
                                    <p className="text-gray-700 text-sm mt-1">{item.description}</p>
                                    {item.firNumber && (
                                      <div className="mt-2 inline-block bg-amber-50 px-3 py-1.5 rounded border border-amber-200">
                                        <p className="text-amber-800 text-sm font-semibold">FIR Number: {item.firNumber}</p>
                                      </div>
                                    )}
                                    <p className="text-xs text-gray-500 mt-2 font-medium">
                                      {formatDateTime(item.timestamp)} {item.by ? `• ${item.by}` : ''}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Basic Case Info */}
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-6">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-gray-600 mb-2 block">Case ID</label>
                      <p className="text-lg font-mono font-bold text-gray-900">{selected.caseId}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-gray-600 mb-2 block">Fraud Type</label>
                      <p className="text-lg font-bold text-gray-900">{selected.fraudType}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-gray-600 mb-2 block">Status</label>
                      <p className="text-base font-semibold text-gray-900">{selected.status || 'Pending'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-gray-600 mb-2 block">Created</label>
                      <p className="text-base font-semibold text-gray-900">
                        {formatDateTime(selected.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Personal Details Section */}
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <button
                    onClick={() => setExpandedSections({...expandedSections, personalDetails: !expandedSections.personalDetails})}
                    className="w-full px-4 py-3 bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-sm">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Personal Details</h3>
                    </div>
                    <svg 
                      className={`w-5 h-5 text-amber-700 transition-transform ${expandedSections.personalDetails ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSections.personalDetails && (
                    <div className="p-6 bg-white space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Full Name</label>
                          <p className="text-gray-800 font-medium mt-1">{selected.victimName || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Contact Number</label>
                          <p className="text-gray-800 font-medium mt-1">{selected.victimPhone || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Email Address</label>
                          <p className="text-gray-800 font-medium mt-1 break-all">{selected.victimEmail || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Gender</label>
                          <p className="text-gray-800 font-medium mt-1">{selected.gender || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Age</label>
                          <p className="text-gray-800 font-medium mt-1">{selected.age || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Occupation</label>
                          <p className="text-gray-800 font-medium mt-1">{selected.occupation || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Father's / Mother's Name</label>
                          <p className="text-gray-800 font-medium mt-1">{selected.fathersName || selected.mothersName || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Preferred Language</label>
                          <p className="text-gray-800 font-medium mt-1">{selected.preferredLanguage || 'English'}</p>
                        </div>
                      </div>
                      <div className="border-t border-amber-200 pt-4">
                        <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">Permanent Address</label>
                        <p className="text-gray-800">{selected.permanentAddress || 'Not provided'}</p>
                      </div>
                      {selected.currentAddress && selected.currentAddress !== selected.permanentAddress && (
                        <div className="border-t border-amber-200 pt-4">
                          <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">Current Address</label>
                          <p className="text-gray-800">{selected.currentAddress}</p>
                        </div>
                      )}
                      {(selected.idProofType || selected.idProofNumber) && (
                        <div className="border-t border-amber-200 pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase">ID Proof Type</label>
                              <p className="text-gray-800 font-medium mt-1">{selected.idProofType || 'Not provided'}</p>
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase">ID Proof Number</label>
                              <p className="text-gray-800 font-medium mt-1 font-mono">{selected.idProofNumber || 'Not provided'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Incident Details Section */}
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <button
                    onClick={() => setExpandedSections({...expandedSections, incidentDetails: !expandedSections.incidentDetails})}
                    className="w-full px-4 py-3 bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-sm">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Incident Details</h3>
                    </div>
                    <svg 
                      className={`w-5 h-5 text-amber-700 transition-transform ${expandedSections.incidentDetails ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSections.incidentDetails && (
                    <div className="p-6 bg-white space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Date & Time of Incident</label>
                          <p className="text-gray-800 font-medium mt-1">
                            {selected.incidentDate 
                              ? formatDateTime(selected.incidentDate) 
                              : 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Date & Time of Reporting</label>
                          <p className="text-gray-800 font-medium mt-1">
                            {selected.reportingDate 
                              ? formatDateTime(selected.reportingDate) 
                              : 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Location / Place of Occurrence</label>
                          <p className="text-gray-800 font-medium mt-1">{selected.location || 'Not provided'}</p>
                          {selected.locationLatitude && selected.locationLongitude && (
                            <div className="mt-3 p-3 bg-white rounded-lg border border-amber-200 shadow-sm">
                              <p className="text-amber-800 font-bold mb-2 text-sm">📍 GPS Location:</p>
                              <p className="text-gray-700 text-sm">
                                Lat: <span className="font-mono font-semibold">{selected.locationLatitude.toFixed(6)}</span>, 
                                Long: <span className="font-mono font-semibold">{selected.locationLongitude.toFixed(6)}</span>
                              </p>
                              {selected.locationAccuracy && (
                                <p className="text-gray-600 mt-2 text-xs font-medium">Accuracy: ±{Math.round(selected.locationAccuracy)}m</p>
                              )}
                              <a
                                href={`https://www.google.com/maps?q=${selected.locationLatitude},${selected.locationLongitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-amber-600 hover:text-amber-800 font-semibold underline mt-2 inline-block text-sm"
                              >
                                View on Google Maps →
                              </a>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Mode of Fraud</label>
                          <p className="text-gray-800 font-medium mt-1">{selected.modeOfFraud || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Device / Platform</label>
                          <p className="text-gray-800 font-medium mt-1">{selected.devicePlatform || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Bank Name</label>
                          <p className="text-gray-800 font-medium mt-1">{selected.bankName || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Wallet / Payment App</label>
                          <p className="text-gray-800 font-medium mt-1">{selected.walletName || 'Not provided'}</p>
                        </div>
                      </div>
                      {(selected.scammerAccountNumber || selected.scammerIFSC || selected.scammerUPIId) && (
                        <div className="border-t border-amber-200 pt-4">
                          <h4 className="text-sm font-bold text-gray-800 mb-3">👤 Scammer Account Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {selected.scammerAccountNumber && (
                              <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Account Number</label>
                                <p className="text-gray-800 font-medium mt-1 font-mono">{selected.scammerAccountNumber}</p>
                              </div>
                            )}
                            {selected.scammerIFSC && (
                              <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">IFSC Code</label>
                                <p className="text-gray-800 font-medium mt-1 font-mono">{selected.scammerIFSC}</p>
                              </div>
                            )}
                            {selected.scammerUPIId && (
                              <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">UPI ID</label>
                                <p className="text-gray-800 font-medium mt-1 font-mono">{selected.scammerUPIId}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {selected.description && (
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-3 block">Description</label>
                    <div className="bg-gray-50 border-2 border-gray-200 p-4 rounded-lg">
                      <p className="text-gray-800 leading-relaxed">{selected.description}</p>
                    </div>
                  </div>
                )}

                {/* Transaction Details Section */}
                {selected.transactions && selected.transactions[0] && (
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <button
                      onClick={() => setExpandedSections({...expandedSections, transactionDetails: !expandedSections.transactionDetails})}
                      className="w-full px-4 py-3 bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-sm">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Transaction Details</h3>
                      </div>
                      <svg 
                        className={`w-5 h-5 text-amber-700 transition-transform ${expandedSections.transactionDetails ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedSections.transactionDetails && (
                      <div className="p-6 bg-white">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-semibold text-gray-600">Amount Lost</span>
                          <span className="text-3xl font-bold text-amber-700">₹{selected.amountLost || selected.transactions[0].amount || 0}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-amber-200 pt-4">
                          {selected.transactionId && (
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase">Transaction ID</label>
                              <p className="text-gray-800 font-mono mt-1">{selected.transactionId || selected.transactions[0].txnId || 'Not provided'}</p>
                            </div>
                          )}
                          {selected.transactions[0].toAccount && (
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase">To Account</label>
                              <p className="text-gray-800 font-mono mt-1">{selected.transactions[0].toAccount}</p>
                            </div>
                          )}
                          {selected.transactions[0].time && (
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase">Transaction Time</label>
                              <p className="text-gray-800 mt-1">{formatDateTime(selected.transactions[0].time)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Evidence Files Section */}
                {selected.id && (
                  <EvidenceFilesList caseId={selected.id} evidenceMetadata={selected.evidence || []} />
                )}

                {/* Messages */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-sm">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <label className="text-lg font-bold text-gray-900">Messages</label>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 p-5 rounded-xl max-h-64 overflow-y-auto space-y-3 mb-4 shadow-sm">
                    {selected.messages && selected.messages.length > 0 ? (
                      selected.messages.map((msg, idx) => (
                        <div key={idx} className={`p-4 rounded-lg border-2 ${msg.from === 'police' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-gray-900">
                              {msg.from === 'police' ? '👮 Police' : '🏦 Bank'}
                            </span>
                            <span className="text-xs text-gray-600 font-medium">
                              {formatDateTime(msg.timestamp)}
                            </span>
                          </div>
                          <p className="text-gray-800 text-sm mb-1">{msg.message}</p>
                          <p className="text-xs text-gray-600 font-medium">- {msg.senderName}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm text-center py-4">No messages yet</p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message to victim..."
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage(selected.id)}
                    />
                    <button
                      onClick={() => sendMessage(selected.id)}
                      disabled={processing || !messageText.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-sm">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <label className="text-lg font-bold text-gray-900">Actions</label>
                  </div>
                  <button
                    onClick={() => initiateFreeze(selected)}
                    disabled={processing || selected.status === 'Funds Frozen' || selected.status === 'Refunded' || selected.status === 'Closed'}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : selected.status === 'Funds Frozen' ? (
                      'Already Frozen'
                    ) : selected.status === 'Refunded' ? (
                      'Already Refunded'
                    ) : selected.status === 'Closed' ? (
                      'Case Closed'
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Initiate Freeze
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 text-center py-20">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="text-gray-600 text-xl font-semibold">Select a case to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
