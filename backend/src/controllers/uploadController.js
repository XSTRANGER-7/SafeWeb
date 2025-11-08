// backend/src/controllers/uploadController.js
// Files are stored directly in Firestore as base64 strings (no Firebase Storage needed)

async function uploadFile(req, res) {
  try {
    console.log('Upload request received:', {
      hasUserId: !!req.body.userId,
      fileName: req.body.fileName,
      caseId: req.body.caseId,
      fileSize: req.body.file ? req.body.file.length : 0
    });

    // Get file from request
    if (!req.body.file || !req.body.fileName || !req.body.caseId) {
      return res.status(400).json({ error: 'Missing required fields: file, fileName, caseId' });
    }

    const { file, fileName, caseId, contentType } = req.body;
    
    // Validate file size (Firestore document limit is 1MB per document)
    // Note: Base64 encoding increases size by ~33%, so 750KB file becomes ~1MB base64
    const maxBase64Size = 750 * 1024; // 750KB base64 (~1MB original file)
    if (file.length > maxBase64Size) {
      return res.status(400).json({ 
        error: 'File too large. Maximum size is 750KB per file.',
        details: `File size: ${(file.length / 1024).toFixed(2)}KB, Max: 750KB`
      });
    }

    // Return file data to be stored in Firestore subcollection
    // Files are stored in cases/{caseId}/evidence subcollection (to avoid document size limit)
    const fileData = {
      name: fileName,
      data: file, // base64 string
      contentType: contentType || 'application/octet-stream',
      size: Buffer.from(file, 'base64').length, // actual file size in bytes
      uploadedAt: new Date().toISOString()
    };

    console.log(`File prepared for Firestore storage: ${fileName} (${(fileData.size / 1024).toFixed(2)} KB)`);

    res.json({
      success: true,
      fileData: fileData,
      message: 'File ready to be stored in Firestore'
    });
  } catch (error) {
    console.error('Upload error:', error);
    console.error('Error stack:', error.stack);

    res.status(500).json({
      error: 'File processing failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = { uploadFile };

