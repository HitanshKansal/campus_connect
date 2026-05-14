// frontend/src/pages/SetupProfile.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { BookOpen, Calendar, Code, User } from 'lucide-react';
import useHideChatbot from '../hooks/useHideChatbot';

const SetupProfile = () => {
  useHideChatbot();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [formData, setFormData] = useState({
    name: user.name || '',
    username: user.username || '',
    bio: '',
    department: '',
    session: '',
    skills: '',
  });

  useEffect(() => {
    // If profile already complete, redirect to feed
    if (user.isProfileComplete) navigate('/feed');
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = await API.put('/users/profile', formData);

      // Update localStorage
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...stored,
        name: data.user.name,
        username: data.user.username,
        isProfileComplete: true,
      }));

      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    navigate('/feed');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)' }}
    >
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl mx-auto mb-4 shadow-xl"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            CC
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Complete Your Profile</h1>
          <p className="text-indigo-200 text-sm">
            Help your campus community know you better
          </p>
        </div>

        <div
          className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        >

          {/* College Name — locked, shown as info */}
          {user.collegeName && (
            <div
              className="flex items-center gap-3 p-4 rounded-2xl mb-6"
              style={{ background: '#f5f3ff', border: '1px solid #ede9fe' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
              >
                <img src="/logo.svg" alt="logo" className="w-12 h-12" />
                
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Your College
                </p>
                <p className="font-black text-gray-900">{user.collegeName}</p>
                <p className="text-xs text-gray-400">
                  Auto-filled from your email • Cannot be changed
                </p>
              </div>
            </div>
          )}

          {error && (
            <div
              className="px-4 py-3 rounded-2xl mb-5 text-sm font-medium"
              style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all"
                style={{ background: '#f9fafb', border: '2px solid #e5e7eb' }}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <span
                  className="absolute left-4 top-3 text-sm font-bold"
                  style={{ color: '#7c3aed' }}
                >
                  @
                </span>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="your_username"
                  className="w-full pl-8 pr-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all"
                  style={{ background: '#f9fafb', border: '2px solid #e5e7eb' }}
                  onFocus={e => e.target.style.borderColor = '#7c3aed'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                Department / Course
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. MCA, B.Tech CSE, MBA"
                className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all"
                style={{ background: '#f9fafb', border: '2px solid #e5e7eb' }}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Session */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                Session / Batch Year
              </label>
              <input
                type="text"
                name="session"
                value={formData.session}
                onChange={handleChange}
                placeholder="e.g. 2024-2026"
                className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all"
                style={{ background: '#f9fafb', border: '2px solid #e5e7eb' }}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                Bio
                <span className="normal-case font-normal ml-1 text-gray-400">(optional)</span>
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell your campus story..."
                rows={2}
                className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all resize-none"
                style={{ background: '#f9fafb', border: '2px solid #e5e7eb' }}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                Skills
                <span className="normal-case font-normal ml-1 text-gray-400">(comma separated)</span>
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="React, Node.js, Python..."
                className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all"
                style={{ background: '#f9fafb', border: '2px solid #e5e7eb' }}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
              {/* Skills preview */}
              {formData.skills && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {formData.skills.split(',').map((s, i) =>
                    s.trim() ? (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-xl text-xs font-bold"
                        style={{
                          background: `hsl(${(i * 47) % 360}, 70%, 95%)`,
                          color: `hsl(${(i * 47) % 360}, 60%, 35%)`,
                        }}
                      >
                        {s.trim()}
                      </span>
                    ) : null
                  )}
                </div>
              )}
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 rounded-2xl text-white font-black text-base transition-all hover:opacity-90 disabled:opacity-50 mt-2"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
            >
              {saving ? 'Saving...' : 'Complete Profile & Go to Feed 🚀'}
            </button>

            {/* Skip */}
            <button
              type="button"
              onClick={handleSkip}
              className="w-full py-2.5 text-sm font-medium transition-colors"
              style={{ color: '#9ca3af' }}
              onMouseEnter={e => e.currentTarget.style.color = '#6b7280'}
              onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
            >
              Skip for now — I'll complete later
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetupProfile;