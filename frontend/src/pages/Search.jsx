// frontend/src/pages/Search.jsx

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import PostDetailModal from '../components/PostDetailModal';
import MobileNav from '../components/MobileNav';
import Sidebar from '../components/Sidebar';
import useHideChatbot from '../hooks/useHideChatbot';

const Search = () => {
  useHideChatbot();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState({ users: [], posts: [], questions: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const searchTimeout = useRef(null);
  const inputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setQuery(q);
  }, [searchParams]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ users: [], posts: [], questions: [] });
      return;
    }
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      performSearch();
    }, 350);
    return () => clearTimeout(searchTimeout.current);
  }, [query, activeTab]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const type = activeTab === 'all' ? 'all' : activeTab;
      const { data } = await API.get(`/search?q=${encodeURIComponent(query)}&type=${type}`);
      setResults(data);
    } catch (err) {
      console.log('Search error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalResults = results.users.length + results.posts.length + results.questions.length;
  const hasResults = totalResults > 0;

  const formatDate = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  const tabs = [
    { value: 'all',       label: 'All' },
    { value: 'users',     label: 'People' },
    { value: 'posts',     label: 'Posts' },
    { value: 'questions', label: 'Q&A' },
  ];

  const hotTopics = [
    { tag: 'placement',  label: '🎯 Placement' },
    { tag: 'react',      label: '⚛️ React' },
    { tag: 'internship', label: '💼 Internship' },
    { tag: 'mca',        label: '🎓 MCA' },
    { tag: 'python',     label: '🐍 Python' },
    { tag: 'nodejs',     label: '🟩 Node.js' },
  ];

  const typeConfig = {
    project: { emoji: '🚀', label: 'Project', bg: '#ede9fe', color: '#5b21b6' },
    job:     { emoji: '💼', label: 'Job',     bg: '#dcfce7', color: '#15803d' },
    review:  { emoji: '⭐', label: 'Review',  bg: '#fef9c3', color: '#a16207' },
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#f1f5f9' }}>

      <Sidebar onCreatePost={() => {}} />

      <div className="flex-1 sm:ml-64">
        <div className="h-14 sm:hidden" />

        {/* ── Sticky Search Header ── */}
        <div
          className="sticky top-0 sm:top-0 z-40 px-4 sm:px-6 py-4"
          style={{
            background: 'rgba(241,245,249,0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <div className="max-w-2xl mx-auto">

            {/* Search Input */}
            <div className="relative mb-4">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                {loading ? (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24" fill="none"
                    style={{ animation: 'spin 0.8s linear infinite', color: '#7c3aed' }}
                  >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"
                      strokeDasharray="32" strokeDashoffset="12" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#9ca3af" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                )}
              </div>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search students, posts, questions..."
                autoFocus
                className="w-full pl-11 pr-10 py-3 rounded-2xl text-sm font-medium outline-none transition-all"
                style={{
                  background: 'white',
                  border: '2px solid #e5e7eb',
                  color: '#374151',
                  fontSize: '15px',
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#7c3aed';
                  e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />

              {query && (
                <button
                  onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-all text-xs font-bold"
                  style={{ background: '#f3f4f6', color: '#9ca3af' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#9ca3af'; }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {tabs.map(tab => {
                const count = tab.value === 'all' ? totalResults
                  : tab.value === 'users' ? results.users.length
                  : tab.value === 'posts' ? results.posts.length
                  : results.questions.length;
                const isActive = activeTab === tab.value;

                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap flex-shrink-0 transition-all"
                    style={isActive ? {
                      background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
                    } : {
                      background: 'white',
                      color: '#6b7280',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    {tab.label}
                    {query && count > 0 && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full font-black"
                        style={isActive
                          ? { background: 'rgba(255,255,255,0.25)', color: 'white' }
                          : { background: '#f5f3ff', color: '#7c3aed' }
                        }
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-24 sm:pb-8">

          {/* ── Empty State ── */}
          {!query && (
            <div className="text-center py-14">
              {/* Glowing orb */}
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  boxShadow: '0 8px 32px rgba(124,58,237,0.3)',
                }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>

              <h2
                className="font-black text-gray-900 mb-2"
                style={{ fontSize: '22px' }}
              >
                Explore Campus Connect
              </h2>
              <p className="text-sm text-gray-400 mb-8">
                Search for students, projects, jobs, reviews & discussions
              </p>

              {/* Trending Topics */}
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                🔥 Trending Topics
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {hotTopics.map(({ tag, label }) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: 'white', color: '#6b7280', border: '1px solid #e5e7eb' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#f5f3ff';
                      e.currentTarget.style.color = '#7c3aed';
                      e.currentTarget.style.borderColor = '#c4b5fd';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.color = '#6b7280';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Loading ── */}
          {loading && (
            <div className="space-y-3 pt-6">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="h-20 rounded-2xl shimmer"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          )}

          {/* ── No Results ── */}
          {!loading && query && !hasResults && (
            <div className="text-center py-16">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl"
                style={{ background: '#f5f3ff' }}
              >
                😕
              </div>
              <p className="font-black text-gray-800 text-lg mb-1">
                No results for "{query}"
              </p>
              <p className="text-sm text-gray-400">
                Try different keywords
              </p>
            </div>
          )}

          {/* ── Results ── */}
          {!loading && hasResults && (
            <div className="pt-2">

              {/* PEOPLE */}
              {(activeTab === 'all' || activeTab === 'users') && results.users.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                      People
                    </p>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: '#f5f3ff', color: '#7c3aed' }}
                    >
                      {results.users.length}
                    </span>
                    <div className="flex-1 h-px" style={{ background: '#e5e7eb' }} />
                  </div>

                  <div className="space-y-2">
                    {results.users.map((u, idx) => (
                      <div
                        key={u._id}
                        onClick={() => navigate(`/profile/${u.username}`)}
                        className="flex items-center gap-3 p-4 bg-white rounded-2xl cursor-pointer transition-all"
                        style={{ border: '1px solid #e5e7eb' }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = '#a78bfa';
                          e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.08)';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <img
                          src={u.profilePicture ||
                            `https://ui-avatars.com/api/?name=${u.name}&background=7c3aed&color=fff&size=48`}
                          className="w-12 h-12 rounded-2xl object-cover flex-shrink-0"
                          style={{ border: '2px solid #ede9fe' }}
                          alt={u.name}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate">{u.name}</p>
                          <p className="text-xs font-semibold" style={{ color: '#7c3aed' }}>
                            @{u.username}
                          </p>
                          {(u.college || u.department) && (
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {u.college}{u.department ? ` · ${u.department}` : ''}
                            </p>
                          )}
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="#d1d5db" strokeWidth="2" className="flex-shrink-0">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* POSTS */}
              {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Posts</p>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                      {results.posts.length}
                    </span>
                    <div className="flex-1 h-px" style={{ background: '#e5e7eb' }} />
                  </div>

                  <div className="space-y-3">
                    {results.posts.map((post, idx) => {
                      const config = typeConfig[post.type] || typeConfig.project;
                      return (
                        <div
                          key={post._id}
                          onClick={() => setSelectedPost(post)}
                          className="bg-white rounded-2xl p-4 cursor-pointer transition-all overflow-hidden relative"
                          style={{ border: '1px solid #e5e7eb' }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = '#a78bfa';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.1)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <div className="flex gap-3">
                            {/* Thumbnail */}
                            {post.mediaUrl && post.mediaType === 'image' ? (
                              <img
                                src={post.mediaUrl}
                                alt="post"
                                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                                style={{ border: '1px solid #f3f4f6' }}
                              />
                            ) : (
                              <div
                                className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                                style={{ background: config.bg }}
                              >
                                {config.emoji}
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
                                  {post.title}
                                </p>
                                <span
                                  className="text-xs px-2.5 py-1 rounded-lg font-bold flex-shrink-0"
                                  style={{ background: config.bg, color: config.color }}
                                >
                                  {config.label}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 line-clamp-1 mb-2">
                                {post.content}
                              </p>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <img
                                  src={post.author?.profilePicture ||
                                    `https://ui-avatars.com/api/?name=${post.author?.name}&background=7c3aed&color=fff&size=20`}
                                  className="w-4 h-4 rounded-md object-cover"
                                  alt=""
                                />
                                <span className="text-xs font-semibold" style={{ color: '#7c3aed' }}>
                                  @{post.author?.username}
                                </span>
                                <span className="text-gray-300 text-xs">·</span>
                                <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
                                <span className="text-gray-300 text-xs">·</span>
                                <span className="text-xs text-gray-400">❤️ {post.likes?.length || 0}</span>
                              </div>
                            </div>
                          </div>

                          {/* Tags */}
                          {post.tags?.length > 0 && (
                            <div className="flex gap-1.5 mt-3 flex-wrap">
                              {post.tags.slice(0, 4).map((tag, i) => (
                                <span
                                  key={i}
                                  className="text-xs px-2 py-0.5 rounded-full"
                                  style={{ background: '#f5f3ff', color: '#7c3aed' }}
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* QUESTIONS */}
              {(activeTab === 'all' || activeTab === 'questions') && results.questions.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Questions</p>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                      {results.questions.length}
                    </span>
                    <div className="flex-1 h-px" style={{ background: '#e5e7eb' }} />
                  </div>

                  <div className="space-y-2">
                    {results.questions.map((q, idx) => (
                      <div
                        key={q._id}
                        onClick={() => navigate(`/questions/${q._id}`)}
                        className="flex gap-3 p-4 bg-white rounded-2xl cursor-pointer transition-all"
                        style={{ border: '1px solid #e5e7eb' }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = '#a78bfa';
                          e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.08)';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        {/* Vote block */}
                        <div
                          className="flex flex-col items-center justify-center px-3 py-2 rounded-xl flex-shrink-0"
                          style={{ background: '#f5f3ff', border: '1px solid #ede9fe', minWidth: '52px' }}
                        >
                          <span style={{ color: '#7c3aed', fontSize: '14px' }}>▲</span>
                          <span className="font-black text-sm" style={{ color: '#7c3aed' }}>
                            {q.upvotes?.length || 0}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-1.5">
                            {q.isSolved && (
                              <span
                                className="flex-shrink-0 text-xs px-2 py-0.5 rounded-lg font-bold text-white"
                                style={{ background: 'linear-gradient(135deg, #059669, #0891b2)', fontSize: '10px' }}
                              >
                                ✅ Solved
                              </span>
                            )}
                            <p className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
                              {q.title}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-400">
                              💬 {q.answerCount || 0} answers
                            </span>
                            <span className="text-gray-300 text-xs">·</span>
                            <span className="text-xs font-semibold" style={{ color: '#7c3aed' }}>
                              @{q.author?.username}
                            </span>
                          </div>

                          {q.tags?.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {q.tags.slice(0, 3).map((tag, i) => (
                                <span
                                  key={i}
                                  className="text-xs px-2 py-0.5 rounded-full"
                                  style={{ background: '#f5f3ff', color: '#7c3aed', fontSize: '10px' }}
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="#d1d5db" strokeWidth="2" className="flex-shrink-0 self-center">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <MobileNav onCreatePost={() => setShowCreatePost(true)} />

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          currentUserId={user.id}
          onClose={() => setSelectedPost(null)}
          onLike={() => {}}
          onDelete={() => {}}
        />
      )}
    </div>
  );
};

export default Search;