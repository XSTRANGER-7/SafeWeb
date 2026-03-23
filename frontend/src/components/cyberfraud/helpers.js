export const ALLOWED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt']
}

export const MAX_FILE_SIZE = 750 * 1024
export const PAN_SCAN_ACCEPT = 'image/jpeg,image/png,image/webp'
export const PAN_OCR_INITIAL_STATE = {
  loading: false,
  progress: 0,
  error: '',
  extracted: null,
  fileName: '',
  confidence: 0,
  blurScore: 0,
  qualityWarning: ''
}

export function createInitialComplaintForm(email = '') {
  return {
    fullName: '',
    fathersName: '',
    mothersName: '',
    gender: '',
    age: '',
    contactNumber: '',
    email,
    permanentAddress: '',
    currentAddress: '',
    occupation: '',
    preferredLanguage: 'English',
    idProofType: '',
    idProofNumber: '',
    incidentDate: '',
    incidentTime: '',
    reportingDate: new Date().toISOString().split('T')[0],
    reportingTime: new Date().toTimeString().slice(0, 5),
    location: '',
    incidentType: '',
    amountLost: '',
    transactionId: '',
    bankName: '',
    walletName: '',
    scammerAccountNumber: '',
    scammerIFSC: '',
    scammerUPIId: '',
    modeOfFraud: '',
    devicePlatform: '',
    complaintDescription: ''
  }
}

function toTitleCase(value) {
  return value
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function calculateAgeFromDob(dobText) {
  const match = dobText?.match(/(\d{2})[/-](\d{2})[/-](\d{4})/)
  if (!match) return ''

  const [, day, month, year] = match
  const dob = new Date(Number(year), Number(month) - 1, Number(day))
  if (Number.isNaN(dob.getTime())) return ''

  const now = new Date()
  let age = now.getFullYear() - dob.getFullYear()
  const monthDiff = now.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age -= 1
  }

  return age > 0 ? String(age) : ''
}

function normalizePanCandidate(token) {
  const chars = token.replace(/[^A-Z0-9]/g, '').split('')
  if (chars.length !== 10) return token

  const toLetter = { '0': 'O', '1': 'I', '2': 'Z', '5': 'S', '6': 'G', '8': 'B' }
  const toDigit = { O: '0', Q: '0', D: '0', I: '1', L: '1', Z: '2', S: '5', B: '8' }

  for (let index = 0; index < chars.length; index += 1) {
    if (index <= 4 || index === 9) {
      chars[index] = toLetter[chars[index]] || chars[index]
    } else {
      chars[index] = toDigit[chars[index]] || chars[index]
    }
  }

  return chars.join('')
}

async function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = (error) => {
      URL.revokeObjectURL(objectUrl)
      reject(error)
    }
    image.src = objectUrl
  })
}

function calculateBlurScore(imageData, width, height) {
  const gray = new Float32Array(width * height)
  const pixels = imageData.data

  for (let index = 0, pixel = 0; pixel < pixels.length; index += 1, pixel += 4) {
    gray[index] = (pixels[pixel] * 0.299) + (pixels[pixel + 1] * 0.587) + (pixels[pixel + 2] * 0.114)
  }

  let total = 0
  let count = 0
  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      const index = (y * width) + x
      const laplacian = (4 * gray[index]) - gray[index - 1] - gray[index + 1] - gray[index - width] - gray[index + width]
      total += laplacian * laplacian
      count += 1
    }
  }

  return count ? total / count : 0
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
        return
      }
      reject(new Error('Unable to prepare the PAN image for upload.'))
    }, type, quality)
  })
}

export async function preprocessPanImage(file) {
  const image = await loadImageFromFile(file)
  const baseWidth = image.naturalWidth || image.width
  const scale = baseWidth < 1400 ? Math.min(2, 1400 / baseWidth) : 1
  const width = Math.max(900, Math.round(baseWidth * scale))
  const height = Math.round((image.naturalHeight || image.height) * (width / baseWidth))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d', { willReadFrequently: true })

  if (!context) {
    throw new Error('Canvas preprocessing is not supported in this browser.')
  }

  context.drawImage(image, 0, 0, width, height)
  const imageData = context.getImageData(0, 0, width, height)
  const pixels = imageData.data

  let min = 255
  let max = 0
  const luminance = new Float32Array(width * height)
  for (let index = 0, pixel = 0; pixel < pixels.length; index += 1, pixel += 4) {
    const value = (pixels[pixel] * 0.299) + (pixels[pixel + 1] * 0.587) + (pixels[pixel + 2] * 0.114)
    luminance[index] = value
    if (value < min) min = value
    if (value > max) max = value
  }

  const range = Math.max(1, max - min)
  for (let index = 0, pixel = 0; pixel < pixels.length; index += 1, pixel += 4) {
    let value = ((luminance[index] - min) / range) * 255
    value = value > 150 ? Math.min(255, value * 1.08) : value * 0.92
    pixels[pixel] = value
    pixels[pixel + 1] = value
    pixels[pixel + 2] = value
  }

  context.putImageData(imageData, 0, 0)

  let uploadFile = null
  try {
    let quality = 0.9
    let blob = await canvasToBlob(canvas, 'image/jpeg', quality)

    while (blob.size > MAX_FILE_SIZE && quality > 0.45) {
      quality -= 0.1
      blob = await canvasToBlob(canvas, 'image/jpeg', quality)
    }

    uploadFile = new File(
      [blob],
      `${file.name.replace(/\.[^/.]+$/, '') || 'pan-scan'}-scan.jpg`,
      {
        type: 'image/jpeg',
        lastModified: Date.now()
      }
    )
  } catch (error) {
    console.warn('PAN upload file preparation failed:', error)
  }

  return {
    processedImage: canvas.toDataURL('image/png'),
    blurScore: calculateBlurScore(imageData, width, height),
    uploadFile
  }
}

export function extractPanDetailsFromText(text) {
  const normalizedText = (text || '').toUpperCase()
  const normalizedLines = normalizedText
    .split(/\r?\n/)
    .map((line) => line.replace(/[^A-Z0-9/ .-]/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  let panNumber = normalizedText.match(/[A-Z]{5}[0-9]{4}[A-Z]/)?.[0] || ''
  if (!panNumber) {
    const panCandidates = normalizedText.match(/[A-Z0-9]{10}/g) || []
    panNumber = panCandidates
      .map(normalizePanCandidate)
      .find((candidate) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(candidate)) || ''
  }
  const dobText = normalizedText.match(/\b\d{2}[/-]\d{2}[/-]\d{4}\b/)?.[0] || ''

  const ignoredPhrases = [
    'INCOME TAX DEPARTMENT',
    'GOVT OF INDIA',
    'GOVERNMENT OF INDIA',
    'PERMANENT ACCOUNT NUMBER',
    'NAME',
    "FATHER'S NAME",
    'FATHERS NAME',
    'DATE OF BIRTH',
    'DOB',
    'SIGNATURE'
  ]

  const dobIndex = normalizedLines.findIndex((line) => /\d{2}[/-]\d{2}[/-]\d{4}/.test(line))
  const panIndex = panNumber ? normalizedLines.findIndex((line) => line.includes(panNumber)) : -1
  const anchorIndex = dobIndex >= 0 ? dobIndex : panIndex >= 0 ? panIndex : normalizedLines.length

  const nameCandidates = normalizedLines.slice(0, anchorIndex).filter((line) => {
    if (line.length < 4 || /[0-9]/.test(line)) return false
    return !ignoredPhrases.some((phrase) => line.includes(phrase))
  })

  const fullName = nameCandidates.length >= 2
    ? toTitleCase(nameCandidates[nameCandidates.length - 2])
    : nameCandidates[0] ? toTitleCase(nameCandidates[0]) : ''
  const parentName = nameCandidates.length >= 2
    ? toTitleCase(nameCandidates[nameCandidates.length - 1])
    : ''

  return {
    fullName,
    parentName,
    panNumber,
    dobText,
    age: calculateAgeFromDob(dobText)
  }
}

export function isSameSelectedFile(firstFile, secondFile) {
  if (!firstFile || !secondFile) return false

  return (
    firstFile.name === secondFile.name &&
    firstFile.size === secondFile.size &&
    firstFile.lastModified === secondFile.lastModified
  )
}

export function validateFile(file) {
  const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`
  const isValidType = Object.values(ALLOWED_FILE_TYPES).some((extensions) =>
    extensions.includes(fileExtension)
  ) || Object.keys(ALLOWED_FILE_TYPES).includes(file.type)

  if (!isValidType) {
    return {
      valid: false,
      error: 'File type not allowed. Allowed types: PDF, Images (JPG, PNG, GIF, WEBP), Word (DOC, DOCX), TXT'
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 750KB limit. Your file is ${(file.size / 1024).toFixed(2)}KB`
    }
  }

  return { valid: true }
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = (error) => reject(error)
  })
}
