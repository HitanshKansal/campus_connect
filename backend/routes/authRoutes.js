// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

module.exports = router;