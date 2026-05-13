// frontend/src/pages/VerifyOTP.jsx

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import useHideChatbot from '../hooks/useHideChatbot';


const VerifyOTP = () => {
    useHideChatbot(); 
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputs = useRef([]);
  const userId = localStorage.getItem('userId');

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/, '');
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = paste.split('');
    while (newOtp.length < 6) newOtp.push('');
    setOtp(newOtp);
    inputs.current[5]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) return;

    setLoading(true);
    setError('');
    try {
      const { data } = await API.post('/auth/verify-otp', {
        userId,
        otp: otpString,
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccess('Email verified! Setting up your profile...');
      setTimeout(() => navigate(data.redirectTo || '/setup-profile'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await API.post('/auth/resend-otp', { userId });
      setSuccess('New OTP sent!');
      setError('');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch (err) {
      setError('Could not resend OTP');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)' }}
    >
      <div className="w-full max-w-md animate-slideUp">

        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg mx-auto mb-3 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            CC
          </div>
          <span className="text-xl font-black" style={{ color: '#7c3aed' }}>
            Campus Connect
          </span>
        </div>

        <div
          className="bg-white rounded-3xl shadow-2xl p-8"
          style={{ border: '1px solid #ede9fe' }}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-gray-900">Verify Email 📧</h2>
            <p className="text-gray-500 mt-2 text-sm">
              Enter the 6-digit OTP sent to your email
            </p>
          </div>

          {error && (
            <div
              className="px-4 py-3 rounded-2xl mb-6 text-sm text-center font-medium"
              style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}
            >
              ❌ {error}
            </div>
          )}
          {success && (
            <div
              className="px-4 py-3 rounded-2xl mb-6 text-sm text-center font-medium"
              style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}
            >
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 6 OTP Input Boxes */}
            <div
              className="flex gap-2 sm:gap-3 justify-center mb-8"
              onPaste={handlePaste}
            >
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => inputs.current[idx] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-black rounded-2xl outline-none transition-all"
                  style={{
                    border: digit
                      ? '2px solid #7c3aed'
                      : '2px solid #e5e7eb',
                    background: digit ? '#f5f3ff' : '#f9fafb',
                    color: '#7c3aed',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#7c3aed';
                    e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)';
                  }}
                  onBlur={e => {
                    if (!digit) e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full py-3.5 rounded-2xl text-white font-black text-base transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify OTP ✅'
              )}
            </button>
          </form>

          <div className="text-center mt-5">
            <p className="text-sm text-gray-500">
              Didn't receive OTP?{' '}
              <button
                onClick={handleResend}
                className="font-bold hover:underline"
                style={{ color: '#7c3aed' }}
              >
                Resend OTP
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;