// frontend/src/pages/Questions.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import AskQuestionModal from '../components/AskQuestionModal';
import { Search, MessageCircle, ThumbsUp, Eye, Plus, Tag, User, Trash2 } from 'lucide-react';
import useHideChatbot from '../hooks/useHideChatbot';

const Questions = () => {
  useHideChatbot();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showAsk, setShowAsk] = useState(false);
  const [activeTag, setActiveTag] = useState(null);
  const [showMyQuestions, setShowMyQuestions] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const popularTags = [
    'javascript', 'react', 'python', 'nodejs',
    'java', 'mca', 'placement', 'internship', 'dbms', 'os',
  ];

  useEffect(() => {
    fetchQuestions();
  }, [search, activeTag, showMyQuestions]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (activeTag) params.append('tag', activeTag);
      const { data } = await API.get(`/questions?${params}`);
      if (showMyQuestions) {
        setQuestions(data.questions.filter(
          q => q.author?._id === user.id || q.author?.username === user.username
        ));
      } else {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.log('Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setActiveTag(null);
    setShowMyQuestions(false);
  };

  const handleUpvote = async (questionId) => {
    try {
      const { data } = await API.put(`/questions/${questionId}/upvote`);
      setQuestions(prev => prev.map(q =>
        q._id === questionId
          ? {
              ...q,
              upvotes: data.isUpvoted
                ? [...q.upvotes, user.id]
                : q.upvotes.filter(id => id !== user.id),
            }
          : q
      ));
    } catch (err) {
      console.log('Upvote error:', err.message);
    }
  };

  const handleDelete = async (questionId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this question and all its answers?')) return;
    try {
      await API.delete(`/questions/${questionId}`);
      setQuestions(prev => prev.filter(q => q._id !== questionId));
    } catch (err) {
      console.log('Delete error:', err.message);
    }
  };

  const handleQuestionCreated = (question) => {
    setQuestions(prev => [question, ...prev]);
    setShowAsk(false);
  };

  const formatTime = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Now';
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const isMyQuestion = (question) =>
    question.author?._id === user.id || question.author?.username === user.username;

  return (
    <div className="min-h-screen flex" style={{ background: '#f1f5f9' }}>

      <Sidebar onCreatePost={() => {}} />

      <div className="flex-1 sm:ml-64">
        <div className="h-14 sm:hidden" />

        {/* ── Hero Header ── */}
        <div
          className="relative overflow-hidden px-4 py-8 sm:py-14"
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
          }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #a78bfa, transparent)', transform: 'translate(30%,-30%)' }} />

          <div className="max-w-3xl mx-auto relative z-10">
            <div className="text-center mb-5">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
                style={{ background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.3)' }}
              >
                <span className="text-violet-300 text-xs font-semibold">💡 Student Q&A</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white mb-2 leading-tight">
                Ask. Answer. <span style={{ color: '#a78bfa' }}>Grow.</span>
              </h1>
              <p className="text-indigo-200 text-xs sm:text-base max-w-md mx-auto">
                Every question matters, every answer helps
              </p>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
              <Search
                size={16}
                className="absolute left-3.5 top-3.5"
                style={{ color: '#a78bfa' }}
              />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search questions or tags..."
                className="w-full pl-10 pr-24 py-3 rounded-2xl text-sm font-medium outline-none"
                style={{ background: 'rgba(255,255,255,0.95)', color: '#1e1b4b' }}
              />
              <button
                type="submit"
                className="absolute right-2 top-1.5 px-4 py-1.5 rounded-xl text-white text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
              >
                Search
              </button>
            </form>

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 mt-5">
              {[
                { label: 'Questions', value: questions.length },
                { label: 'Answers', value: questions.reduce((a, q) => a + (q.answerCount || 0), 0) },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-xl font-black text-white">{stat.value}</p>
                  <p className="text-xs text-indigo-300 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 pb-24 sm:pb-8">

          {/* ── Top Action Row ── */}
          <div className="flex items-center justify-between mb-4 gap-2">
            {/* Toggle */}
            <div
              className="flex rounded-xl overflow-hidden flex-shrink-0"
              style={{ border: '1px solid #e5e7eb', background: 'white' }}
            >
              <button
                onClick={() => setShowMyQuestions(false)}
                className="flex items-center gap-1 px-3 py-2 text-xs font-bold transition-all"
                style={!showMyQuestions ? {
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  color: 'white',
                } : { color: '#6b7280' }}
              >
                All
              </button>
              <button
                onClick={() => setShowMyQuestions(true)}
                className="flex items-center gap-1 px-3 py-2 text-xs font-bold transition-all"
                style={showMyQuestions ? {
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  color: 'white',
                } : { color: '#6b7280' }}
              >
                <User size={11} />
                Mine
              </button>
            </div>

            {/* Ask Button */}
            <button
              onClick={() => setShowAsk(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white font-bold text-xs sm:text-sm transition-all hover:opacity-90 shadow-md flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                boxShadow: '0 4px 15px rgba(124,58,237,0.3)',
              }}
            >
              <Plus size={14} />
              Ask
            </button>
          </div>

          {/* ── Tags Bar ── */}
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Tag size={12} style={{ color: '#7c3aed' }} />
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                Topics
              </p>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => { setActiveTag(null); setSearch(''); setSearchInput(''); setShowMyQuestions(false); }}
                className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                style={!activeTag ? {
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  color: 'white',
                } : {
                  background: 'white',
                  color: '#6b7280',
                  border: '1px solid #e5e7eb',
                }}
              >
                All
              </button>
              {popularTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setActiveTag(tag === activeTag ? null : tag);
                    setSearch('');
                    setSearchInput('');
                    setShowMyQuestions(false);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                  style={activeTag === tag ? {
                    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                    color: 'white',
                  } : {
                    background: 'white',
                    color: '#6b7280',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* ── My Questions empty ── */}
          {showMyQuestions && !loading && questions.length === 0 && (
            <div className="text-center py-12">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg, #f5f3ff, #eef2ff)' }}
              >
                🤔
              </div>
              <h3 className="text-lg font-black text-gray-800 mb-2">No questions yet</h3>
              <p className="text-gray-400 text-sm mb-5">You haven't asked anything yet!</p>
              <button
                onClick={() => setShowAsk(true)}
                className="px-6 py-2.5 rounded-2xl text-white font-bold text-sm hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
              >
                Ask First Question 💡
              </button>
            </div>
          )}

          {/* ── Questions List ── */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-4" style={{ border: '1px solid #e5e7eb' }}>
                  <div className="flex gap-3">
                    <div className="w-10 h-14 shimmer rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 shimmer rounded-full w-3/4" />
                      <div className="h-3 shimmer rounded-full w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !showMyQuestions && questions.length === 0 ? (
            <div className="text-center py-12">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg, #f5f3ff, #eef2ff)' }}
              >
                🤔
              </div>
              <h3 className="text-lg font-black text-gray-800 mb-2">No questions yet</h3>
              <p className="text-gray-400 text-sm mb-5">Be the first to ask!</p>
              <button
                onClick={() => setShowAsk(true)}
                className="px-6 py-2.5 rounded-2xl text-white font-bold text-sm hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
              >
                Ask First Question 💡
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map(question => {
                const isUpvoted = question.upvotes?.includes(user.id);
                const isMine = isMyQuestion(question);

                return (
                  <div
                    key={question._id}
                    className="bg-white rounded-2xl overflow-hidden transition-all hover:shadow-md group"
                    style={{ border: '1px solid #e5e7eb' }}
                  >
                    <div className="flex">

                      {/* Vote Column */}
                      <div
                        className="flex flex-col items-center justify-center px-3 py-4 flex-shrink-0 gap-1"
                        style={{
                          background: isUpvoted ? '#f5f3ff' : '#fafafa',
                          minWidth: '56px',
                          borderRight: '1px solid #f3f4f6',
                        }}
                      >
                        <button
                          onClick={() => handleUpvote(question._id)}
                          className="flex flex-col items-center gap-0.5 transition-all hover:scale-110"
                        >
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                            style={{
                              background: isUpvoted
                                ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                                : '#f3f4f6',
                            }}
                          >
                            <ThumbsUp
                              size={13}
                              style={{ color: isUpvoted ? 'white' : '#9ca3af' }}
                            />
                          </div>
                          <span
                            className="text-xs font-black"
                            style={{ color: isUpvoted ? '#7c3aed' : '#6b7280' }}
                          >
                            {question.upvotes?.length || 0}
                          </span>
                        </button>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-3 min-w-0">

                        {/* Title row */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-start gap-1.5 flex-1 min-w-0">
                            {question.isSolved && (
                              <span
                                className="flex-shrink-0 px-1.5 py-0.5 rounded-md text-xs font-black text-white mt-0.5"
                                style={{ background: 'linear-gradient(135deg, #059669, #0891b2)', fontSize: '10px' }}
                              >
                                ✅
                              </span>
                            )}
                            <button
                              onClick={() => navigate(`/questions/${question._id}`)}
                              className="font-black text-gray-900 text-left leading-snug hover:text-indigo-600 transition-colors line-clamp-2 text-sm"
                            >
                              {question.title}
                            </button>
                          </div>

                          {/* Delete — own only */}
                          {isMine && (
                            <button
                              onClick={(e) => handleDelete(question._id, e)}
                              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                              style={{ background: '#fef2f2', color: '#ef4444' }}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>

                        {/* Preview — hidden on very small screens */}
                        <p className="text-gray-400 text-xs line-clamp-1 mb-2 leading-relaxed hidden sm:block">
                          {question.content}
                        </p>

                        {/* Tags */}
                        {question.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {question.tags.slice(0, 3).map((tag, i) => (
                              <button
                                key={i}
                                onClick={() => setActiveTag(tag)}
                                className="px-1.5 py-0.5 rounded-md text-xs font-semibold"
                                style={{ background: '#f5f3ff', color: '#7c3aed', fontSize: '10px' }}
                              >
                                #{tag}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <div className="flex items-center gap-1.5">
                            <img
                              src={question.author?.profilePicture ||
                                `https://ui-avatars.com/api/?name=${question.author?.name}&background=7c3aed&color=fff&size=20`}
                              className="w-5 h-5 rounded-md object-cover cursor-pointer flex-shrink-0"
                              alt={question.author?.name}
                              onClick={() => navigate(`/profile/${question.author?.username}`)}
                            />
                            <button
                              onClick={() => navigate(`/profile/${question.author?.username}`)}
                              className="text-xs font-bold hover:underline flex-shrink-0"
                              style={{ color: '#7c3aed', fontSize: '11px' }}
                            >
                              @{question.author?.username}
                            </button>
                            <span className="text-xs text-gray-300">·</span>
                            <span className="text-xs text-gray-400" style={{ fontSize: '11px' }}>
                              {formatTime(question.createdAt)}
                            </span>
                            {isMine && (
                              <span
                                className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                                style={{ background: '#f5f3ff', color: '#7c3aed', fontSize: '10px' }}
                              >
                                You
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              <Eye size={11} style={{ color: '#9ca3af' }} />
                              <span className="text-xs text-gray-400" style={{ fontSize: '11px' }}>
                                {question.views || 0}
                              </span>
                            </div>
                            <button
                              onClick={() => navigate(`/questions/${question._id}`)}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold transition-all"
                              style={{
                                background: question.answerCount > 0 ? '#f0fdf4' : '#f9fafb',
                                color: question.answerCount > 0 ? '#15803d' : '#9ca3af',
                                fontSize: '11px',
                              }}
                            >
                              <MessageCircle size={11} />
                              {question.answerCount || 0}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showAsk && (
        <AskQuestionModal
          onClose={() => setShowAsk(false)}
          onQuestionCreated={handleQuestionCreated}
        />
      )}

      <MobileNav onCreatePost={() => {}} />
    </div>
  );
};

export default Questions;