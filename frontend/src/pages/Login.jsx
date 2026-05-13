// frontend/src/pages/Login.jsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

import useHideChatbot from '../hooks/useHideChatbot';

const Login = () => {
   useHideChatbot();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ emailOrUsername: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  try {
    const { data } = await API.post('/auth/login', formData);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    // ✅ Use backend's redirectTo — sends new users to setup-profile
    navigate(data.redirectTo || '/feed');
  } catch (err) {
    setError(err.response?.data?.message || 'Something went wrong');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex">

      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-main flex-col items-center justify-center p-12 relative overflow-hidden">
  {/* Background circles */}
  <div className="absolute top-20 left-20 w-64 h-64 bg-white bg-opacity-10 rounded-full blur-3xl" />
  <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 bg-opacity-20 rounded-full blur-3xl" />

  <div className="relative z-10 text-center text-white">
    <div className="animate-float inline-block mb-8">
      <div className="w-24 h-24 bg-white bg-opacity-20 rounded-3xl flex items-center justify-center text-5xl shadow-2xl">
        <img src="/logo.svg" alt="logo" className="w-12 h-12" />
      </div>
    </div>
    <h1 className="text-5xl font-black mb-4 leading-tight">
      Campus<br />Connect
    </h1>
    <p className="text-xl text-indigo-100 mb-8 leading-relaxed">
      A Student Centric Educational <br /> Social Platform
    </p>
    <div className="flex flex-col gap-3 text-left">
      {[
        '🚀 Share projects & get feedback',
        '💼 Find internships & jobs',
        '💬 Chat with fellow students',
        '💡 Ask & answer questions',
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-3 bg-white bg-opacity-10 rounded-xl px-4 py-3">
          <span className="text-sm font-medium">{item}</span>
        </div>
      ))}
    </div>
  </div>
</div>

      {/* Right Panel — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md animate-fadeIn">

          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-main rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                🎓
              </div>
              <span className="text-2xl font-black gradient-text">Campus Connect</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-indigo-50">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-gray-900">Welcome back 👋</h2>
              <p className="text-gray-500 mt-2">Sign in to your student account</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl mb-6 text-sm flex items-center gap-2">
                <span>❌</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email or Username
                </label>
                <input
                  type="text"
                  name="emailOrUsername"
                  value={formData.emailOrUsername}
                  onChange={handleChange}
                  placeholder="Enter email or @username"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-medium input-glow transition-all placeholder-gray-400"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Password</label>
                  <Link to="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-medium input-glow transition-all placeholder-gray-400 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-main text-white py-3.5 rounded-2xl font-bold text-base hover:opacity-90 transition-all btn-press shadow-lg shadow-indigo-200 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In →'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              New to Campus Connect?{' '}
              <Link to="/register" className="text-indigo-600 font-bold hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;