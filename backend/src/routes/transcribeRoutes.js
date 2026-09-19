// backend/src/routes/transcribeRoutes.js
const express = require('express');
const router = express.Router();

/**
 * Multi-Provider AI Audio Transcription Route
 * Supports: Groq Whisper, OpenAI Whisper, Gemini 1.5/2.0 Flash, and HuggingFace Whisper
 */
router.post('/', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm', apiKey } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ ok: false, error: 'audioBase64 is required' });
    }

    const groqKey = apiKey || process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const audioBlob = new Blob([audioBuffer], { type: mimeType });

    // 1. Groq Whisper (Fastest - ~250ms latency)
    if (groqKey) {
      try {
        const formData = new FormData();
        formData.append('file', audioBlob, 'speech.webm');
        formData.append('model', 'whisper-large-v3');
        formData.append('language', 'en');

        const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${groqKey}` },
          body: formData
        });

        const data = await response.json();
        if (data && data.text) {
          return res.json({ ok: true, text: data.text.trim(), source: 'groq-whisper' });
        }
      } catch (err) {
        console.warn('Groq transcription error:', err.message);
      }
    }

    // 2. Google Gemini Audio Transcription (Gemini 1.5 Flash / 2.0 Flash)
    if (geminiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType.split(';')[0] || 'audio/webm',
                    data: audioBase64
                  }
                },
                {
                  text: 'Transcribe this audio verbatim. Return ONLY the exact transcribed text, nothing else. Do not add quotes or markdown.'
                }
              ]
            }]
          })
        });

        const data = await response.json();
        const transcribed = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (transcribed) {
          return res.json({ ok: true, text: transcribed.trim(), source: 'gemini-flash' });
        }
      } catch (err) {
        console.warn('Gemini audio transcription error:', err.message);
      }
    }

    // 3. OpenAI Whisper
    if (openaiKey) {
      try {
        const formData = new FormData();
        formData.append('file', audioBlob, 'speech.webm');
        formData.append('model', 'whisper-1');

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${openaiKey}` },
          body: formData
        });

        const data = await response.json();
        if (data && data.text) {
          return res.json({ ok: true, text: data.text.trim(), source: 'openai-whisper' });
        }
      } catch (err) {
        console.warn('OpenAI transcription error:', err.message);
      }
    }

    // 4. Free Hugging Face Whisper fallback
    try {
      const hfResponse = await fetch('https://api-inference.huggingface.co/models/openai/whisper-tiny.en', {
        method: 'POST',
        headers: { 'Content-Type': mimeType.split(';')[0] || 'audio/webm' },
        body: audioBuffer,
        signal: AbortSignal.timeout(6000)
      });
      if (hfResponse.ok) {
        const hfData = await hfResponse.json();
        if (hfData && hfData.text) {
          return res.json({ ok: true, text: hfData.text.trim(), source: 'hf-whisper' });
        }
      }
    } catch (hfErr) {
      // Ignore HF timeout/rate-limit
    }

    return res.json({
      ok: true,
      text: '',
      message: 'Audio captured. To enable server AI transcription, add GROQ_API_KEY or GEMINI_API_KEY in backend/.env.'
    });
  } catch (err) {
    console.error('Transcription error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
