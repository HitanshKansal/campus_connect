// frontend/src/components/EditProfileModal.jsx

import { useState, useEffect } from 'react';
import { X, Code, MapPin } from 'lucide-react';
import API from '../api/axios';

const EditProfileModal = ({ user, onClose, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    department: user?.department || '',
    session: user?.session || '',
    skills: user?.skills?.join(', ') || '',
  });

  // Close on Escape
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKey);
    };
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
      }));

      onSaved(data.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
          style={{ maxHeight: '90vh', overflowY: 'auto' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 sticky top-0 bg-white z-10"
            style={{ borderBottom: '1px solid #f3f4f6' }}
          >
            <h2 className="font-black text-gray-900 text-lg">Edit Profile</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{ background: '#f9fafb', color: '#6b7280' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5">

            {/* College — locked */}
            {user?.collegeName && (
              <div
                className="flex items-center gap-3 p-3.5 rounded-2xl mb-5"
                style={{ background: '#f5f3ff', border: '1px solid #ede9fe' }}
              >
                <span className="text-xl flex-shrink-0">🎓</span>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-900 text-sm truncate">
                    {user.collegeName}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Auto-filled from email · Cannot be changed
                  </p>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0"
                  style={{ background: '#ede9fe', color: '#7c3aed' }}
                >
                  Locked
                </span>
              </div>
            )}

            {error && (
              <div
                className="px-4 py-3 rounded-2xl mb-4 text-sm font-medium"
                style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">

              {/* Name + Username */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium outline-none transition-all"
                    style={{ background: '#f9fafb', border: '2px solid #e5e7eb' }}
                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <span
                      className="absolute left-3 top-2.5 text-sm font-bold"
                      style={{ color: '#7c3aed' }}
                    >
                      @
                    </span>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="username"
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl text-sm font-medium outline-none transition-all"
                      style={{ background: '#f9fafb', border: '2px solid #e5e7eb' }}
                      onFocus={e => e.target.style.borderColor = '#7c3aed'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell your campus story..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium outline-none transition-all resize-none"
                  style={{ background: '#f9fafb', border: '2px solid #e5e7eb' }}
                  onFocus={e => e.target.style.borderColor = '#7c3aed'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              {/* Department + Session */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g. MCA, B.Tech"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium outline-none transition-all"
                    style={{ background: '#f9fafb', border: '2px solid #e5e7eb' }}
                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                    Batch Year
                  </label>
                  <input
                    type="text"
                    name="session"
                    value={formData.session}
                    onChange={handleChange}
                    placeholder="e.g. 2024-2026"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium outline-none transition-all"
                    style={{ background: '#f9fafb', border: '2px solid #e5e7eb' }}
                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                  Skills
                  <span className="normal-case font-normal ml-1 text-gray-400">
                    (comma separated)
                  </span>
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="React, Node.js, Python..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium outline-none transition-all"
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
                className="w-full py-3.5 rounded-2xl text-white font-black text-base transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </span>
                ) : 'Save Changes ✨'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfileModal;