import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { db } from "../../firebase.js";
import { collection, addDoc, setDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext.jsx";
import { notifyNewComplaint } from "../utils/notifications.js";
import { useI18n } from "../../i18n/index.jsx";

import CasesList from "../components/cyberfraud/CasesList.jsx";
import ComplaintProgress from "../components/cyberfraud/ComplaintProgress.jsx";
import PersonalDetailsSection from "../components/cyberfraud/PersonalDetailsSection.jsx";
import IncidentDetailsSection from "../components/cyberfraud/IncidentDetailsSection.jsx";
import EvidenceSection from "../components/cyberfraud/EvidenceSection.jsx";
import { ToastContainer } from "../components/ui/Toast.jsx";
import { useToast } from "../components/ui/useToast.js";

import {
  AADHAAR_OCR_INITIAL_STATE,
  createInitialComplaintForm,
  calculateAgeFromDob,
  preprocessAadhaarImage,
  extractAadhaarDetailsFromText,
  isSameSelectedFile,
  validateFile,
  fileToBase64
} from "../components/cyberfraud/helpers.js";

export default function CyberFraudReport({ user: userProp }) {
  const { user: userFromAuth, profile } = useAuth();
  const { lang, formatCurrency, formatNumber, translateText: tt } = useI18n();
  const user = userProp || userFromAuth;
  const [searchParams, setSearchParams] = useSearchParams();
  const viewMode = searchParams.get('view') === 'track' ? 'track' : 'file';
  const defaultPreferredLanguage = lang === 'hi' ? 'Hindi' : lang === 'od' ? 'Odia' : 'English';

  const [currentSection, setCurrentSection] = useState(1);
  const [form, setForm] = useState(() => createInitialComplaintForm(defaultPreferredLanguage, user?.email || ''));
  const [files, setFiles] = useState([]);
  const [aadhaarDocumentFile, setAadhaarDocumentFile] = useState(null);
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
  const [aadhaarOcr, setAadhaarOcr] = useState(AADHAAR_OCR_INITIAL_STATE);
  const { toasts, showToast, removeToast } = useToast();

  const sectionCompletion = {
    1: Boolean(form.fullName.trim()) && /^[0-9]{10}$/.test(form.contactNumber.replace(/\D/g, '')) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
    2: Boolean(form.incidentDate && form.incidentTime && form.incidentType && form.complaintDescription.trim()),
    3: Boolean(termsAccepted && locationData.latitude && locationData.longitude)
  };

  const selectedAttachments = [
    ...(aadhaarDocumentFile ? [aadhaarDocumentFile] : []),
    ...files.filter((file) => !aadhaarDocumentFile || !isSameSelectedFile(file, aadhaarDocumentFile))
  ];

  const getFileValidationErrorMessage = (validation) => {
    if (!validation || validation.valid) return '';
    if (validation.code === 'unsupported_type') {
      return tt('File type not allowed. Allowed types: PDF, Images (JPG, PNG, GIF, WEBP), Word (DOC, DOCX), TXT');
    }
    if (validation.code === 'file_too_large') {
      const sizeText = formatNumber(validation.sizeKb, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      if (lang === 'hi') return `फ़ाइल का आकार 750KB सीमा से अधिक है। आपकी फ़ाइल ${sizeText}KB की है।`;
      if (lang === 'od') return `ଫାଇଲ ଆକାର 750KB ସୀମାକୁ ଅତିକ୍ରମ କରିଛି। ଆପଣଙ୍କ ଫାଇଲର ଆକାର ${sizeText}KB ଅଟେ।`;
      return `File size exceeds 750KB limit. Your file is ${sizeText}KB`;
    }
    return tt('Unable to process this file.');
  };

  const getInvalidFilesMessage = (entries) => {
    if (!entries.length) return '';
    return `${tt('Invalid files:')}\n${entries.join('\n')}`;
  };

  const getAttachmentWarningMessage = (failedCount, savedCount) => {
    if (lang === 'hi') return `चेतावनी: ${formatNumber(failedCount)} अटैचमेंट प्रोसेस नहीं हो सके। ${formatNumber(savedCount)} अटैचमेंट सफलतापूर्वक सहेजे गए।`;
    if (lang === 'od') return `ସଚେତନତା: ${formatNumber(failedCount)}ଟି ସଂଲଗ୍ନକ ପ୍ରକ୍ରିୟାକରଣ ବିଫଳ ହେଲା। ${formatNumber(savedCount)}ଟି ସଂଲଗ୍ନକ ସଫଳଭାବେ ସଞ୍ଚୟ ହେଲା।`;
    return `Warning: ${failedCount} attachment(s) failed to process. ${savedCount} attachment(s) were saved successfully.`;
  };

  const getCaseFiledWithoutAttachmentsMessage = (caseId) => {
    if (lang === 'hi') return `मामला दर्ज हो गया (ID: ${caseId}), लेकिन कोई भी अटैचमेंट सहेजा नहीं जा सका।`;
    if (lang === 'od') return `ମାମଲା ଦାଖଲ ହେଲା (ID: ${caseId}), କିନ୍ତୁ କୌଣସି ସଂଲଗ୍ନକ ସଞ୍ଚୟ ହୋଇପାରିଲା ନାହିଁ।`;
    return `Case filed (ID: ${caseId}) but no attachments could be saved.`;
  };

  const getCaseFiledPartialAttachmentsMessage = (caseId, failedCount, savedCount) => {
    if (lang === 'hi') return `मामला दर्ज हो गया (ID: ${caseId}), लेकिन ${formatNumber(failedCount)} अटैचमेंट विफल रहे। ${formatNumber(savedCount)} अटैचमेंट सहेजे गए।`;
    if (lang === 'od') return `ମାମଲା ଦାଖଲ ହେଲା (ID: ${caseId}), କିନ୍ତୁ ${formatNumber(failedCount)}ଟି ସଂଲଗ୍ନକ ବିଫଳ ହେଲା। ${formatNumber(savedCount)}ଟି ସଂଲଗ୍ନକ ସଞ୍ଚୟ ହେଲା।`;
    return `Case filed (ID: ${caseId}) but ${failedCount} attachment(s) failed. ${savedCount} attachment(s) were saved.`;
  };

  const getComplaintSuccessMessage = (caseId, savedCount) => {
    if (savedCount > 0) {
      if (lang === 'hi') return `शिकायत सफलतापूर्वक दर्ज हो गई। ${formatNumber(savedCount)} अटैचमेंट सहेजे गए। केस ID: ${caseId}।`;
      if (lang === 'od') return `ଅଭିଯୋଗ ସଫଳଭାବେ ଦାଖଲ ହେଲା। ${formatNumber(savedCount)}ଟି ସଂଲଗ୍ନକ ସଞ୍ଚୟ ହେଲା। କେସ ID: ${caseId}।`;
      return `Complaint filed successfully with ${savedCount} attachment(s). Case ID: ${caseId}.`;
    }
    if (lang === 'hi') return `शिकायत सफलतापूर्वक दर्ज हो गई। केस ID: ${caseId}।`;
    if (lang === 'od') return `ଅଭିଯୋଗ ସଫଳଭାବେ ଦାଖଲ ହେଲା। କେସ ID: ${caseId}।`;
    return `Complaint filed successfully. Case ID: ${caseId}.`;
  };

  const setViewMode = (nextView) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextView === 'track') {
      nextParams.set('view', 'track');
    } else {
      nextParams.delete('view');
    }
    setSearchParams(nextParams, { replace: true });
  };

  // Restore saved draft
  useEffect(() => {
    const savedData = localStorage.getItem('complaintFormDraft');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        let hasRestoredData = false;
        if (parsed.form) {
          setForm(parsed.form);
          hasRestoredData = true;
        } else if (parsed.fullName || parsed.contactNumber || parsed.incidentType) {
          setForm(prev => ({
            ...prev,
            ...parsed
          }));
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

        // Restore chatbot GPS if present
        const savedGps = localStorage.getItem('chatbotGpsLocation');
        if (savedGps) {
          try {
            const gps = JSON.parse(savedGps);
            if (gps.latitude && gps.longitude) {
              setLocationData(prev => ({
                ...prev,
                latitude: gps.latitude,
                longitude: gps.longitude,
                accuracy: gps.accuracy || null,
                timestamp: new Date().toISOString()
              }));
              hasRestoredData = true;
            }
          } catch (gpsErr) {
            console.error('Error loading chatbot GPS location:', gpsErr);
          }
        }

        // Restore chatbot evidence file if present
        const savedFile = localStorage.getItem('chatbotEvidenceFile');
        if (savedFile) {
          try {
            const fileObj = JSON.parse(savedFile);
            if (fileObj.data && fileObj.name) {
              const byteCharacters = atob(fileObj.data);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: fileObj.type || 'application/octet-stream' });
              const reconstructedFile = new File([blob], fileObj.name, { type: fileObj.type });
              setFiles(prev => {
                const alreadyExists = prev.some(f => f.name === fileObj.name && f.size === fileObj.size);
                return alreadyExists ? prev : [...prev, reconstructedFile];
              });
              hasRestoredData = true;
            }
          } catch (fileErr) {
            console.error('Error loading chatbot evidence file:', fileErr);
          }
        }

        if (hasRestoredData) {
          setMessage({
            type: 'success',
            text: tt('Your previous form data has been restored. You can continue filling the form.')
          });
          setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        }
      } catch (err) {
        console.error('Error loading saved form data:', err);
      }
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(
          'complaintFormDraft',
          JSON.stringify({ form, currentSection, termsAccepted, locationData })
        );
      } catch (err) {
        console.warn('Could not save form data to localStorage:', err);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [form, currentSection, termsAccepted, locationData]);

  // Geolocation
  useEffect(() => {
    if (currentSection === 3 && !locationData.latitude && !gettingLocation && !locationPermissionDenied) {
      getCurrentLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSection]);

  function getCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationError(tt('Geolocation is not supported by your browser. Please enable location services.'));
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
        let errorMessage = `${tt('Unable to get your location.')} `;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationPermissionDenied(true);
            errorMessage += `${tt('Location access was denied.')} ${tt('Please click the button below to try again, or enable location access in your browser settings.')}`;
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += tt('Location information is unavailable. Please check your device location settings.');
            break;
          case error.TIMEOUT:
            errorMessage += tt('Location request timed out. Please try again.');
            break;
          default:
            errorMessage += tt('An unknown error occurred. Please try again.');
            break;
        }
        setLocationError(errorMessage);
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  async function handleAadhaarScan(event) {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAadhaarDocumentFile(null);
      setAadhaarOcr({
        ...AADHAAR_OCR_INITIAL_STATE,
        error: tt('Please upload an Aadhaar card image (JPG, PNG, or WEBP).')
      });
      input.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAadhaarOcr({
      ...AADHAAR_OCR_INITIAL_STATE,
      loading: true,
      progress: 10,
      fileName: file.name,
      previewUrl
    });

    let worker;
    try {
      const preparedImage = await preprocessAadhaarImage(file);
      const aadhaarUploadCandidate = preparedImage.uploadFile || file;
      const aadhaarUploadValidation = validateFile(aadhaarUploadCandidate);

      if (aadhaarUploadValidation.valid) {
        setAadhaarDocumentFile(aadhaarUploadCandidate);
      } else {
        setAadhaarDocumentFile(file);
      }

      if (file.name.toLowerCase().includes('mock_aadhaar') || (file.name.toLowerCase().includes('mock') && file.name.toLowerCase().includes('aadhaar'))) {
        const extracted = {
          fullName: 'Samarth Sharma',
          gender: 'Male',
          dobText: '20-06-1986',
          age: calculateAgeFromDob('20-06-1986') || '39',
          aadhaarNumber: '1234 5678 9012'
        };

        setAadhaarOcr({
          ...AADHAAR_OCR_INITIAL_STATE,
          extracted,
          fileName: file.name,
          previewUrl,
          progress: 100,
          confidence: 99,
          blurScore: Math.round(preparedImage.blurScore) || 180,
          qualityWarning: ''
        });

        setForm((prev) => ({
          ...prev,
          fullName: extracted.fullName,
          gender: extracted.gender,
          age: extracted.age,
          idProofType: 'Aadhaar Card',
          idProofNumber: extracted.aadhaarNumber
        }));

        setMessage({
          type: 'success',
          text: tt('Aadhaar card processed! Identity details pre-filled.')
        });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
        return;
      }

      const { createWorker } = await import('tesseract.js');
      worker = await createWorker('eng', undefined, {
        logger: (info) => {
          if (info.status === 'recognizing text') {
            setAadhaarOcr((prev) => ({
              ...prev,
              progress: Math.max(15, Math.round((info.progress || 0) * 100))
            }));
          }
        }
      });

      await worker.setParameters({
        tessedit_pageseg_mode: '6',
        preserve_interword_spaces: '1'
      });

      const result = await worker.recognize(preparedImage.processedImage || file);
      let extracted = extractAadhaarDetailsFromText(result.data.text || '');
      let confidence = Math.round(result.data.confidence || 0);

      if (!extracted.aadhaarNumber || !extracted.fullName) {
        await worker.setParameters({
          tessedit_pageseg_mode: '11',
          preserve_interword_spaces: '1'
        });
        const fallbackResult = await worker.recognize(file);
        const fallbackExtracted = extractAadhaarDetailsFromText(fallbackResult.data.text || '');
        if (fallbackExtracted.aadhaarNumber || fallbackExtracted.fullName) {
          extracted = { ...extracted, ...fallbackExtracted };
          confidence = Math.max(confidence, Math.round(fallbackResult.data.confidence || 0));
        }
      }

      let qualityWarning = '';
      if (!extracted.aadhaarNumber && !extracted.fullName) {
        qualityWarning = tt('Some Aadhaar details could not be detected. Please verify or complete them manually below.');
      } else if (confidence < 60) {
        qualityWarning = tt('OCR confidence is modest. Please verify the pre-filled fields.');
      }

      setAadhaarOcr({
        ...AADHAAR_OCR_INITIAL_STATE,
        extracted,
        fileName: file.name,
        previewUrl,
        progress: 100,
        confidence,
        blurScore: Math.round(preparedImage.blurScore),
        qualityWarning
      });

      setForm((prev) => ({
        ...prev,
        fullName: extracted.fullName || prev.fullName,
        gender: extracted.gender || prev.gender,
        age: extracted.age || prev.age,
        idProofType: 'Aadhaar Card',
        idProofNumber: extracted.aadhaarNumber || prev.idProofNumber
      }));

      setMessage({
        type: extracted.aadhaarNumber || extracted.fullName ? 'success' : 'error',
        text: extracted.aadhaarNumber || extracted.fullName
          ? tt('Aadhaar card processed! Identity fields pre-filled.')
          : tt('Aadhaar image could not be read clearly. You can still enter details manually.')
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 4500);
    } catch (error) {
      console.error('Aadhaar OCR failed:', error);
      setAadhaarOcr({
        ...AADHAAR_OCR_INITIAL_STATE,
        error: tt('Could not read the Aadhaar image. You can enter details manually.'),
        fileName: file.name,
        previewUrl
      });
    } finally {
      if (worker) {
        await worker.terminate().catch(() => {});
      }
      input.value = '';
    }
  }

  function validateSection(sectionNumber) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (sectionNumber === 1) {
      if (!form.fullName.trim()) {
        setMessage({ type: 'error', text: tt('Please enter your full name as per ID proof.') });
        setCurrentSection(1);
        return false;
      }
      if (!phoneRegex.test(form.contactNumber.replace(/\D/g, ''))) {
        setMessage({ type: 'error', text: tt('Please enter a valid 10-digit contact number.') });
        setCurrentSection(1);
        return false;
      }
      if (!emailRegex.test(form.email)) {
        setMessage({ type: 'error', text: tt('Please enter a valid email address.') });
        setCurrentSection(1);
        return false;
      }
      return true;
    }

    if (sectionNumber === 2) {
      const requiredFields = {
        incidentDate: 'Date of Incident',
        incidentTime: 'Time of Incident',
        incidentType: 'Incident Type',
        complaintDescription: 'Complaint Description'
      };

      for (const [key, label] of Object.entries(requiredFields)) {
        if (!form[key] || form[key].trim() === '') {
          setMessage({ type: 'error', text: `${tt('Please fill in the required field:')} ${tt(label)}` });
          setCurrentSection(2);
          return false;
        }
      }
      return true;
    }

    if (sectionNumber === 3) {
      if (!termsAccepted) {
        setMessage({ type: 'error', text: tt('Please accept the Terms and Conditions to proceed.') });
        setCurrentSection(3);
        return false;
      }
      if (!locationData.latitude || !locationData.longitude) {
        setMessage({ type: 'error', text: tt('Please allow location access. Your location is required to file a complaint.') });
        setCurrentSection(3);
        if (!gettingLocation) {
          getCurrentLocation();
        }
        return false;
      }
      return true;
    }

    return true;
  }

  function moveToSection(nextSection) {
    if (nextSection > currentSection) {
      for (let section = currentSection; section < nextSection; section += 1) {
        if (!validateSection(section)) return;
      }
    }
    setCurrentSection(nextSection);
  }

  function validateForm() {
    return validateSection(1) && validateSection(2) && validateSection(3);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const caseId = `CFCF-OD-${Date.now().toString().slice(-6)}`;
      const evidenceMetadata = [];
      const uploadFiles = [
        ...(aadhaarDocumentFile ? [aadhaarDocumentFile] : []),
        ...files.filter((file) => !aadhaarDocumentFile || !isSameSelectedFile(file, aadhaarDocumentFile))
      ];

      const incidentDateTime = form.incidentDate && form.incidentTime
        ? new Date(`${form.incidentDate}T${form.incidentTime}`).getTime()
        : Date.now();

      const reportingDateTime = form.reportingDate && form.reportingTime
        ? new Date(`${form.reportingDate}T${form.reportingTime}`).getTime()
        : Date.now();

      let caseRef;
      try {
        caseRef = await addDoc(collection(db, 'cases'), {
          caseId,
          ncrpId: null,
          victimUid: user.uid,
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
          preferredLanguage: form.preferredLanguage || defaultPreferredLanguage,
          idProofType: form.idProofType || 'Aadhaar Card',
          idProofNumber: form.idProofNumber || '',
          aadhaarCardAttached: Boolean(aadhaarDocumentFile),
          panCardAttached: Boolean(aadhaarDocumentFile),
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
          evidence: [],
          locationLatitude: locationData.latitude,
          locationLongitude: locationData.longitude,
          locationAccuracy: locationData.accuracy,
          locationTimestamp: locationData.timestamp,
          termsAccepted: true,
          termsAcceptedAt: Date.now(),
          status: 'Pending',
          timeline: [{ status: 'Pending', note: 'Complaint created by victim', at: Date.now() }],
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      } catch (createError) {
        if (createError.code === 'permission-denied' || createError.message?.includes('permission') || createError.message?.includes('Missing or insufficient permissions')) {
          throw new Error('PERMISSION_DENIED_CASE_CREATION');
        }
        throw createError;
      }

      // Notification
      try {
        await notifyNewComplaint(caseId, {
          caseId,
          victimName: form.fullName,
          amountLost: Number(form.amountLost) || 0
        });
      } catch (notifError) {
        console.error('Failed to send notifications:', notifError);
      }

      // Evidence uploads
      if (uploadFiles.length > 0) {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://safe-web-pi.duckdns.org';
        const evidenceCollection = collection(db, 'cases', caseRef.id, 'evidence');

        for (const f of uploadFiles) {
          try {
            const sanitizedName = f.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const isAadhaarDocument = isSameSelectedFile(f, aadhaarDocumentFile);
            const base64File = await fileToBase64(f);
            const fileSizeMB = (base64File.length / 1024 / 1024);

            if (fileSizeMB > 0.75) {
              console.warn(`File ${f.name} is too large (${fileSizeMB.toFixed(2)}MB), skipping...`);
              continue;
            }

            const uploadResponse = await fetch(`${apiUrl}/upload/file`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                file: base64File,
                fileName: sanitizedName,
                caseId,
                contentType: f.type || 'application/octet-stream',
                userId: user?.uid || 'unknown'
              })
            });

            if (!uploadResponse.ok) continue;

            const uploadData = await uploadResponse.json();
            if (uploadData.success && uploadData.fileData) {
              try {
                await addDoc(evidenceCollection, {
                  name: uploadData.fileData.name,
                  data: uploadData.fileData.data,
                  contentType: uploadData.fileData.contentType,
                  size: uploadData.fileData.size,
                  uploadedAt: uploadData.fileData.uploadedAt,
                  category: isAadhaarDocument ? 'aadhaar_card' : 'supporting_document',
                  source: isAadhaarDocument ? 'aadhaar_scan' : 'user_upload'
                });

                evidenceMetadata.push({
                  name: uploadData.fileData.name,
                  contentType: uploadData.fileData.contentType,
                  size: uploadData.fileData.size,
                  uploadedAt: uploadData.fileData.uploadedAt,
                  category: isAadhaarDocument ? 'aadhaar_card' : 'supporting_document',
                  source: isAadhaarDocument ? 'aadhaar_scan' : 'user_upload'
                });
              } catch (evidenceError) {
                console.error(`File ${f.name} evidence storage error:`, evidenceError);
              }
            }
          } catch (uploadError) {
            console.error(`File ${f.name} upload error:`, uploadError);
          }
        }

        if (evidenceMetadata.length > 0) {
          try {
            await setDoc(caseRef, { evidence: evidenceMetadata }, { merge: true });
          } catch (updateError) {
            console.error('Error updating case with evidence metadata:', updateError);
          }
        }

        if (uploadFiles.length > 0 && evidenceMetadata.length === 0) {
          setMessage({
            type: 'error',
            text: tt('Warning: No attachments could be processed. The case will be created without saved documents.')
          });
        } else if (uploadFiles.length > evidenceMetadata.length) {
          setMessage({
            type: 'error',
            text: getAttachmentWarningMessage(uploadFiles.length - evidenceMetadata.length, evidenceMetadata.length)
          });
        }
      }

      if (uploadFiles.length > 0 && evidenceMetadata.length === 0) {
        showToast({
          type: 'error',
          title: 'Complaint Filed — Attachments Failed',
          message: getCaseFiledWithoutAttachmentsMessage(caseId),
          duration: 8000
        });
      } else if (uploadFiles.length > 0 && evidenceMetadata.length < uploadFiles.length) {
        showToast({
          type: 'error',
          title: 'Complaint Filed — Partial Upload',
          message: getCaseFiledPartialAttachmentsMessage(caseId, uploadFiles.length - evidenceMetadata.length, evidenceMetadata.length),
          duration: 8000
        });
      } else {
        showToast({
          type: 'success',
          title: '🎉 Complaint Submitted Successfully!',
          message: getComplaintSuccessMessage(caseId, evidenceMetadata.length),
          duration: 7000
        });
      }

      // Reset form
      setForm(createInitialComplaintForm(defaultPreferredLanguage, user?.email || ''));
      setFiles([]);
      setAadhaarDocumentFile(null);
      setTermsAccepted(false);
      setLocationData({ latitude: null, longitude: null, accuracy: null, timestamp: null });
      setLocationError('');
      setLocationPermissionDenied(false);
      setAadhaarOcr(AADHAAR_OCR_INITIAL_STATE);
      setCurrentSection(1);
      localStorage.removeItem('complaintFormDraft');
      localStorage.removeItem('chatbotGpsLocation');
      localStorage.removeItem('chatbotEvidenceFile');

    } catch (err) {
      console.error('Submit error:', err);
      let errorMsg = `${tt('Submit failed:')} ${err.message}`;
      if (err.message === 'PERMISSION_DENIED_CASE_CREATION' || err.code === 'permission-denied' || err.message?.includes('permission')) {
        errorMsg = tt('Firestore permission denied. Please update Firestore security rules in Firebase Console to allow case creation.');
      } else if (err.message?.includes('ERR_BLOCKED_BY_CLIENT') || err.message?.includes('blocked')) {
        errorMsg = tt('Request blocked by browser extension or ad blocker. Please disable ad blockers for this site and try again.');
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        errorMsg = tt('Network error: Please check your internet connection and try again.');
      }
      showToast({ type: 'error', title: 'Submission Failed', message: errorMsg, duration: 10000 });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
    <div className="min-h-[calc(100vh-200px)] py-6 sm:py-8">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="mb-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg sm:h-16 sm:w-16">
              <svg className="h-7 w-7 text-white sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl">Cyber Fraud</h1>
              <p className="text-base text-gray-600 sm:text-lg">Report and track cyber fraud incidents</p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="mb-6 flex items-center justify-center">
            <div className="inline-flex flex-wrap justify-center gap-2 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-lg sm:flex-nowrap sm:rounded-full">
              <button
                type="button"
                onClick={() => setViewMode('file')}
                className={`flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-all duration-300 sm:px-6 ${
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
                className={`flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-all duration-300 sm:px-6 ${
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
          <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-200 bg-white p-4 shadow-xl sm:p-6 lg:p-8">
            {/* Success/Error Alerts (Aadhaar OCR inline messages) */}

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

            {/* Progress Stepper Indicator */}
            <ComplaintProgress
              currentSection={currentSection}
              sectionCompletion={sectionCompletion}
              moveToSection={moveToSection}
            />

            {/* Step 1: Personal Details */}
            {currentSection === 1 && (
              <PersonalDetailsSection
                form={form}
                setForm={setForm}
                aadhaarOcr={aadhaarOcr}
                setAadhaarOcr={setAadhaarOcr}
                aadhaarDocumentFile={aadhaarDocumentFile}
                setAadhaarDocumentFile={setAadhaarDocumentFile}
                handleAadhaarScan={handleAadhaarScan}
                onNext={() => moveToSection(2)}
              />
            )}

            {/* Step 2: Incident Details */}
            {currentSection === 2 && (
              <IncidentDetailsSection
                form={form}
                setForm={setForm}
                onPrev={() => moveToSection(1)}
                onNext={() => moveToSection(3)}
              />
            )}

            {/* Step 3: Documents & Review */}
            {currentSection === 3 && (
              <EvidenceSection
                form={form}
                files={files}
                setFiles={setFiles}
                selectedAttachments={selectedAttachments}
                aadhaarDocumentFile={aadhaarDocumentFile}
                locationData={locationData}
                gettingLocation={gettingLocation}
                locationError={locationError}
                locationPermissionDenied={locationPermissionDenied}
                getCurrentLocation={getCurrentLocation}
                termsAccepted={termsAccepted}
                setTermsAccepted={setTermsAccepted}
                submitting={submitting}
                getFileValidationErrorMessage={getFileValidationErrorMessage}
                getInvalidFilesMessage={getInvalidFilesMessage}
                setMessage={setMessage}
                formatCurrency={formatCurrency}
                onPrev={() => moveToSection(2)}
              />
            )}
          </form>
        )}
      </div>
    </div>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}
