// frontend/src/pages/ForgotPassword.jsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import useHideChatbot from '../hooks/useHideChatbot';

const ForgotPassword = () => {
  useHideChatbot();
  const navigate = useNavigate();

  const [step, setStep] = useState('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await API.post('/auth/forgot-password', { email });
      setUserId(data.userId);
      setSuccess(data.message);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await API.post('/auth/verify-reset-otp', { userId, otp });
      setSuccess(data.message);
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await API.post('/auth/reset-password', { userId, newPassword });
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setError('');
      await API.post('/auth/forgot-password', { email });
      setSuccess('New OTP sent to your email!');
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slideUp">

        {/* NEW HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-main rounded-2xl flex items-center justify-center text-2xl shadow-lg animate-float">
              <img src="/logo.svg" alt="logo" className="w-12 h-12" /></div>
            <span className="text-2xl font-black gradient-text">Campus Connect</span>
          </div>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-indigo-50">

          {/* Header */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mt-2">
              {step === 'email' && 'Forgot Password'}
              {step === 'otp' && 'Verify OTP'}
              {step === 'reset' && 'Reset Password'}
              {step === 'done' && 'Password Reset! 🎉'}
            </h3>
          </div>

          {/* Progress Indicator */}
          {step !== 'done' && (
            <div className="flex items-center justify-center gap-2 mb-6">
              {['email', 'otp', 'reset'].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
                    step === s
                      ? 'bg-indigo-600 text-white'
                      : ['email', 'otp', 'reset'].indexOf(step) > i
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {['email', 'otp', 'reset'].indexOf(step) > i ? '✓' : i + 1}
                  </div>
                  {i < 2 && (
                    <div className={`w-8 h-0.5 ${
                      ['email', 'otp', 'reset'].indexOf(step) > i
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Error / Success */}
          {error && (
            <div className="bg-red-100 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
              ❌ {error}
            </div>
          )}
          {success && step === 'otp' && (
            <div className="bg-green-100 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">
              ✅ {success}
            </div>
          )}

          {/* STEP 1 */}
          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <p className="text-gray-500 text-sm text-center">
                Enter your registered email address and we'll send you an OTP
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your college email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
              <button className="w-full bg-indigo-600 text-white py-3 rounded-xl">
                {loading ? 'Sending OTP...' : 'Send OTP 📧'}
              </button>
            </form>
          )}

          {/* STEP 2 */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                required
                className="w-full px-4 py-2 border rounded-xl"
              />
              <button className="w-full bg-indigo-600 text-white py-3 rounded-xl">
                Verify OTP
              </button>
            </form>
          )}

          {/* STEP 3 */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full px-4 py-2 border rounded-xl"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-4 py-2 border rounded-xl"
              />
              <button className="w-full bg-indigo-600 text-white py-3 rounded-xl">
                Reset Password
              </button>
            </form>
          )}

          {/* DONE */}
          {step === 'done' && (
            <div className="text-center">
              <p>Password reset successful 🎉</p>
              <button onClick={() => navigate('/login')} className="mt-4">
                Go to Login
              </button>
            </div>
          )}

          <p className="text-center mt-4">
            <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;