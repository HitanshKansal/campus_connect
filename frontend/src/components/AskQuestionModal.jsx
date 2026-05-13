// frontend/src/components/AskQuestionModal.jsx
// Complete updated file:

import { useState } from 'react';
import { X, Lightbulb } from 'lucide-react';
import API from '../api/axios';

const AskQuestionModal = ({ onClose, onQuestionCreated }) => {
  const [formData, setFormData] = useState({ title: '', content: '', tags: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and description are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await API.post('/questions', {
        title: formData.title,
        content: formData.content,
        tags: formData.tags
          ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
          : [],
      });
      onQuestionCreated(data.question);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Modal — slides up from bottom on mobile, centered on desktop */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div
          className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col"
          style={{ maxHeight: '92vh' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Handle bar mobile */}
          <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full" style={{ background: '#e5e7eb' }} />
          </div>

          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 flex-shrink-0"
            style={{ borderBottom: '1px solid #f3f4f6' }}
          >
            <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
              Ask a Question 💡
            </h3>
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

          {/* Scrollable form body */}
          <div className="flex-1 overflow-y-auto px-5 py-4">

            {error && (
              <div
                className="px-4 py-3 rounded-2xl mb-4 text-sm font-medium"
                style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Title */}
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                  Question Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. How to implement JWT authentication in Node.js?"
                  className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all"
                  style={{ background: '#f9fafb', border: '2px solid #e5e7eb', fontSize: '16px' }}
                  onFocus={e => e.target.style.borderColor = '#7c3aed'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
                <p className="text-xs text-gray-400 mt-1 ml-1">
                  Be specific and imagine you're asking another student
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                  Description <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Describe your problem in detail. Include what you've already tried..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all resize-none"
                  style={{ background: '#f9fafb', border: '2px solid #e5e7eb', fontSize: '16px' }}
                  onFocus={e => e.target.style.borderColor = '#7c3aed'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                  Tags
                  <span className="normal-case font-normal ml-1 text-gray-400">(comma separated)</span>
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={e => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g. javascript, react, nodejs"
                  className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all"
                  style={{ background: '#f9fafb', border: '2px solid #e5e7eb', fontSize: '16px' }}
                  onFocus={e => e.target.style.borderColor = '#7c3aed'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
                {/* Tag preview */}
                {formData.tags && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {formData.tags.split(',').map((t, i) =>
                      t.trim() ? (
                        <span
                          key={i}
                          className="text-xs px-2.5 py-1 rounded-xl font-bold"
                          style={{ background: '#f5f3ff', color: '#7c3aed' }}
                        >
                          #{t.trim()}
                        </span>
                      ) : null
                    )}
                  </div>
                )}
              </div>

              {/* Tips */}
              <div
                className="rounded-2xl p-4"
                style={{ background: '#fefce8', border: '1px solid #fde68a' }}
              >
                <p className="text-xs font-black text-yellow-700 mb-2 flex items-center gap-1.5">
                  <Lightbulb size={13} /> Tips for a good question:
                </p>
                <ul className="space-y-1">
                  {[
                    'Summarize the problem clearly in the title',
                    'Describe what you\'ve already tried',
                    'Add relevant tags so others can find it',
                  ].map((tip, i) => (
                    <li key={i} className="text-xs text-yellow-700 flex items-start gap-1.5">
                      <span className="flex-shrink-0 mt-0.5">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Submit — sticky at bottom */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl text-white font-black text-base transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Posting...
                  </span>
                ) : 'Post Question 🚀'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AskQuestionModal;