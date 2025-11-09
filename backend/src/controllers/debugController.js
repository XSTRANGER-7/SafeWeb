// backend/src/controllers/debugController.js
// Simple debug controller to accept OTPs from frontend during development.
// Stores OTPs in-memory with a short TTL and provides a verify endpoint.

const otpStore = new Map(); // aadhaarNumber -> { otp, expiresAt }
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

exports.logOtp = async (req, res) => {
  try {
    const { aadhaarNumber, otp } = req.body || {};
    if (!aadhaarNumber || !otp) {
      return res.status(400).json({ status: 'error', message: 'Missing aadhaarNumber or otp' });
    }

    const expiresAt = Date.now() + OTP_TTL_MS;
    otpStore.set(aadhaarNumber, { otp, expiresAt });
    console.log('DEBUG OTP stored:', { aadhaarNumber, otp, expiresAt });
    // In production, do NOT log Aadhaar or OTP. This is only for local/dev debugging.
    return res.json({ status: 'ok', message: 'OTP received' });
  } catch (err) {
    console.error('Error in logOtp:', err);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { aadhaarNumber, otp } = req.body || {};
    if (!aadhaarNumber || !otp) {
      return res.status(400).json({ status: 'error', message: 'Missing aadhaarNumber or otp' });
    }

    const entry = otpStore.get(aadhaarNumber);
    if (!entry) {
      return res.status(400).json({ status: 'error', message: 'No OTP found for this Aadhaar number' });
    }

    if (Date.now() > entry.expiresAt) {
      otpStore.delete(aadhaarNumber);
      return res.status(400).json({ status: 'error', message: 'OTP expired' });
    }

    if (entry.otp !== otp) {
      return res.status(400).json({ status: 'error', message: 'Invalid OTP' });
    }

    // Success: consume OTP
    otpStore.delete(aadhaarNumber);
    console.log('DEBUG OTP verified for', aadhaarNumber);
    return res.json({ status: 'ok', message: 'OTP verified' });
  } catch (err) {
    console.error('Error in verifyOtp:', err);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
