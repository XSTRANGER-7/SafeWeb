import React, { useEffect, useState } from "react";
import { collection, query, onSnapshot, orderBy, doc, updateDoc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { notifyVictimPoliceUpdate, createNotificationForRole } from "../utils/notifications.js";
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
      <div className="border border-amber-200 rounded-xl p-6 bg-white shadow-sm">
        <div className="flex items-center gap-3 text-gray-600">
          <svg className="animate-spin h-5 w-5 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-medium">Loading evidence files...</span>
        </div>
      </div>
    );
  }

  if (!evidenceFiles || evidenceFiles.length === 0) {
    return null;
  }

  return (
    <div className="border border-amber-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="px-5 py-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800">Evidence Files ({evidenceFiles.length})</h3>
        </div>
      </div>
      <div className="p-5 bg-white">
        <div className="flex flex-wrap gap-3 mb-4">
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
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg text-sm font-medium text-amber-800 transition-all duration-200 hover:shadow-md hover:border-amber-400"
                  title={`Download ${fileName}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span>{fileName}</span>
                  {fileSize && <span className="text-xs text-amber-600">({fileSize})</span>}
                </a>
              );
            }

            return (
              <button
                key={fileItem.id || idx}
                onClick={() => handleDownload(fileItem)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg text-sm font-medium text-amber-800 transition-all duration-200 hover:shadow-md hover:border-amber-400 cursor-pointer"
                title={`Download ${fileName}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span>{fileName}</span>
                {fileSize && <span className="text-xs text-amber-600">({fileSize})</span>}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 font-medium">
          Click files to download evidence (stored in Firestore subcollection)
        </p>
      </div>
    </div>
  );
}

export default function PoliceDashboard() {
  const { userProfile, loading } = useAuth();
  const { locale } = useI18n();
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [firNumber, setFirNumber] = useState("");
  const [showFirModal, setShowFirModal] = useState(false);
  const [caseNote, setCaseNote] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
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
  const formatDateTime = (value, fallback = 'Unknown') => (value ? new Date(value).toLocaleString(locale) : fallback);

  useEffect(() => {
    const q = query(collection(db, 'cases'), orderBy('createdAt','desc'));
    const unsub = onSnapshot(q, 
      (snap) => {
        const arr = []; 
        snap.forEach(d => arr.push({ id: d.id, ...d.data() })); 
        setCases(arr);
      },
      (error) => {
        console.error('Error fetching cases:', error);
        if (error.code === 'permission-denied') {
          setErrorMsg('Permission denied. Please check your role in Firestore.');
        } else if (error.code === 'failed-precondition') {
          const indexUrl = error.message?.match(/https:\/\/[^\s]+/)?.[0];
          if (indexUrl) {
            alert(`Firestore index required. Click OK to create it automatically, or visit: ${indexUrl}`);
            window.open(indexUrl, '_blank');
          } else {
            setErrorMsg('Firestore index required. Please check the console for the index creation link.');
          }
        } else if (error.message?.includes('ERR_BLOCKED_BY_CLIENT') || error.message?.includes('network')) {
          console.warn('Network error (may be from browser extension):', error);
          setErrorMsg('Network error: Browser extension may be blocking Firebase. Please disable ad blockers for this site.');
        } else {
          setErrorMsg('Error loading cases: ' + error.message);
        }
      }
    );
    return () => unsub();
  }, []);

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
  }, [cases, filters]);

  // Update selected case when cases update
  useEffect(() => {
    setSelected((currentSelected) => {
      if (!currentSelected) return currentSelected;
      const updated = cases.find(c => c.id === currentSelected.id);
      return updated || currentSelected;
    });
  }, [cases]);

  // Auto-hide messages
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(""), 8000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  // Check if user has police role
  if (!loading && userProfile && userProfile.role !== 'police') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the Police Dashboard.
          </p>
          <div className="text-left bg-amber-50 p-5 rounded-xl text-sm text-gray-700 mb-6 border border-amber-200">
            <p className="font-semibold mb-3">Your current role: <span className="text-amber-700 font-bold">{userProfile.role || 'Not set'}</span></p>
            <p className="font-semibold mb-2">To access Police Dashboard:</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Go to Firebase Console → Firestore Database</li>
              <li>Navigate to <code className="bg-amber-100 px-2 py-0.5 rounded border border-amber-300 text-gray-800 font-mono text-xs">users</code> collection</li>
              <li>Find your user document (email: {userProfile.email || 'your email'})</li>
              <li>Add/update field: <code className="bg-amber-100 px-2 py-0.5 rounded border border-amber-300 text-gray-800 font-mono text-xs">role = "police"</code></li>
              <li>Click "Update" and refresh this page</li>
            </ol>
          </div>
          <button 
            onClick={() => navigate('/login/police')} 
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Go to Police Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  async function markCaseViewed(caseDocId) {
    setUpdating(true);
    setErrorMsg("");
    try {
      const docRef = doc(db, 'cases', caseDocId);
      const currentDoc = await getDoc(docRef);
      if (!currentDoc.exists()) {
        throw new Error('Case not found');
      }
      const currentData = currentDoc.data();
      const currentTracking = currentData?.tracking || [];
      const now = Date.now();
      
      await updateDoc(docRef, {
        viewedAt: now,
        tracking: [...currentTracking, {
          event: 'Case Viewed',
          description: 'Police officer reviewed the case',
          timestamp: now,
          by: userProfile?.name || userProfile?.email || 'Police Officer'
        }],
        updatedAt: now
      });
      
      // Notify victim that case was viewed
      if (currentData.victimUid) {
        try {
          await notifyVictimPoliceUpdate(
            currentData.victimUid,
            currentData.caseId || caseDocId,
            'viewed',
            {}
          )
        } catch (notifError) {
          console.error('Failed to notify victim:', notifError)
        }
      }
      
      setSuccessMsg('Case marked as viewed successfully');
      const updated = { ...selected, viewedAt: now, tracking: [...currentTracking, {
        event: 'Case Viewed',
        description: 'Police officer reviewed the case',
        timestamp: now,
        by: userProfile?.name || userProfile?.email || 'Police Officer'
      }] };
      setSelected(updated);
    } catch (err) {
      console.error('Error marking case as viewed:', err);
      if (err.message?.includes('ERR_BLOCKED_BY_CLIENT') || err.message?.includes('network')) {
        setErrorMsg('Network error: Browser extension may be blocking Firebase. Please disable ad blockers.');
      } else {
        setErrorMsg('Failed to mark case as viewed: ' + err.message);
      }
    } finally {
      setUpdating(false);
    }
  }

  async function fileFIR(caseDocId) {
    if (!firNumber.trim()) {
      setErrorMsg('Please enter FIR number');
      return;
    }
    
    setUpdating(true);
    setErrorMsg("");
    try {
      const docRef = doc(db, 'cases', caseDocId);
      const currentDoc = await getDoc(docRef);
      if (!currentDoc.exists()) {
        throw new Error('Case not found');
      }
      const currentData = currentDoc.data();
      const currentTracking = currentData?.tracking || [];
      const currentTimeline = currentData?.timeline || [];
      const now = Date.now();
      
      await updateDoc(docRef, {
        firFiledAt: now,
        firNumber: firNumber.trim(),
        status: 'In Process',
        tracking: [...currentTracking, {
          event: 'FIR Filed',
          description: `FIR filed with number: ${firNumber.trim()}`,
          timestamp: now,
          by: userProfile?.name || userProfile?.email || 'Police Officer'
        }],
        timeline: [...currentTimeline, {
          status: 'In Process',
          note: `FIR filed: ${firNumber.trim()}`,
          at: now
        }],
        updatedAt: now
      });
      
      // Notify victim about FIR filing
      if (currentData.victimUid) {
        try {
          await notifyVictimPoliceUpdate(
            currentData.victimUid,
            currentData.caseId || caseDocId,
            'fir',
            { firNumber: firNumber.trim() }
          )
        } catch (notifError) {
          console.error('Failed to notify victim:', notifError)
        }
      }
      
      setSuccessMsg(`FIR filed successfully with number: ${firNumber.trim()}`);
      setShowFirModal(false);
      setFirNumber("");
      
      // Update selected case with all new data including tracking
      const updatedTracking = [...currentTracking, {
        event: 'FIR Filed',
        description: `FIR filed with number: ${firNumber.trim()}`,
        timestamp: now,
        by: userProfile?.name || userProfile?.email || 'Police Officer'
      }];
      const updated = { 
        ...selected, 
        firFiledAt: now, 
        firNumber: firNumber.trim(), 
        status: 'In Process',
        tracking: updatedTracking
      };
      setSelected(updated);
    } catch (err) {
      console.error('Error filing FIR:', err);
      if (err.message?.includes('ERR_BLOCKED_BY_CLIENT') || err.message?.includes('network')) {
        setErrorMsg('Network error: Browser extension may be blocking Firebase. Please disable ad blockers.');
      } else {
        setErrorMsg('Failed to file FIR: ' + err.message);
      }
    } finally {
      setUpdating(false);
    }
  }

  async function sendMessage(caseDocId) {
    if (!messageText.trim()) {
      setErrorMsg('Please enter a message');
      return;
    }
    
    setUpdating(true);
    setErrorMsg("");
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
        from: 'police',
        message: messageText.trim(),
        timestamp: now,
        senderName: userProfile?.name || userProfile?.email || 'Police Officer'
      };
      
      await updateDoc(docRef, {
        messages: [...currentMessages, newMessage],
        updatedAt: now
      });
      
      // Notify victim about police message
      if (currentData.victimUid) {
        try {
          await notifyVictimPoliceUpdate(
            currentData.victimUid,
            currentData.caseId || caseDocId,
            'message',
            { message: messageText.trim() }
          )
        } catch (notifError) {
          console.error('Failed to notify victim:', notifError)
        }
      }
      
      setSuccessMsg('Message sent successfully');
      setMessageText("");
      
      const updated = { ...selected, messages: [...currentMessages, newMessage] };
      setSelected(updated);
    } catch (err) {
      console.error('Error sending message:', err);
      if (err.message?.includes('ERR_BLOCKED_BY_CLIENT') || err.message?.includes('network')) {
        setErrorMsg('Network error: Browser extension may be blocking Firebase. Please disable ad blockers.');
      } else {
        setErrorMsg('Failed to send message: ' + err.message);
      }
    } finally {
      setUpdating(false);
    }
  }

  async function addCaseNote(caseDocId) {
    if (!caseNote.trim()) {
      setErrorMsg('Please enter a case note');
      return;
    }
    
    setUpdating(true);
    setErrorMsg("");
    try {
      const docRef = doc(db, 'cases', caseDocId);
      const currentDoc = await getDoc(docRef);
      if (!currentDoc.exists()) {
        throw new Error('Case not found');
      }
      const currentData = currentDoc.data();
      const currentTracking = currentData?.tracking || [];
      const now = Date.now();
      
      await updateDoc(docRef, {
        tracking: [...currentTracking, {
          event: 'Case Note Added',
          description: caseNote.trim(),
          timestamp: now,
          by: userProfile?.name || userProfile?.email || 'Police Officer'
        }],
        updatedAt: now
      });
      
      // Notify victim about case note
      if (currentData.victimUid) {
        try {
          await notifyVictimPoliceUpdate(
            currentData.victimUid,
            currentData.caseId || caseDocId,
            'note',
            { note: caseNote.trim() }
          )
        } catch (notifError) {
          console.error('Failed to notify victim:', notifError)
        }
      }
      
      setSuccessMsg('Case note added successfully');
      setShowNoteModal(false);
      setCaseNote("");
      
      const updated = { ...selected, tracking: [...currentTracking, {
        event: 'Case Note Added',
        description: caseNote.trim(),
        timestamp: now,
        by: userProfile?.name || userProfile?.email || 'Police Officer'
      }] };
      setSelected(updated);
    } catch (err) {
      console.error('Error adding case note:', err);
      if (err.message?.includes('ERR_BLOCKED_BY_CLIENT') || err.message?.includes('network')) {
        setErrorMsg('Network error: Browser extension may be blocking Firebase. Please disable ad blockers.');
      } else {
        setErrorMsg('Failed to add case note: ' + err.message);
      }
    } finally {
      setUpdating(false);
    }
  }

  async function markStatus(caseDocId, status, note='') {
    setUpdating(true);
    setErrorMsg("");
    try {
      const docRef = doc(db, 'cases', caseDocId);
      const currentDoc = await getDoc(docRef);
      if (!currentDoc.exists()) {
        throw new Error('Case not found');
      }
      const currentData = currentDoc.data();
      const currentTimeline = currentData?.timeline || [];
      const currentTracking = currentData?.tracking || [];
      const now = Date.now();
      
      await updateDoc(docRef, {
        status,
        updatedAt: now,
        timeline: [...currentTimeline, { status, note, at: now }],
        tracking: [...currentTracking, {
          event: 'Status Updated',
          description: `Status changed to: ${status}${note ? ` - ${note}` : ''}`,
          timestamp: now,
          by: userProfile?.name || userProfile?.email || 'Police Officer'
        }]
      });
      
      // Notify victim about status update
      if (currentData.victimUid) {
        try {
          await notifyVictimPoliceUpdate(
            currentData.victimUid,
            currentData.caseId || caseDocId,
            'status',
            { status, note }
          )
        } catch (notifError) {
          console.error('Failed to notify victim:', notifError)
        }
      }
      
      setSuccessMsg(`Case status updated to: ${status}`);
      const updated = { ...selected, status };
      setSelected(updated);
    } catch (err) {
      console.error('Error updating status:', err);
      if (err.message?.includes('ERR_BLOCKED_BY_CLIENT') || err.message?.includes('network')) {
        setErrorMsg('Network error: Browser extension may be blocking Firebase. Please disable ad blockers.');
      } else {
        setErrorMsg('Failed to update status: ' + err.message);
      }
    } finally {
      setUpdating(false);
    }
  }

  async function requestBankInvestigation(caseDocId) {
    setUpdating(true);
    setErrorMsg("");
    try {
      const docRef = doc(db, 'cases', caseDocId);
      const currentDoc = await getDoc(docRef);
      if (!currentDoc.exists()) {
        throw new Error('Case not found');
      }
      const currentData = currentDoc.data();
      const currentTracking = currentData?.tracking || [];
      const currentMessages = currentData?.messages || [];
      const now = Date.now();
      
      await updateDoc(docRef, {
        status: 'In Process',
        tracking: [...currentTracking, {
          event: 'Bank Investigation Requested',
          description: 'Police requested bank to investigate transaction and freeze funds (RBI/NPCI compliant)',
          timestamp: now,
          by: userProfile?.name || userProfile?.email || 'Police Officer'
        }],
        messages: [...currentMessages, {
          from: 'police',
          message: 'Bank investigation requested. Please investigate the transaction and freeze funds as per RBI/NPCI guidelines.',
          timestamp: now,
          senderName: userProfile?.name || userProfile?.email || 'Police Officer'
        }],
        updatedAt: now
      });
      
      // Notify victim about bank investigation request
      if (currentData.victimUid) {
        try {
          await notifyVictimPoliceUpdate(
            currentData.victimUid,
            currentData.caseId || caseDocId,
            'investigation',
            {}
          )
        } catch (notifError) {
          console.error('Failed to notify victim:', notifError)
        }
      }
      
      // Notify all bank users about investigation request
      try {
        await createNotificationForRole(
          'bank',
          'Bank Investigation Requested by Police',
          `Police has requested investigation for case ${currentData.caseId || caseDocId}. Victim: ${currentData.victimName || 'Unknown'}. Amount: ₹${currentData.amountLost || 0}`,
          `/bank-dashboard?caseId=${currentData.caseId || caseDocId}`,
          'investigation_request'
        )
      } catch (notifError) {
        console.error('Failed to notify bank:', notifError)
      }
      
      setSuccessMsg('Bank investigation requested successfully');
      const updated = { ...selected, status: 'In Process' };
      setSelected(updated);
    } catch (err) {
      console.error('Error requesting bank investigation:', err);
      if (err.message?.includes('ERR_BLOCKED_BY_CLIENT') || err.message?.includes('network')) {
        setErrorMsg('Network error: Browser extension may be blocking Firebase. Please disable ad blockers.');
      } else {
        setErrorMsg('Failed to request bank investigation: ' + err.message);
      }
    } finally {
      setUpdating(false);
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                Police Dashboard
              </h1>
              <p className="text-base font-semibold text-gray-700 sm:text-lg">Cyber Crime Investigation & Case Management</p>
              <p className="text-gray-500 text-sm mt-1">RBI/NPCI Compliant System</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button 
                onClick={() => navigate('/police-stats')} 
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Statistics
              </button>
              <button 
                onClick={() => navigate('/login')} 
                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2.5 font-semibold text-white shadow-md transition-all duration-200 hover:from-amber-600 hover:to-yellow-600 hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-green-800 font-semibold text-sm">{successMsg}</p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-800 font-semibold text-sm">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2.5">Filter by Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-white text-gray-700 font-medium"
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
              <label className="block text-sm font-bold text-gray-700 mb-2.5">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-white text-gray-700 font-medium"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="updated">Recently Updated</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2.5">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by Case ID, Fraud Type, or Victim Name"
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-400"
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
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">All Cases</h2>
                <p className="text-xs text-gray-500 mt-0.5">Total cases in system</p>
              </div>
              <span className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg text-sm font-bold shadow-md">
                {filteredCases.length} / {cases.length}
              </span>
            </div>
          </div>

          <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
            {filteredCases.map((c, index) => (
              <div
                key={c.id || c.caseId}
                onClick={() => {
                  setSelected(c);
                  if (!c.viewedAt) {
                    markCaseViewed(c.id);
                  }
                }}
                className={`bg-white rounded-xl shadow-sm border-2 cursor-pointer transition-all duration-200 p-4 hover:shadow-md hover:border-amber-300 ${
                  selected?.id === c.id ? 'ring-2 ring-amber-400 border-amber-400 shadow-lg scale-[1.01]' : 'border-gray-200'
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-gray-500 font-semibold">{c.caseId}</span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold border-2 ${getStatusColor(c.status)}`}>
                    {c.status}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5 text-base">{c.fraudType || 'Unknown'}</h3>
                <p className="text-sm text-gray-600 font-medium">{c.victimName || 'Unknown Victim'}</p>
                <div className="flex items-center gap-3 mt-2.5">
                  {c.viewedAt && (
                    <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Viewed
                    </span>
                  )}
                  {c.firFiledAt && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      FIR: {c.firNumber}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Case Details */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-gray-200">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">Case Details</h2>
                <span className={`px-5 py-2.5 rounded-xl text-sm font-bold border-2 shadow-sm ${getStatusColor(selected.status)}`}>
                  {selected.status}
                </span>
              </div>

              <div className="space-y-6">
                {/* Tracking Progress */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Investigation Timeline</h3>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 p-6 rounded-xl shadow-sm">
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
                      // (This handles cases where the fields exist but tracking wasn't updated)
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
                            <div className="absolute left-4 top-4 bottom-4 w-1 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-300 rounded-full shadow-sm"></div>
                          )}
                          
                          <div className="space-y-0">
                            {timeline.map((item, idx) => {
                              const colorClasses = {
                                green: 'bg-emerald-500 border-emerald-600 shadow-emerald-200',
                                blue: 'bg-blue-500 border-blue-600 shadow-blue-200',
                                purple: 'bg-violet-500 border-violet-600 shadow-violet-200',
                                cyan: 'bg-gray-500 border-gray-600 shadow-gray-200'
                              };
                              const colorClass = colorClasses[item.color] || 'bg-gray-500 border-gray-600 shadow-gray-200';
                              
                              return (
                                <div key={idx} className="flex items-start gap-4 relative pb-6">
                                  {/* Timeline point */}
                                  <div className="relative z-10">
                                    <div className={`w-8 h-8 ${colorClass} rounded-full border-2 border-white flex items-center justify-center shadow-lg`}>
                                      <div className="w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                  </div>
                                  
                                  {/* Content */}
                                  <div className="flex-1 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                    <p className="text-gray-900 font-bold text-base mb-1">{item.event}</p>
                                    <p className="text-gray-700 text-sm mb-2">{item.description}</p>
                                    {item.firNumber && (
                                      <p className="text-gray-900 text-sm font-semibold mb-2 bg-amber-50 px-3 py-1.5 rounded border border-amber-200 inline-block">
                                        FIR Number: {item.firNumber}
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-500 font-medium">
                                      {formatDateTime(item.timestamp)} {item.by ? `• by ${item.by}` : ''}
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
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Case ID</label>
                      <p className="text-lg font-mono font-bold text-gray-900">{selected.caseId}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Fraud Type</label>
                      <p className="text-lg font-bold text-gray-900">{selected.fraudType}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Status</label>
                      <p className="text-base font-semibold text-gray-800">{selected.status || 'Pending'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Created</label>
                      <p className="text-base font-semibold text-gray-800">
                        {formatDateTime(selected.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Victim Location Section - Prominent Display */}
                {selected.locationLatitude && selected.locationLongitude && (
                  <div className="border-2 border-amber-300 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-amber-50">
                    <div className="px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700">
                      <div className="flex items-center gap-2">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h3 className="text-lg font-bold text-white">📍 Victim Location</h3>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-white rounded-lg p-3 border border-amber-200">
                          <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Latitude</label>
                          <p className="text-lg font-mono text-gray-800 font-semibold">{selected.locationLatitude.toFixed(6)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-amber-200">
                          <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Longitude</label>
                          <p className="text-lg font-mono text-gray-800 font-semibold">{selected.locationLongitude.toFixed(6)}</p>
                        </div>
                        {selected.locationAccuracy && (
                          <div className="bg-white rounded-lg p-3 border border-amber-200">
                            <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Accuracy</label>
                            <p className="text-lg text-gray-800 font-semibold">±{Math.round(selected.locationAccuracy)} meters</p>
                          </div>
                        )}
                        {selected.locationTimestamp && (
                          <div className="bg-white rounded-lg p-3 border border-amber-200">
                            <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Captured At</label>
                            <p className="text-sm text-gray-800">{formatDateTime(selected.locationTimestamp)}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Map Display - OpenStreetMap Embed */}
                      <div className="mb-4">
                        <div className="bg-white rounded-lg border border-amber-200 overflow-hidden">
                          <iframe
                            width="100%"
                            height="300"
                            frameBorder="0"
                            scrolling="no"
                            marginHeight="0"
                            marginWidth="0"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${selected.locationLongitude - 0.01},${selected.locationLatitude - 0.01},${selected.locationLongitude + 0.01},${selected.locationLatitude + 0.01}&layer=mapnik&marker=${selected.locationLatitude},${selected.locationLongitude}`}
                            title="Victim Location Map"
                            className="w-full"
                          ></iframe>
                          <div className="p-3 bg-gray-50 border-t border-amber-200">
                            <p className="text-xs text-gray-600 text-center">
                              Map showing victim location • Click buttons below to view in Google Maps or get directions
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`https://www.google.com/maps?q=${selected.locationLatitude},${selected.locationLongitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary text-sm flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Open in Google Maps
                        </a>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${selected.locationLatitude},${selected.locationLongitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary text-sm flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          Get Directions
                        </a>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${selected.locationLatitude}, ${selected.locationLongitude}`);
                            setSuccessMsg('Location coordinates copied to clipboard!');
                          }}
                          className="btn-secondary text-sm flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy Coordinates
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Personal Details Section */}
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <button
                    onClick={() => setExpandedSections({...expandedSections, personalDetails: !expandedSections.personalDetails})}
                    className="w-full px-5 py-4 bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 transition-all duration-200 flex items-center justify-between border-b-2 border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-md">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Personal Details</h3>
                    </div>
                    <svg 
                      className={`w-6 h-6 text-amber-700 transition-transform duration-200 ${expandedSections.personalDetails ? 'rotate-180' : ''}`}
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
                    className="w-full px-5 py-4 bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 transition-all duration-200 flex items-center justify-between border-b-2 border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Incident Details</h3>
                    </div>
                    <svg 
                      className={`w-6 h-6 text-amber-700 transition-transform duration-200 ${expandedSections.incidentDetails ? 'rotate-180' : ''}`}
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
                    <label className="text-sm text-gray-500 mb-2 block">Description</label>
                    <div className="glass-dark p-4 rounded-lg">
                      <p className="text-gray-700">{selected.description}</p>
                    </div>
                  </div>
                )}

                {/* Transaction Details Section */}
                {selected.transactions && selected.transactions[0] && (
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <button
                      onClick={() => setExpandedSections({...expandedSections, transactionDetails: !expandedSections.transactionDetails})}
                      className="w-full px-5 py-4 bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 transition-all duration-200 flex items-center justify-between border-b-2 border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-md">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Transaction Details</h3>
                      </div>
                      <svg 
                        className={`w-6 h-6 text-amber-700 transition-transform duration-200 ${expandedSections.transactionDetails ? 'rotate-180' : ''}`}
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
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Communication</h3>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 p-5 rounded-xl max-h-64 overflow-y-auto space-y-3 mb-4 shadow-sm">
                    {selected.messages && selected.messages.length > 0 ? (
                      selected.messages.map((msg, idx) => (
                        <div key={idx} className={`p-3 rounded-lg ${msg.from === 'police' ? 'bg-amber-100/50' : 'bg-blue-100/50'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-gray-800">
                              {msg.from === 'police' ? '👮 Police' : '🏦 Bank'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDateTime(msg.timestamp)}
                            </span>
                          </div>
                          <p className="text-gray-800 text-sm">{msg.message}</p>
                          <p className="text-xs text-gray-600 mt-1">- {msg.senderName}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No messages yet</p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message to victim..."
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-400"
                      onKeyPress={(e) => e.key === 'Enter' && !updating && sendMessage(selected.id)}
                      disabled={updating}
                    />
                    <button
                      onClick={() => sendMessage(selected.id)}
                      disabled={updating || !messageText.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating ? '...' : 'Send'}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Case Actions</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {!selected.viewedAt && (
                      <button
                        onClick={() => markCaseViewed(selected.id)}
                        disabled={updating}
                        className="px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        ✓ Mark as Viewed
                      </button>
                    )}
                    {!selected.firFiledAt && (
                      <button
                        onClick={() => setShowFirModal(true)}
                        disabled={updating}
                        className="px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        📄 File FIR
                      </button>
                    )}
                    <button
                      onClick={() => markStatus(selected.id, 'In Process', 'Case investigation started')}
                      disabled={updating || selected.status === 'In Process'}
                      className="px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      🔍 Start Investigation
                    </button>
                    <button
                      onClick={() => requestBankInvestigation(selected.id)}
                      disabled={updating || selected.status === 'Funds Frozen'}
                      className="px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      🏦 Request Bank Investigation
                    </button>
                    <button
                      onClick={() => setShowNoteModal(true)}
                      disabled={updating}
                      className="px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      📝 Add Case Note
                    </button>
                    <button
                      onClick={() => markStatus(selected.id, 'Closed', 'Case investigation completed')}
                      disabled={updating || selected.status === 'Closed'}
                      className="px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      ✅ Close Case
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-600 text-lg font-semibold">Select a case to view details</p>
              <p className="text-gray-500 text-sm mt-2">Click on any case from the list to see full information</p>
            </div>
          )}
        </div>
      </div>

      {/* FIR Modal */}
      {showFirModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowFirModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">File FIR</h3>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2.5">FIR Number</label>
              <input
                type="text"
                value={firNumber}
                onChange={(e) => setFirNumber(e.target.value)}
                placeholder="Enter FIR number (e.g., FIR-2024-001234)"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && !updating && firNumber.trim() && fileFIR(selected.id)}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowFirModal(false);
                  setFirNumber("");
                }}
                className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={() => fileFIR(selected.id)}
                disabled={updating || !firNumber.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Filing...' : 'File FIR'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Case Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowNoteModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Add Case Note</h3>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2.5">Note</label>
              <textarea
                value={caseNote}
                onChange={(e) => setCaseNote(e.target.value)}
                placeholder="Enter investigation notes, findings, or observations..."
                rows={5}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none text-gray-700 placeholder-gray-400"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setCaseNote("");
                }}
                className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={() => addCaseNote(selected.id)}
                disabled={updating || !caseNote.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Adding...' : 'Add Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
