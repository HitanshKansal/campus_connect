// frontend/src/pages/Register.jsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import useHideChatbot from '../hooks/useHideChatbot';

const ALLOWED_DOMAINS = ['college.edu', 'university.ac.in', 'gl.ac.in', 'glbitm.ac.in', 'ac.in', 'edu', 'gmail.com'];

const Register = () => {
  useHideChatbot();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'username') {
      const regex = /^[a-z0-9_]*$/;
      if (!regex.test(value.toLowerCase())) {
        setUsernameError('Only letters, numbers and underscores');
      } else if (value.length > 0 && value.length < 3) {
        setUsernameError('At least 3 characters required');
      } else {
        setUsernameError('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (usernameError) return;
    setLoading(true);
    setError('');
    setErrorType('');
    try {
      const { data } = await API.post('/auth/register', {
        ...formData,
        username: formData.username.toLowerCase(),
      });
      localStorage.setItem('userId', data.userId);
      navigate('/verify-otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      setErrorType(err.response?.data?.errorType || '');
    } finally {
      setLoading(false);
    }
  };

  const fields1Done = formData.name && formData.username && !usernameError;
  const fields2Done = formData.email && formData.password;

  return (
    <div className="min-h-screen flex">

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-main flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white bg-opacity-10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 bg-opacity-20 rounded-full blur-3xl" />
        <div className="relative z-10 text-center text-white">
          <div className="animate-float inline-block mb-8">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-3xl flex items-center justify-center text-5xl shadow-2xl">
              <img src="/logo.svg" alt="logo" className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-5xl font-black mb-4">Join Campus<br />Connect</h1>
          <p className="text-xl text-indigo-100 mb-8">Your student journey starts here</p>
          <div className="space-y-3 text-left">
            {['✅ Use your college email', '✅ Build your student profile', '✅ Connect with peers', '✅ Grow your network'].map((item, i) => (
              <div key={i} className="bg-white bg-opacity-10 rounded-xl px-4 py-3 text-sm font-medium">{item}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md animate-fadeIn">

          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-main rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                <img src="/logo.svg" alt="logo" className="w-12 h-12" /></div>
              <span className="text-2xl font-black gradient-text">Campus Connect</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-indigo-50">
            <div className="mb-6">
              <h2 className="text-3xl font-black text-gray-900">Create Account ✨</h2>
              <p className="text-gray-500 mt-2">Join thousands of students</p>
            </div>

            {/* Progress */}
            <div className="flex gap-2 mb-6">
              {[1, 2].map(s => (
                <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'bg-gradient-main' : 'bg-gray-100'}`} />
              ))}
            </div>

            {error && (
              <div className={`px-4 py-3 rounded-2xl mb-5 text-sm flex items-start gap-2 ${
                errorType === 'INVALID_DOMAIN'
                  ? 'bg-orange-50 border border-orange-200 text-orange-700'
                  : 'bg-red-50 border border-red-200 text-red-600'
              }`}>
                <span>{errorType === 'INVALID_DOMAIN' ? '🏫' : '❌'}</span>
                <div>
                  {error}
                  {errorType === 'INVALID_DOMAIN' && (
                    <p className="text-xs mt-1 opacity-80">Use your official college email address</p>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 && (
                <div className="animate-fadeIn space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text" name="name" value={formData.name}
                      onChange={handleChange} placeholder="Your full name" required
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-medium input-glow transition-all placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-gray-400 font-bold text-sm">@</span>
                      <input
                        type="text" name="username" value={formData.username}
                        onChange={handleChange} placeholder="your_username"
                        maxLength={20}
                        className={`w-full pl-8 pr-4 py-3 bg-gray-50 border-2 rounded-2xl text-sm font-medium input-glow transition-all placeholder-gray-400 ${
                          usernameError ? 'border-red-300' : formData.username && !usernameError ? 'border-green-300' : 'border-gray-100'
                        }`}
                      />
                    </div>
                    {usernameError && <p className="text-red-500 text-xs mt-1 ml-1">{usernameError}</p>}
                    {!usernameError && formData.username && (
                      <p className="text-green-500 text-xs mt-1 ml-1">✓ @{formData.username.toLowerCase()} is available</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!fields1Done}
                    className="w-full bg-gradient-main text-white py-3.5 rounded-2xl font-bold hover:opacity-90 transition btn-press shadow-lg shadow-indigo-200 disabled:opacity-40"
                  >
                    Continue →
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="animate-fadeIn space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">College Email</label>
                    <input
                      type="email" name="email" value={formData.email}
                      onChange={handleChange} placeholder="you@college.edu" required
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-medium input-glow transition-all placeholder-gray-400"
                    />
                    <p className="text-xs text-gray-400 mt-1 ml-1">Use your official college email</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'} name="password"
                        value={formData.password} onChange={handleChange}
                        placeholder="Minimum 6 characters" required
                        className="w-full px-4 py-3 pr-12 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-medium input-glow transition-all placeholder-gray-400"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 text-gray-400">
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(1)}
                      className="flex-1 border-2 border-gray-200 text-gray-600 py-3.5 rounded-2xl font-bold hover:bg-gray-50 transition btn-press">
                      ← Back
                    </button>
                    <button type="submit" disabled={loading || !fields2Done}
                      className="flex-1 bg-gradient-main text-white py-3.5 rounded-2xl font-bold hover:opacity-90 transition btn-press shadow-lg shadow-indigo-200 disabled:opacity-40">
                      {loading ? '...' : 'Register 🚀'}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 font-bold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;