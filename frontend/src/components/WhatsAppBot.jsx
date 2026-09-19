import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../i18n/index.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { db } from '../../firebase.js'
import { collection, addDoc, setDoc } from 'firebase/firestore'
import { notifyNewComplaint } from '../utils/notifications.js'

/* ─── WhatsApp icon ─────────────────────────────────────────── */
function WhatsAppIcon({ className = 'h-6 w-6' }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      <path d="M19.11 17.24c-.25-.13-1.48-.73-1.71-.81-.23-.08-.39-.13-.56.13-.16.25-.64.81-.78.97-.14.16-.29.18-.54.06-.25-.13-1.04-.38-1.98-1.2-.73-.66-1.22-1.46-1.36-1.71-.14-.25-.01-.39.11-.52.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.13-.56-1.35-.76-1.84-.2-.48-.4-.42-.56-.43l-.48-.01c-.16 0-.43.06-.66.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.4 1.01 2.56.12.16 1.76 2.7 4.26 3.78.6.26 1.07.42 1.44.54.61.19 1.16.17 1.6.1.49-.07 1.48-.61 1.69-1.2.21-.59.21-1.1.15-1.2-.06-.1-.21-.16-.45-.29Z" />
      <path d="M16.01 3.2C8.93 3.2 3.2 8.93 3.2 16c0 2.49.72 4.9 2.07 6.97L3 29l6.22-2.23A12.7 12.7 0 0 0 16.01 28.8c7.07 0 12.8-5.73 12.8-12.8S23.08 3.2 16.01 3.2Zm0 23.32c-2.08 0-4.12-.56-5.91-1.63l-.42-.25-3.69 1.32 1.34-3.6-.27-.44a10.44 10.44 0 0 1-1.61-5.62c0-5.77 4.69-10.46 10.46-10.46 2.79 0 5.41 1.08 7.38 3.06a10.36 10.36 0 0 1 3.07 7.4c0 5.76-4.69 10.45-10.45 10.45Z" />
    </svg>
  )
}

/* ─── Complaint form flow definition ───────────────────────── */
const COMPLAINT_STEPS = [
  { key: 'fullName',            prompt: "What is your full name?",                                                    validate: v => v.trim().length >= 2,  errMsg: "Please tell me your full name (at least 2 characters)." },
  { key: 'contactNumber',       prompt: "What is your 10-digit mobile number?",                                       validate: v => /^[0-9]{10}$/.test(v.replace(/\D/g,'')), errMsg: "Please say or enter a valid 10-digit mobile number." },
  { key: 'gender',              prompt: "What is your gender? (Male / Female / Other)",                               validate: v => ['male','female','other'].includes(v.toLowerCase()), errMsg: "Please select or say Male, Female, or Other.", options: ['Male','Female','Other'] },
  { key: 'age',                 prompt: "How old are you?",                                                           validate: v => !isNaN(parseInt(v)) && parseInt(v) > 0 && parseInt(v) < 120, errMsg: "Please say or choose a valid age.", options: ['18-25', '26-35', '36-50', '50+'] },
  { key: 'permanentAddress',    prompt: "What is your permanent address?",                                            validate: v => v.trim().length >= 5,  errMsg: "Please provide a valid address or choose a city below.", options: ['Bhubaneswar, Odisha', 'Cuttack, Odisha', 'Rourkela, Odisha', 'Puri, Odisha', 'Sambalpur, Odisha', 'Berhampur, Odisha'] },
  { key: 'incidentType',        prompt: "What type of cyber fraud did you face?",                                     validate: v => v.trim().length >= 3,  errMsg: "Please select or describe the fraud type.", options: ['UPI/Bank Fraud','OTP Fraud','Phishing','Social Media Fraud','Investment Scam','Job Fraud','Other'] },
  { key: 'incidentDate',        prompt: "On which date did the incident happen?",                                     validate: v => /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(new Date(v).getTime()), errMsg: "Please say or choose the incident date (e.g. 14 September 2026 or Today).", options: ['Today', 'Yesterday', '2 Days Ago', 'Last Week'] },
  { key: 'incidentTime',        prompt: "At what time did the incident happen?",                                      validate: v => /^\d{2}:\d{2}$/.test(v) || v.trim().length >= 3, errMsg: "Please say or select the approximate time (e.g. 3:30 PM).", options: ['Morning (10:00 AM)', 'Afternoon (2:30 PM)', 'Evening (6:00 PM)', 'Night (10:00 PM)'] },
  { key: 'location',            prompt: "Where did the incident occur? (city/district)",                             validate: v => v.trim().length >= 2,  errMsg: "Please say or choose the location.", options: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri', 'Online / Remote'] },
  { key: 'amountLost',          prompt: "How much money did you lose? (say 0 if none)",                              validate: v => !isNaN(parseFloat(v.replace(/[^0-9.]/g,''))), errMsg: "Please select or say an amount lost.", options: ['₹0 (No loss)', '₹5,000', '₹10,000', '₹25,000', '₹50,000', '₹1,00,000'] },
  { key: 'bankName',            prompt: "Which bank or payment app was involved? (e.g. SBI, HDFC, PhonePe, Paytm, or say None)", validate: v => v.trim().length >= 1, errMsg: "Please say or select the bank or app involved.", options: ['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'PhonePe', 'Google Pay', 'Paytm', 'None / Other'] },
  { key: 'transactionId',       prompt: "What is the Transaction ID / Reference Number (UTR / Ref ID)? (Say 'None' if not available)", validate: v => v.trim().length >= 1, errMsg: "Please provide the reference number or select 'Not Available'.", options: ['Not Available', 'Pending'] },
  { key: 'knowsScammer',        prompt: "Do you know any details about the scammer / fraudster? (e.g., their mobile number, UPI ID, bank account, or fake link)", validate: v => ['yes', 'no'].includes(v.toLowerCase()) || v.trim().length >= 2, errMsg: "Please choose Yes or No.", options: ['Yes, I have scammer details', 'No, I don\'t know'] },
  { key: 'scammerDetails',      prompt: "Please provide the scammer's details (such as their Mobile Number, UPI ID, Account No., link, or name):", validate: v => v.trim().length >= 1, errMsg: "Please enter or describe the scammer's details.", options: ['Phone Number', 'UPI ID', 'Bank Account', 'Fraud Website Link', 'Skip'] },
  { key: 'complaintDescription',prompt: "Please describe what happened in your own words.",                           validate: v => v.trim().length >= 8,  errMsg: "Please give a brief description or select a common fraud scenario.", options: ['Money deducted via fake UPI QR/link', 'Shared OTP to fraudster posing as bank officer', 'Fake part-time work from home scam', 'Social media account hacked & money extorted'] },
  // Special action steps — handled by dedicated UI
  { key: 'gpsLocation',  type: 'location', prompt: "📍 I need your current GPS location for verification.\nPlease tap the button below to share your location." },
  { key: 'evidenceFile', type: 'file',     prompt: "📎 Do you have any evidence or supporting document to attach?\nYou can upload a screenshot, PDF, or image." },
]

const MONTH_MAP = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
}

const INCIDENT_TYPE_MAP = {
  'upi': 'UPI/Bank Fraud', 'bank': 'UPI/Bank Fraud', 'transfer': 'UPI/Bank Fraud',
  'otp': 'OTP Fraud', 'phishing': 'Phishing', 'link': 'Phishing', 'email': 'Phishing',
  'social': 'Social Media Fraud', 'facebook': 'Social Media Fraud', 'instagram': 'Social Media Fraud',
  'investment': 'Investment Scam', 'trading': 'Investment Scam',
  'job': 'Job Fraud', 'work': 'Job Fraud',
}

function normalizeValue(key, raw) {
  let v = raw.trim().replace(/[.,;]+$/, '').trim()
  switch (key) {
    case 'contactNumber': return v.replace(/\D/g, '').slice(0, 10)
    case 'amountLost': {
      if (v.toLowerCase().includes('no loss') || v.toLowerCase().includes('none') || v === '0') return '0'
      return v.replace(/[^0-9.]/g, '') || '0'
    }
    case 'age': {
      if (v === '18-25') return '22'
      if (v === '26-35') return '30'
      if (v === '36-50') return '42'
      if (v === '50+') return '55'
      const num = parseInt(v.replace(/\D/g, ''))
      return !isNaN(num) ? String(num) : v
    }
    case 'gender': {
      const l = v.toLowerCase()
      if (l.includes('female')) return 'Female'
      if (l.includes('male')) return 'Male'
      return 'Other'
    }
    case 'incidentDate': {
      const now = new Date()
      const lower = v.toLowerCase()
      const currentYear = now.getFullYear()

      if (lower.includes('today')) return now.toISOString().split('T')[0]
      if (lower.includes('yesterday')) {
        const y = new Date()
        y.setDate(y.getDate() - 1)
        return y.toISOString().split('T')[0]
      }
      const daysAgoMatch = lower.match(/(\d+)\s*days?\s*(?:ago|back)/)
      if (daysAgoMatch) {
        const d = new Date()
        d.setDate(d.getDate() - parseInt(daysAgoMatch[1]))
        return d.toISOString().split('T')[0]
      }
      if (lower.includes('last week') || lower.includes('week')) {
        const w = new Date()
        w.setDate(w.getDate() - 7)
        return w.toISOString().split('T')[0]
      }

      // Format: 14 September 2026 / 14th Sept 2026 / 14-Sep-2026
      const dm = v.match(/(\d{1,2})(?:st|nd|rd|th)?[\s_-]+([a-zA-Z]+)(?:[\s,_-]+(\d{4}))?/i)
      if (dm) {
        const mKey = dm[2].toLowerCase().slice(0, 3)
        const m = MONTH_MAP[mKey]
        if (m) {
          const year = dm[3] || currentYear
          const day = String(dm[1]).padStart(2, '0')
          return `${year}-${m}-${day}`
        }
      }

      // Format: September 14 2026 / Sep 14th 2026
      const md = v.match(/([a-zA-Z]+)[\s_-]+(\d{1,2})(?:st|nd|rd|th)?(?:[\s,_-]+(\d{4}))?/i)
      if (md) {
        const mKey = md[1].toLowerCase().slice(0, 3)
        const m = MONTH_MAP[mKey]
        if (m) {
          const year = md[3] || currentYear
          const day = String(md[2]).padStart(2, '0')
          return `${year}-${m}-${day}`
        }
      }

      // Format: YYYY-MM-DD
      const isoMatch = v.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/)
      if (isoMatch) {
        return `${isoMatch[1]}-${String(isoMatch[2]).padStart(2, '0')}-${String(isoMatch[3]).padStart(2, '0')}`
      }

      // Format: DD-MM-YYYY or DD/MM/YYYY
      const numMatch = v.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/)
      if (numMatch) {
        return `${numMatch[3]}-${String(numMatch[2]).padStart(2, '0')}-${String(numMatch[1]).padStart(2, '0')}`
      }

      // Fallback: Date.parse
      const parsed = new Date(v)
      if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1990 && parsed.getFullYear() < 2100) {
        return parsed.toISOString().split('T')[0]
      }

      return v
    }
    case 'incidentTime': {
      const lower = v.toLowerCase()
      if (lower.includes('morning') || lower.includes('10:00')) return '10:00'
      if (lower.includes('afternoon') || lower.includes('2:30')) return '14:30'
      if (lower.includes('evening') || lower.includes('6:00')) return '18:00'
      if (lower.includes('night') || lower.includes('10:00 pm')) return '22:00'

      const m = v.match(/(\d{1,2})[:.\s]?(\d{0,2})\s*(am|pm)?/i)
      if (m) {
        let h = parseInt(m[1])
        const min = m[2] ? parseInt(m[2]) : 0
        const period = (m[3] || '').toLowerCase()
        if (period === 'pm' && h < 12) h += 12
        if (period === 'am' && h === 12) h = 0
        return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
      }
      return v
    }
    case 'incidentType': {
      const lower = v.toLowerCase()
      for (const [kw, label] of Object.entries(INCIDENT_TYPE_MAP)) {
        if (lower.includes(kw)) return label
      }
      const found = ['UPI/Bank Fraud','OTP Fraud','Phishing','Social Media Fraud','Investment Scam','Job Fraud','Other']
        .find(t => t.toLowerCase() === lower)
      return found || v
    }
    case 'bankName': {
      const l = v.toLowerCase()
      if (l.includes('no bank') || l.includes('none') || l.includes('not applicable') || l === 'na' || l === 'n/a') return 'None'
      return v
    }
    case 'transactionId': {
      const l = v.toLowerCase()
      if (l.includes('no ref') || l.includes('not available') || l.includes('none') || l.includes('pending') || l === 'na' || l === 'n/a' || l.includes('no txn')) return 'Not Available'
      return v
    }
    case 'knowsScammer': {
      const l = v.toLowerCase()
      if (l.includes('no') || l.includes("don't") || l.includes('dont') || l.includes('not') || l.includes('nope') || l.includes('never')) return 'No'
      return 'Yes'
    }
    case 'scammerDetails': {
      const l = v.toLowerCase()
      if (l.includes('skip') || l.includes('none') || l.includes('no') || l.includes('not available') || l.includes("don't know")) return 'Unknown'
      return v
    }
    default: return v
  }
}

/* ─── General-purpose chatbot responses ────────────────────── */
function getBotReply(input) {
  const lower = input.toLowerCase()
  if (/\b(fraud|scam|cheated|hacked|cyber|complaint|report)\b/.test(lower))
    return { text: "I'm sorry to hear that. I can help you file a cyber fraud complaint right away. Would you like to proceed?", options: ['🎙️ File via Voice', '📋 Go to Form', '❌ Cancel'] }
  if (/\b(track|status|case|id|cfcf)\b/.test(lower))
    return { text: "To track your complaint, please visit your dashboard or use the 'Track Complaints' tab on the Cyber Fraud page.", options: ['📋 My Dashboard', '🔍 Track Now'] }
  if (/\b(help|assist|support|guide)\b/.test(lower))
    return { text: "I can help you with: filing a complaint, tracking status, or connecting to support.", options: ['🛡️ Report Fraud', '📋 Track Status', '📞 Police Helpline'] }
  if (/\b(helpline|police|1930|contact)\b/.test(lower))
    return { text: "You can reach the National Cybercrime Helpline at 📞 1930. You can also visit cybercrime.gov.in for assistance." }
  if (/\b(hello|hi|hey|namaste)\b/.test(lower))
    return { text: "Hello! 👋 I'm OP Bot, your cyber safety assistant. How can I help you today?", options: ['🛡️ Report Fraud', '🔍 Track Complaint', '❓ Help'] }
  if (/\b(thank|thanks|ok|okay|bye|goodbye)\b/.test(lower))
    return { text: "You're welcome! Stay safe online. 🙏 Feel free to reach out anytime." }
  return { text: "I'm not sure I understood that. Could you try one of these options?", options: ['🛡️ Report Fraud', '🔍 Track Complaint', '❓ Help', '📞 Helpline 1930'] }
}

/* ─── Main WhatsAppBot component ────────────────────────────── */
export default function WhatsAppBot() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { profile, user } = useAuth()

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: "Hi! I'm OP Bot 👮‍♂️, your cyber safety assistant.\nHow can I help you today?",
      options: ['🛡️ Report Cyber Fraud', '🔍 Track Complaint', '📞 Police Helpline 1930', '📋 My Dashboard']
    }
  ])
  const [input, setInput] = useState('')

  // Complaint collection flow state
  const [collectingComplaint, setCollectingComplaint] = useState(false)
  const [currentStepIdx, setCurrentStepIdx] = useState(0)
  const [collectedData, setCollectedData] = useState({})
  const [retryCount, setRetryCount] = useState(0)

  // Confirmation & correction flow state
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
  const [awaitingCorrectionField, setAwaitingCorrectionField] = useState(null) // null | 'selecting' | <stepKey>
  const [submittingToDb, setSubmittingToDb] = useState(false)

  // Special step state
  const [_gpsData, setGpsData] = useState(null)       // { latitude, longitude, accuracy }
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState('')
  const [_evidenceFile, setEvidenceFile] = useState(null) // File object
  const fileInputRef = useRef(null)

  // Voice state
  const [isListening, setIsListening] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const [voiceSupported] = useState(() => !!(navigator.mediaDevices?.getUserMedia || 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window))

  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const mediaStreamRef = useRef(null)
  const inputRef = useRef(null)
  const interimTextRef = useRef('')   // Persists spoken text across onerror/onend
  const voiceErrorTimerRef = useRef(null)

  const botPhoneNumber = '919999999999'
  const whatsAppLaunchUrl = `https://api.whatsapp.com/send?phone=${botPhoneNumber}&text=${encodeURIComponent(t('whatsappBot.prefill') || 'Hi, I need help from the Odisha Police Official WhatsApp Bot.')}`

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  /* ── Voice recognition setup ── */
  const showVoiceError = (msg) => {
    setVoiceError(msg)
    if (voiceErrorTimerRef.current) clearTimeout(voiceErrorTimerRef.current)
    voiceErrorTimerRef.current = setTimeout(() => setVoiceError(''), 4500)
  }

  const silenceTimerRef = useRef(null)
  const isListeningRef = useRef(false)
  const [voiceStatus, setVoiceStatus] = useState('') // 'listening' | 'transcribing' | ''

  /**
   * Transcribe recorded audio blob using backend Multi-Provider AI STT
   */
  const transcribeAudioBlob = async (blob) => {
    try {
      setVoiceStatus('transcribing')
      const reader = new FileReader()
      const base64Promise = new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const res = reader.result
          const base64 = res.split(',')[1]
          resolve(base64)
        }
        reader.onerror = reject
      })
      reader.readAsDataURL(blob)
      const audioBase64 = await base64Promise

      const userApiKey = localStorage.getItem('groq_api_key') || localStorage.getItem('gemini_api_key') || ''
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const res = await fetch(`${apiUrl}/api/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64, mimeType: blob.type || 'audio/webm', apiKey: userApiKey })
      })

      const data = await res.json()
      if (data.ok && data.text) {
        return data.text.trim()
      }
      return null
    } catch (err) {
      console.warn('Backend audio transcription error:', err)
      return null
    } finally {
      setVoiceStatus('')
    }
  }

  const cleanupVoiceResources = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach(t => t.stop())
      } catch { /* ignore */ }
      mediaStreamRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop() } catch { /* ignore */ }
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null
        recognitionRef.current.onend = null
        recognitionRef.current.onerror = null
        recognitionRef.current.stop()
      } catch { /* ignore */ }
      recognitionRef.current = null
    }
  }

  const stopListening = useCallback(async () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
    isListeningRef.current = false
    setIsListening(false)

    // Stop recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null
        recognitionRef.current.onend = null
        recognitionRef.current.onerror = null
        recognitionRef.current.stop()
      } catch { /* ignore */ }
      recognitionRef.current = null
    }

    // Stop MediaRecorder & capture blob
    let recordedBlob = null
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        const recorder = mediaRecorderRef.current
        const stoppedPromise = new Promise(resolve => {
          recorder.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' })
            resolve(blob)
          }
          recorder.stop()
        })
        recordedBlob = await stoppedPromise
      } catch (e) {
        console.warn('Error stopping MediaRecorder:', e)
      }
    }

    // Stop mic stream
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach(t => t.stop())
      } catch { /* ignore */ }
      mediaStreamRef.current = null
    }

    let captured = (interimTextRef.current || inputRef.current?.value || input || '').trim()

    // If WebSpeech was empty or blocked, try backend AI transcription
    if (!captured && recordedBlob && recordedBlob.size > 2000) {
      setVoiceStatus('transcribing')
      const aiText = await transcribeAudioBlob(recordedBlob)
      if (aiText) {
        captured = aiText
      }
    }

    setVoiceStatus('')

    if (captured) {
      // Keep captured speech in input box for user to review and submit manually
      setInput(captured)
      interimTextRef.current = ''
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    } else {
      interimTextRef.current = ''
      // If nothing was captured when stopping, give friendly feedback with current step options
      if (collectingComplaint) {
        const step = COMPLAINT_STEPS[currentStepIdx]
        pushBot("🎙️ I couldn't catch that. Please speak again, type your answer, or tap an option below:", step?.options || null)
      } else {
        pushBot("🎙️ I couldn't hear your message. Please try speaking again or type your message.", ['🛡️ Report Cyber Fraud', '🔍 Track Complaint', '❓ Help'])
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectingComplaint, currentStepIdx, collectedData, retryCount, input])

  const startListening = useCallback(async () => {
    if (!voiceSupported) {
      showVoiceError('Voice recognition is not supported in this browser. Please type your answer.')
      return
    }

    cleanupVoiceResources()
    setVoiceError('')
    if (voiceErrorTimerRef.current) clearTimeout(voiceErrorTimerRef.current)

    setIsListening(true)
    isListeningRef.current = true
    setVoiceStatus('listening')
    interimTextRef.current = ''
    audioChunksRef.current = []

    // 1. Capture Microphone audio via MediaRecorder
    let userStream = null
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        userStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaStreamRef.current = userStream
      }
    } catch (micErr) {
      console.warn('Microphone permission error:', micErr)
      setIsListening(false)
      isListeningRef.current = false
      setVoiceStatus('')
      showVoiceError('Microphone permission was denied. Please allow microphone access or type your answer.')
      return
    }

    if (userStream && typeof MediaRecorder !== 'undefined') {
      try {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : MediaRecorder.isTypeSupported('audio/mp4')
              ? 'audio/mp4'
              : ''

        const recorder = mimeType ? new MediaRecorder(userStream, { mimeType }) : new MediaRecorder(userStream)
        audioChunksRef.current = []

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data)
          }
        }

        recorder.start(250)
        mediaRecorderRef.current = recorder
      } catch (recErr) {
        console.warn('MediaRecorder error:', recErr)
      }
    }

    // Auto-stop if user never speaks within 6 seconds
    silenceTimerRef.current = setTimeout(() => {
      if (isListeningRef.current && !interimTextRef.current.trim()) {
        stopListening()
      }
    }, 6000)

    // 2. Also try Web Speech API for real-time live preview
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SR) {
      try {
        const recognition = new SR()
        recognition.lang = navigator.language || 'en-IN'
        recognition.interimResults = true
        recognition.continuous = true
        recognition.maxAlternatives = 1

        let accumulatedText = ''

        recognition.onstart = () => {
          setIsListening(true)
          isListeningRef.current = true
          setVoiceStatus('listening')
          setVoiceError('')
        }

        recognition.onresult = (e) => {
          if (!isListeningRef.current) return

          let sessionFinal = ''
          let sessionInterim = ''

          for (let i = 0; i < e.results.length; i++) {
            const item = e.results[i]
            if (item.isFinal) {
              sessionFinal += item[0].transcript + ' '
            } else {
              sessionInterim += item[0].transcript
            }
          }

          const fullCurrentText = (sessionFinal + sessionInterim).trim()
          if (fullCurrentText) {
            accumulatedText = fullCurrentText
            interimTextRef.current = fullCurrentText
            setInput(fullCurrentText)
          }

          // Auto-stop after 2.5s of silence once user finished speaking
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
          silenceTimerRef.current = setTimeout(() => {
            if (isListeningRef.current) {
              stopListening()
            }
          }, 2500)
        }

        recognition.onerror = (e) => {
          console.warn('Speech recognition notice:', e.error)
          if (e.error === 'not-allowed' || e.error === 'permission-denied') {
            setIsListening(false)
            isListeningRef.current = false
            setVoiceStatus('')
            showVoiceError('Microphone blocked. Please click the 🔒 icon in the address bar.')
          }
        }

        recognition.onend = () => {
          if (isListeningRef.current && accumulatedText.trim()) {
            stopListening()
          }
        }

        recognitionRef.current = recognition
        recognition.start()
      } catch (err) {
        console.warn('WebSpeech init notice:', err)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectingComplaint, currentStepIdx, collectedData, retryCount, stopListening, voiceSupported])

  /* ── Add a bot message ── */
  const pushBot = (text, options = null, isTyping = true) => {
    if (isTyping) {
      setMessages(prev => [...prev, { from: 'bot', text: '...', typing: true }])
      setTimeout(() => {
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { from: 'bot', text, options }
          return updated
        })
      }, 700)
    } else {
      setMessages(prev => [...prev, { from: 'bot', text, options }])
    }
  }

  /* ── Start complaint collection flow ── */
  const startComplaintFlow = () => {
    setCollectingComplaint(true)
    setCurrentStepIdx(0)
    // Pre-seed email from logged-in account — don't ask for it
    const userEmail = user?.email || profile?.email || ''
    setCollectedData(userEmail ? { email: userEmail } : {})
    setRetryCount(0)
    setGpsData(null)
    setGpsError('')
    setEvidenceFile(null)
    const step = COMPLAINT_STEPS[0]
    const emailNote = userEmail ? `\n\n📧 Email pre-filled from your account: ${userEmail}` : ''
    pushBot(`Great! I'll guide you through filing a complaint step by step.${emailNote}\n\n🎙️ You can speak or type your answers.\n\nLet's start:\n\n${step.prompt}`, step.options || null)
  }

  /* ── Process a step answer ── */
  const processStepAnswer = (raw) => {
    const step = COMPLAINT_STEPS[currentStepIdx]
    if (!step) return

    if (step.type === 'location') {
      const lower = raw.toLowerCase()
      if (lower.includes('skip') || lower.includes('no') || lower.includes('pass') || lower.includes('next')) {
        advanceStep(collectedData)
        return
      }
      if (lower.includes('share') || lower.includes('location') || lower.includes('yes') || lower.includes('allow')) {
        captureLocation()
        return
      }
      pushBot("Please tap '📍 Share Location' or 'Skip' to continue.", ['📍 Share Location', '⏭️ Skip Location'])
      return
    }

    if (step.type === 'file') {
      const lower = raw.toLowerCase()
      if (lower.includes('skip') || lower.includes('no') || lower.includes('none') || lower.includes('pass') || lower.includes('next')) {
        advanceStep(collectedData)
        return
      }
      if (lower.includes('upload') || lower.includes('file') || lower.includes('document') || lower.includes('attach')) {
        fileInputRef.current?.click()
        return
      }
      pushBot("Please tap '📎 Upload File' to attach evidence, or 'Skip' to finish.", ['📎 Upload File', '⏭️ Skip Document'])
      return
    }

    const normalized = normalizeValue(step.key, raw)

    if (step.validate && !step.validate(normalized)) {
      const newRetry = retryCount + 1
      setRetryCount(newRetry)
      if (newRetry >= 2) {
        const required = ['fullName', 'contactNumber', 'email', 'incidentType', 'complaintDescription']
        if (!required.includes(step.key)) {
          pushBot(`No problem, I'll skip that. ${COMPLAINT_STEPS[currentStepIdx + 1]?.prompt || ''}`, COMPLAINT_STEPS[currentStepIdx + 1]?.options || null)
          advanceStep(collectedData)
          return
        }
      }
      pushBot(`⚠️ ${step.errMsg}\n\n${step.prompt}`, step.options || null)
      return
    }

    const updated = { ...collectedData, [step.key]: normalized }
    setCollectedData(updated)
    setRetryCount(0)
    advanceStep(updated)
  }

  const advanceStep = (data, fromIdx = currentStepIdx) => {
    let nextIdx = fromIdx + 1
    // If user selected they don't know scammer details, skip the scammerDetails prompt step
    if (data.knowsScammer === 'No' && COMPLAINT_STEPS[nextIdx]?.key === 'scammerDetails') {
      nextIdx += 1
    }
    if (nextIdx >= COMPLAINT_STEPS.length) {
      finishCollection(data)
      return
    }
    setCurrentStepIdx(nextIdx)
    const nextStep = COMPLAINT_STEPS[nextIdx]
    if (nextStep.type === 'location') {
      pushBot(`✅ Got it!\n\n${nextStep.prompt}`, ['📍 Share Location', '⏭️ Skip Location'])
    } else if (nextStep.type === 'file') {
      pushBot(`✅ Got it!\n\n${nextStep.prompt}`, ['📎 Upload File', '⏭️ Skip Document'])
    } else {
      pushBot(`✅ Got it!\n\n${nextStep.prompt}`, nextStep.options || null)
    }
  }

  /* ── GPS location capture ── */
  const captureLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.')
      return
    }
    setGpsLoading(true)
    setGpsError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy)
        }
        setGpsData(loc)
        setGpsLoading(false)
        const updated = { ...collectedData, gpsLocation: loc }
        setCollectedData(updated)
        setMessages(prev => [...prev, { from: 'user', text: `📍 Location shared: ${loc.latitude.toFixed(5)}, ${loc.longitude.toFixed(5)} (±${loc.accuracy}m)` }])
        advanceStep(updated)
      },
      (err) => {
        setGpsLoading(false)
        const msg = err.code === err.PERMISSION_DENIED
          ? 'Location access was denied. Tap "Skip" to continue without it.'
          : 'Could not get location. Please try again or skip.'
        setGpsError(msg)
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    )
  }

  /* ── Evidence file upload ── */
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const maxSize = 750 * 1024 // 750 KB
    if (file.size > maxSize) {
      setMessages(prev => [...prev, { from: 'bot', text: `⚠️ File is too large (${(file.size/1024).toFixed(0)} KB). Max allowed is 750 KB. Please choose a smaller file.` }])
      return
    }
    setEvidenceFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      const b64 = reader.result.split(',')[1]
      const updated = { ...collectedData, evidenceFile: { name: file.name, type: file.type, size: file.size, data: b64 } }
      setCollectedData(updated)
      setMessages(prev => [...prev, { from: 'user', text: `📎 Document attached: ${file.name} (${(file.size/1024).toFixed(1)} KB)` }])
      advanceStep(updated)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  /* ── Build summary text from collected data ── */
  const buildSummaryText = (data) => {
    return [
      data.fullName           && `👤 Name: ${data.fullName}`,
      data.contactNumber      && `📱 Mobile: ${data.contactNumber}`,
      data.gender             && `⚧ Gender: ${data.gender}`,
      data.age                && `🎂 Age: ${data.age}`,
      data.permanentAddress   && `🏠 Address: ${data.permanentAddress}`,
      data.incidentType       && `🛡️ Incident: ${data.incidentType}`,
      data.incidentDate       && `📅 Date: ${data.incidentDate}`,
      data.incidentTime       && `🕐 Time: ${data.incidentTime}`,
      data.location           && `📌 Incident Location: ${data.location}`,
      data.amountLost != null && `💸 Amount Lost: ₹${Number(data.amountLost).toLocaleString('en-IN')}`,
      data.bankName && data.bankName !== 'None' && `🏦 Bank/App: ${data.bankName}`,
      data.transactionId && data.transactionId !== 'Not Available' && `🔢 Ref/Txn ID: ${data.transactionId}`,
      data.scammerDetails && data.scammerDetails !== 'Unknown' && data.scammerDetails !== 'None' && `🎯 Scammer Info: ${data.scammerDetails}`,
      data.complaintDescription && `📝 Description: ${data.complaintDescription.length > 60 ? data.complaintDescription.slice(0, 60) + '…' : data.complaintDescription}`,
      data.gpsLocation        && `📍 GPS: Captured ✅`,
      data.evidenceFile       && `📎 Document: ${data.evidenceFile.name} ✅`,
    ].filter(Boolean).join('\n')
  }

  const finishCollection = (data) => {
    setCollectingComplaint(false)
    setAwaitingConfirmation(true)
    setAwaitingCorrectionField(null)

    const summary = buildSummaryText(data)

    pushBot(
      `🎉 All details collected! Please review:\n\n${summary}\n\n✅ Is everything correct? Tap Submit to file your complaint directly.`,
      ['✅ Submit Complaint', '❌ No, Correct Details', '🔄 Start Over']
    )
  }

  /* ── Correction field mapping ── */
  const CORRECTION_LABELS = [
    { label: '👤 Name', key: 'fullName' },
    { label: '📱 Mobile', key: 'contactNumber' },
    { label: '⚧ Gender', key: 'gender' },
    { label: '🎂 Age', key: 'age' },
    { label: '🏠 Address', key: 'permanentAddress' },
    { label: '🛡️ Incident Type', key: 'incidentType' },
    { label: '📅 Date', key: 'incidentDate' },
    { label: '🕐 Time', key: 'incidentTime' },
    { label: '📌 Location', key: 'location' },
    { label: '💸 Amount Lost', key: 'amountLost' },
    { label: '🏦 Bank / App', key: 'bankName' },
    { label: '🔢 Ref / Txn ID', key: 'transactionId' },
    { label: '🎯 Scammer Info', key: 'scammerDetails' },
    { label: '📝 Description', key: 'complaintDescription' },
  ]

  /* ── Submit collected data directly to Firestore ── */
  const submitToFirestore = async (data) => {
    if (submittingToDb) return
    setSubmittingToDb(true)
    setAwaitingConfirmation(false)

    pushBot('⏳ Submitting your complaint... Please wait.', null, false)

    try {
      const caseId = `CFCF-OD-${Date.now().toString().slice(-6)}`
      const now = Date.now()
      const userEmail = user?.email || profile?.email || data.email || ''

      const incidentDateTime = data.incidentDate && data.incidentTime
        ? new Date(`${data.incidentDate}T${data.incidentTime}`).getTime()
        : now

      // Helper to detect scammer UPI vs phone vs account
      let scammerUpi = ''
      let scammerPhone = ''
      let scammerAcc = ''
      if (data.scammerDetails && data.scammerDetails !== 'Unknown' && data.scammerDetails !== 'None') {
        const sd = data.scammerDetails.trim()
        if (sd.includes('@')) {
          scammerUpi = sd
        } else if (/^[0-9]{10}$/.test(sd.replace(/\D/g, ''))) {
          scammerPhone = sd.replace(/\D/g, '')
        } else if (/^[0-9]{9,18}$/.test(sd.replace(/\D/g, ''))) {
          scammerAcc = sd
        }
      }

      // Build the Firestore document (matching CyberFraudReport schema)
      const caseDoc = {
        caseId,
        ncrpId: null,
        victimUid: user?.uid || 'anonymous',
        victimName: data.fullName || '',
        victimPhone: data.contactNumber || '',
        victimEmail: userEmail,
        fathersName: '',
        mothersName: '',
        gender: data.gender || '',
        age: data.age || '',
        permanentAddress: data.permanentAddress || '',
        currentAddress: data.permanentAddress || '',
        occupation: '',
        preferredLanguage: 'English',
        idProofType: 'Aadhaar Card',
        idProofNumber: '',
        aadhaarCardAttached: false,
        panCardAttached: false,
        fraudType: data.incidentType || '',
        description: data.complaintDescription || '',
        incidentDate: incidentDateTime,
        reportingDate: now,
        location: data.location || '',
        amountLost: Number(data.amountLost) || 0,
        transactionId: (data.transactionId && data.transactionId !== 'Not Available') ? data.transactionId : '',
        bankName: (data.bankName && data.bankName !== 'None') ? data.bankName : '',
        walletName: '',
        scammerAccountNumber: scammerAcc,
        scammerIFSC: '',
        scammerUPIId: scammerUpi,
        scammerPhone: scammerPhone,
        scammerDetails: (data.scammerDetails && data.scammerDetails !== 'Unknown' && data.scammerDetails !== 'None') ? data.scammerDetails : '',
        modeOfFraud: data.incidentType || '',
        devicePlatform: '',
        transactions: [{
          txnId: (data.transactionId && data.transactionId !== 'Not Available') ? data.transactionId : '',
          amount: Number(data.amountLost) || 0,
          toAccount: data.scammerDetails || '',
          time: new Date(incidentDateTime).toISOString()
        }],
        evidence: [],
        locationLatitude: data.gpsLocation?.latitude || null,
        locationLongitude: data.gpsLocation?.longitude || null,
        locationAccuracy: data.gpsLocation?.accuracy || null,
        locationTimestamp: data.gpsLocation ? new Date().toISOString() : null,
        termsAccepted: true,
        termsAcceptedAt: now,
        status: 'Pending',
        timeline: [{ status: 'Pending', note: 'Complaint filed via OP Bot chat', at: now }],
        createdAt: now,
        updatedAt: now
      }

      // 1. Create the case document in Firestore
      const caseRef = await addDoc(collection(db, 'cases'), caseDoc)

      // 2. Send notifications to police / admins
      try {
        await notifyNewComplaint(caseId, {
          caseId,
          victimName: data.fullName || '',
          amountLost: Number(data.amountLost) || 0
        })
      } catch (notifErr) {
        console.warn('Notification send failed (non-critical):', notifErr)
      }

      // 3. Upload evidence file if present
      if (data.evidenceFile?.data) {
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'https://safeweb-api.onrender.com'
          const sanitizedName = data.evidenceFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
          const uploadRes = await fetch(`${apiUrl}/upload/file`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file: `data:${data.evidenceFile.type || 'application/octet-stream'};base64,${data.evidenceFile.data}`,
              fileName: sanitizedName,
              caseId,
              contentType: data.evidenceFile.type || 'application/octet-stream',
              userId: user?.uid || 'anonymous'
            })
          })

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json()
            if (uploadData.success && uploadData.fileData) {
              const evidenceCollection = collection(db, 'cases', caseRef.id, 'evidence')
              await addDoc(evidenceCollection, {
                name: uploadData.fileData.name,
                data: uploadData.fileData.data,
                contentType: uploadData.fileData.contentType,
                size: uploadData.fileData.size,
                uploadedAt: uploadData.fileData.uploadedAt,
                category: 'supporting_document',
                source: 'chatbot_upload'
              })
              await setDoc(caseRef, {
                evidence: [{
                  name: uploadData.fileData.name,
                  contentType: uploadData.fileData.contentType,
                  size: uploadData.fileData.size,
                  uploadedAt: uploadData.fileData.uploadedAt,
                  category: 'supporting_document',
                  source: 'chatbot_upload'
                }]
              }, { merge: true })
            }
          }
        } catch (uploadErr) {
          console.warn('Evidence upload failed (non-critical):', uploadErr)
        }
      }

      // 4. Clean up localStorage
      localStorage.removeItem('complaintFormDraft')
      localStorage.removeItem('chatbotGpsLocation')
      localStorage.removeItem('chatbotEvidenceFile')

      // 5. Success message
      pushBot(
        `✅ Complaint submitted successfully!\n\n🆔 Case ID: ${caseId}\n\nYour complaint has been filed and assigned to the Odisha Cyber Cell. You can track its status anytime.`,
        ['🔍 Track My Complaint', '📋 Main Menu']
      )

      // Reset state
      setCollectedData({})
      setCurrentStepIdx(0)

    } catch (err) {
      console.error('Firestore submission error:', err)
      let errMsg = '❌ Submission failed. '
      if (err.code === 'permission-denied' || err.message?.includes('permission')) {
        errMsg += 'Firestore permission denied. Please ensure you are logged in.'
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        errMsg += 'Network error. Please check your connection and try again.'
      } else {
        errMsg += `Error: ${err.message || 'Unknown error'}. Please try again.`
      }
      pushBot(errMsg, ['🔄 Try Again', '📋 Main Menu'])
      // Re-enter confirmation so user can retry
      setAwaitingConfirmation(true)
    } finally {
      setSubmittingToDb(false)
    }
  }

  /* ── Main message processor ── */
  const processInput = useCallback((text) => {
    const trimmed = text.trim()
    if (!trimmed) return

    // ALWAYS display user's message on the right side of the chat
    setMessages(prev => [...prev, { from: 'user', text: trimmed }])

    const lower = trimmed.toLowerCase()

    // ── Handle correction value entry (user is typing a new value for a specific field) ──
    if (awaitingCorrectionField && awaitingCorrectionField !== 'selecting') {
      const stepDef = COMPLAINT_STEPS.find(s => s.key === awaitingCorrectionField)
      if (stepDef) {
        const normalized = normalizeValue(stepDef.key, trimmed)
        if (stepDef.validate && !stepDef.validate(normalized)) {
          pushBot(`⚠️ ${stepDef.errMsg}\n\nPlease provide a valid value for ${stepDef.key}:`, stepDef.options || null)
          return
        }
        const updated = { ...collectedData, [stepDef.key]: normalized }
        setCollectedData(updated)
        setAwaitingCorrectionField(null)
        setAwaitingConfirmation(true)
        const summary = buildSummaryText(updated)
        pushBot(
          `✅ Updated! Here's your revised details:\n\n${summary}\n\nIs everything correct now?`,
          ['✅ Submit Complaint', '❌ No, Correct More', '🔄 Start Over']
        )
      }
      return
    }

    // ── Handle correction field selection (user is picking which field to fix) ──
    if (awaitingCorrectionField === 'selecting') {
      const match = CORRECTION_LABELS.find(c =>
        lower.includes(c.label.toLowerCase()) ||
        lower.includes(c.key.toLowerCase()) ||
        lower.replace(/[^a-z ]/g, '').trim() === c.label.replace(/[^a-z ]/g, '').trim()
      )
      if (match) {
        const stepDef = COMPLAINT_STEPS.find(s => s.key === match.key)
        setAwaitingCorrectionField(match.key)
        const currentVal = collectedData[match.key]
        pushBot(
          `Current value: ${currentVal || '(empty)'}\n\n${stepDef?.prompt || `Please enter the new ${match.label}:`}`,
          stepDef?.options || null
        )
      } else {
        pushBot(
          "I didn't recognize that field. Please tap one of the options below:",
          CORRECTION_LABELS.map(c => c.label)
        )
      }
      return
    }

    // ── Handle confirmation responses ──
    if (awaitingConfirmation) {
      if (lower.includes('submit') || lower.includes('yes') || lower.includes('confirm') || lower.includes('✅')) {
        submitToFirestore(collectedData)
        return
      }
      if (lower.includes('no') || lower.includes('correct') || lower.includes('❌') || lower.includes('fix') || lower.includes('change') || lower.includes('edit')) {
        setAwaitingConfirmation(false)
        setAwaitingCorrectionField('selecting')
        pushBot(
          "Which detail would you like to correct? Tap the field below:",
          CORRECTION_LABELS.map(c => c.label)
        )
        return
      }
      if (lower.includes('start over') || lower.includes('restart') || lower.includes('🔄')) {
        setAwaitingConfirmation(false)
        setCollectedData({})
        setCurrentStepIdx(0)
        pushBot("Sure! Let's start fresh.", ['🛡️ Report Cyber Fraud', '🔍 Track Complaint', '📋 My Dashboard'])
        return
      }
      if (lower.includes('try again')) {
        submitToFirestore(collectedData)
        return
      }
      if (lower.includes('main menu') || lower.includes('📋 main menu')) {
        setAwaitingConfirmation(false)
        setCollectedData({})
        pushBot("Back to main menu. How can I help you?", ['🛡️ Report Cyber Fraud', '🔍 Track Complaint', '📞 Helpline 1930'])
        return
      }
      // Default: re-show confirmation options
      pushBot(
        "Please tap an option below to continue:",
        ['✅ Submit Complaint', '❌ No, Correct Details', '🔄 Start Over']
      )
      return
    }

    // Handle interactive button / voice triggers during complaint collection
    if (collectingComplaint) {
      if (lower.includes('share location') || lower === '📍 share location') {
        captureLocation()
        return
      }
      if (lower.includes('skip location') || lower === '⏭️ skip location') {
        advanceStep(collectedData)
        return
      }
      if (lower.includes('upload file') || lower === '📎 upload file') {
        fileInputRef.current?.click()
        return
      }
      if (lower.includes('skip document') || lower === '⏭️ skip document') {
        advanceStep(collectedData)
        return
      }
      processStepAnswer(trimmed)
      return
    }

    // Quick action triggers
    if (lower.includes('file via voice') || lower.includes('voice') || lower.includes('speak')) {
      startComplaintFlow()
      return
    }
    if (lower.includes('go to form') || lower.includes('open form')) {
      navigate('/cyber-fraud-report')
      setIsOpen(false)
      return
    }
    if (lower.includes('track my complaint') || lower.includes('track complaint') || lower.includes('track status') || lower.includes('track now')) {
      pushBot("Taking you to complaint tracking...", null)
      setTimeout(() => { navigate('/cyber-fraud-report?view=track'); setIsOpen(false) }, 800)
      return
    }
    if (lower.includes('report fraud') || lower.includes('report cyber fraud') || lower.includes('file a complaint')) {
      pushBot("How would you like to file your complaint?", ['🎙️ Guide me via Voice/Chat', '📋 Go directly to Form'])
      return
    }
    if (lower.includes('guide me via voice') || lower.includes('guide me')) {
      startComplaintFlow()
      return
    }
    if (lower.includes('my dashboard') || lower.includes('dashboard')) {
      pushBot("Opening your dashboard...", null)
      setTimeout(() => { navigate('/dashboard'); setIsOpen(false) }, 800)
      return
    }
    if (lower.includes('police helpline') || lower.includes('1930') || lower.includes('helpline')) {
      pushBot("📞 National Cybercrime Helpline: 1930\n🌐 cybercrime.gov.in\n\nAvailable 24/7. Please call if you need immediate assistance.")
      return
    }
    if (lower.includes('start over') || lower.includes('restart')) {
      setCollectedData({})
      setCurrentStepIdx(0)
      pushBot("Sure! Let's start fresh.", ['🛡️ Report Cyber Fraud', '🔍 Track Complaint', '📋 My Dashboard', '📞 Helpline 1930'])
      return
    }
    if (lower.includes('cancel') || lower.includes('never mind')) {
      setCollectingComplaint(false)
      setAwaitingConfirmation(false)
      setAwaitingCorrectionField(null)
      pushBot("No problem! Let me know if you need anything else. 😊", ['🛡️ Report Fraud', '🔍 Track Complaint', '❓ Help'])
      return
    }
    if (lower.includes('main menu')) {
      pushBot("How can I help you?", ['🛡️ Report Cyber Fraud', '🔍 Track Complaint', '📞 Helpline 1930', '📋 My Dashboard'])
      return
    }

    // General NLP
    const reply = getBotReply(trimmed)
    pushBot(reply.text, reply.options || null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectingComplaint, currentStepIdx, collectedData, retryCount, navigate, awaitingConfirmation, awaitingCorrectionField, submittingToDb])

  /* ── Handle typed send ── */
  const sendMessage = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    processInput(trimmed)
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (profile?.role === 'police' || profile?.role === 'bank') return null

  /* ─── RENDER ────────────────────────────────────────────── */
  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 p-3 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-blue-500/40 focus:outline-none focus:ring-4 focus:ring-blue-300"
          aria-label="Open Chatbot"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          {/* Notification pulse */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500" />
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col w-[calc(100vw-2rem)] sm:w-[27rem] h-[calc(100dvh-5rem)] sm:h-[620px] max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx"
            className="hidden"
          />

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">👮‍♂️</div>
              <div>
                <h3 className="font-bold text-base leading-tight">OP Bot Support</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-blue-100">
                    {submittingToDb
                      ? '⏳ Submitting complaint...'
                      : awaitingConfirmation
                        ? '📋 Review & Submit'
                        : awaitingCorrectionField
                          ? '✏️ Correcting Details'
                          : collectingComplaint
                            ? `Step ${currentStepIdx + 1}/${COMPLAINT_STEPS.length} — Complaint Filing`
                            : 'Online • AI-Powered'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {collectingComplaint && (
                <button
                  onClick={() => {
                    setCollectingComplaint(false)
                    pushBot("Complaint filing paused. You can resume anytime.", ['🔄 Resume Filing', '📋 Main Menu'])
                  }}
                  title="Pause filing"
                  className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-xs font-semibold"
                >
                  ⏸
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors" aria-label="Close">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Progress bar (during complaint flow) */}
          {(collectingComplaint || awaitingConfirmation || awaitingCorrectionField || submittingToDb) && (
            <div className="h-1 bg-blue-100 flex-shrink-0">
              <div
                className={`h-1 transition-all duration-500 ${submittingToDb ? 'bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                style={{ width: (awaitingConfirmation || awaitingCorrectionField || submittingToDb) ? '100%' : `${((currentStepIdx) / COMPLAINT_STEPS.length) * 100}%` }}
              />
            </div>
          )}

          {/* WhatsApp banner */}
          {!collectingComplaint && (
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100 p-2.5 flex-shrink-0">
              <a
                href={whatsAppLaunchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full bg-white border border-emerald-200 rounded-xl p-2 transition-all duration-200 hover:shadow-md hover:border-emerald-400 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex bg-gradient-to-br from-emerald-400 to-green-600 p-1.5 rounded-lg shadow-sm">
                    <WhatsAppIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">Official WhatsApp Bot</p>
                    <p className="text-[10px] text-gray-500">Get verified updates directly</p>
                  </div>
                </div>
                <div className="bg-emerald-100 p-1 rounded-full text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.from === 'bot' ? 'items-start' : 'items-end'}`}>
                <div className={`max-w-[88%] rounded-2xl px-4 py-2.5 shadow-sm text-sm leading-relaxed whitespace-pre-line ${
                  m.from === 'bot'
                    ? m.typing
                      ? 'bg-white border border-gray-200 text-gray-400 italic rounded-tl-sm'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-tr-sm'
                }`}>
                  {m.typing ? (
                    <span className="flex gap-1 items-center h-5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                    </span>
                  ) : m.text}
                </div>

                {/* Option chips */}
                {m.options && i === messages.length - 1 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[92%]">
                    {m.options.map((opt, oi) => (
                      <button
                        key={oi}
                        onClick={() => processInput(opt)}
                        className="text-xs font-semibold bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-50 hover:border-blue-400 transition-all duration-150 shadow-sm active:scale-95"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Action cards for special steps (Location & File upload) */}
          {collectingComplaint && COMPLAINT_STEPS[currentStepIdx]?.type === 'location' && (
            <div className="px-3 py-2 bg-blue-50 border-t border-b border-blue-100 flex-shrink-0 flex items-center justify-between gap-2">
              <button
                onClick={captureLocation}
                disabled={gpsLoading}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3 rounded-xl shadow-sm transition-all disabled:opacity-50 active:scale-95"
              >
                {gpsLoading ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Detecting GPS...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>📍 Share My Location</span>
                  </>
                )}
              </button>
              <button
                onClick={() => advanceStep(collectedData)}
                className="px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors active:scale-95"
              >
                Skip
              </button>
            </div>
          )}

          {collectingComplaint && COMPLAINT_STEPS[currentStepIdx]?.type === 'file' && (
            <div className="px-3 py-2 bg-indigo-50 border-t border-b border-indigo-100 flex-shrink-0 flex items-center justify-between gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-3 rounded-xl shadow-sm transition-all active:scale-95"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>📎 Choose Document / Image</span>
              </button>
              <button
                onClick={() => advanceStep(collectedData)}
                className="px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors active:scale-95"
              >
                Skip
              </button>
            </div>
          )}

          {/* Active Voice Listening / Transcribing Banner */}
          {(isListening || voiceStatus === 'transcribing') && (
            <div className={`px-3 py-2 border-t flex-shrink-0 flex items-center justify-between gap-2 animate-fadeIn ${voiceStatus === 'transcribing' ? 'bg-indigo-50 border-indigo-200' : 'bg-gradient-to-r from-red-500/10 via-pink-500/10 to-red-500/10 border-red-200'}`}>
              <div className="flex items-center gap-2 min-w-0">
                {voiceStatus === 'transcribing' ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-indigo-600 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span className="text-xs font-semibold text-indigo-700 truncate">
                      🤖 Transcribing audio with AI...
                    </span>
                  </>
                ) : (
                  <>
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                    </span>
                    <span className="text-xs font-semibold text-red-700 truncate">
                      {input ? `"${input}"` : '🎙️ Listening... Speak your answer now'}
                    </span>
                  </>
                )}
              </div>
              {isListening && (
                <button
                  onClick={stopListening}
                  className="text-[11px] font-semibold bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg shadow-sm transition-all flex-shrink-0"
                >
                  Done ⏹
                </button>
              )}
            </div>
          )}

          {/* Voice / GPS error */}
          {(voiceError || gpsError) && !isListening && voiceStatus !== 'transcribing' && (
            <div className="px-3 py-2 bg-amber-50 border-t border-amber-200 flex-shrink-0 flex items-center justify-between gap-2">
              <p className="text-xs text-amber-800 font-medium leading-tight">{voiceError || gpsError}</p>
              <button
                onClick={() => { setVoiceError(''); setGpsError('') }}
                className="text-gray-400 hover:text-gray-600 text-xs px-1"
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-200 flex-shrink-0">
            <div className={`flex items-center gap-2 bg-gray-50 rounded-xl border transition-all p-1.5 ${isListening ? 'border-red-400 ring-2 ring-red-200 bg-red-50/20' : 'border-gray-200 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400'}`}>
              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none text-gray-800 placeholder-gray-400"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isListening
                    ? '🎙️ Listening... (you can also type)'
                    : submittingToDb
                      ? '⏳ Submitting...'
                      : awaitingConfirmation
                        ? 'Tap Submit or Correct Details...'
                        : awaitingCorrectionField === 'selecting'
                          ? 'Select the field to correct...'
                          : awaitingCorrectionField
                            ? 'Type the corrected value...'
                            : collectingComplaint
                              ? COMPLAINT_STEPS[currentStepIdx]?.key === 'fullName'
                                ? 'Type or speak your name...'
                                : 'Type or speak your answer...'
                              : 'Ask OP Bot or speak...'
                }
              />

              {/* Voice button */}
              {voiceSupported && (
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`p-2 rounded-lg transition-all duration-200 ${isListening ? 'bg-red-500 text-white shadow-md animate-pulse scale-105' : 'bg-gray-100 text-gray-500 hover:bg-indigo-100 hover:text-indigo-600'}`}
                  title={isListening ? 'Stop listening' : 'Speak your answer'}
                  aria-label={isListening ? 'Stop microphone' : 'Start microphone'}
                >
                  {isListening ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </button>
              )}

              {/* Send button */}
              <button
                onClick={sendMessage}
                disabled={!input.trim() || submittingToDb}
                className="bg-blue-600 text-white p-2 rounded-lg transition-all duration-200 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                aria-label="Send"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: 'translateX(1px)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-2">SafeWeb OP Bot • Speak or type your answers</p>
          </div>
        </div>
      )}
    </>
  )
}
