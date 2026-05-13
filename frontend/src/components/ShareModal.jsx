// frontend/src/components/ShareModal.jsx

import { useState, useEffect } from 'react';
import { X, Search, Send, Check, Users, Share2 } from 'lucide-react';
import API from '../api/axios';

const ShareModal = ({ post, onClose }) => {
  const [activeTab, setActiveTab] = useState('external');
  const [searchQuery, setSearchQuery] = useState('');
  const [connections, setConnections] = useState([]);
  const [chats, setChats] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [sending, setSending] = useState({});
  const [sent, setSent] = useState({});
  const [copied, setCopied] = useState(false);

  const postUrl = `${window.location.origin}/post/${post._id}`;
  const shareText = `Check out this post on Campus Connect: "${post.title}"`;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    fetchConnections();
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const fetchConnections = async () => {
    setLoadingConnections(true);
    try {
      const [connRes, chatRes] = await Promise.all([
        API.get('/users/connections/list'),
        API.get('/chats'),
      ]);
      setConnections(connRes.data.connections || []);
      setChats(chatRes.data.chats || []);
    } catch (err) {
      console.log('Error:', err.message);
    } finally {
      setLoadingConnections(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
    } catch {
      const el = document.createElement('textarea');
      el.value = postUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareToChat = async (chatId) => {
    if (sending[chatId] || sent[chatId]) return;
    setSending(prev => ({ ...prev, [chatId]: true }));
    try {
      await API.post(`/chats/${chatId}/messages`, {
        content: `📌 Shared a post: "${post.title}"\n${postUrl}`,
      });
      setSent(prev => ({ ...prev, [chatId]: true }));
    } catch (err) {
      console.log('Share error:', err.message);
    } finally {
      setSending(prev => ({ ...prev, [chatId]: false }));
    }
  };

  const handleShareToConnection = async (userId) => {
    const key = `conn_${userId}`;
    if (sending[key] || sent[key]) return;
    setSending(prev => ({ ...prev, [key]: true }));
    try {
      const { data } = await API.post('/chats/personal', { userId });
      const chatId = data.chat._id;
      await API.post(`/chats/${chatId}/messages`, {
        content: `📌 Shared a post: "${post.title}"\n${postUrl}`,
      });
      setSent(prev => ({ ...prev, [key]: true }));
    } catch (err) {
      console.log('Share to connection error:', err.message);
    } finally {
      setSending(prev => ({ ...prev, [key]: false }));
    }
  };

  const externalOptions = [
    {
      label: 'WhatsApp',
      icon: '💬',
      bg: '#25D366',
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + postUrl)}`, '_blank'),
    },
    {
      label: 'Twitter/X',
      icon: '🐦',
      bg: '#000000',
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`, '_blank'),
    },
    {
      label: 'LinkedIn',
      icon: '💼',
      bg: '#0077B5',
      action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`, '_blank'),
    },
    {
      label: 'Telegram',
      icon: '✈️',
      bg: '#2CA5E0',
      action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(shareText)}`, '_blank'),
    },
    {
      label: 'Email',
      icon: '📧',
      bg: '#6366f1',
      action: () => window.open(`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(shareText + '\n\n' + postUrl)}`, '_blank'),
    },
  ];

  const filteredConnections = connections.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupChats = chats.filter(c =>
    c.isGroup &&
    (c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || !searchQuery)
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Modal — slides up from bottom on mobile */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div
          className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col"
          style={{ maxHeight: '85vh' }}
          onClick={e => e.stopPropagation()}
        >

          {/* Handle bar — mobile */}
          <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full" style={{ background: '#e5e7eb' }} />
          </div>

          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 flex-shrink-0"
            style={{ borderBottom: '1px solid #f3f4f6' }}
          >
            <div>
              <h3 className="font-black text-gray-900 text-lg">Share Post</h3>
              <p className="text-xs text-gray-400 mt-0.5 truncate" style={{ maxWidth: '240px' }}>
                {post.title}
              </p>
            </div>
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

          {/* Tab Toggle */}
          <div
            className="flex mx-5 mt-4 mb-1 p-1 rounded-2xl flex-shrink-0"
            style={{ background: '#f3f4f6' }}
          >
            <button
              onClick={() => setActiveTab('external')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-bold transition-all rounded-xl"
              style={activeTab === 'external' ? {
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                color: 'white',
                boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
              } : { color: '#6b7280' }}
            >
              <Share2 size={13} />
              External
            </button>
            <button
              onClick={() => setActiveTab('campus')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-bold transition-all rounded-xl"
              style={activeTab === 'campus' ? {
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                color: 'white',
                boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
              } : { color: '#6b7280' }}
            >
              <Users size={13} />
              Campus Connect
            </button>
          </div>

          {/* ── EXTERNAL TAB ── */}
          {activeTab === 'external' && (
            <div className="px-5 pb-5 overflow-y-auto flex-1">

              {/* Share Icons */}
              <div className="grid grid-cols-5 gap-3 mt-5 mb-5">
                {externalOptions.map(opt => (
                  <button
                    key={opt.label}
                    onClick={opt.action}
                    className="flex flex-col items-center gap-2 transition-all hover:scale-110 active:scale-95"
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm"
                      style={{ background: opt.bg }}
                    >
                      {opt.icon}
                    </div>
                    <span className="text-xs font-medium text-gray-500 text-center leading-tight">
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Copy Link */}
              <div
                className="flex items-center gap-3 p-3.5 rounded-2xl"
                style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-0.5 font-medium">Post Link</p>
                  <p className="text-xs font-medium text-gray-600 truncate">{postUrl}</p>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all flex-shrink-0"
                  style={{
                    background: copied
                      ? 'linear-gradient(135deg, #059669, #0891b2)'
                      : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                    minWidth: '72px',
                    justifyContent: 'center',
                  }}
                >
                  {copied ? <><Check size={12} /> Copied!</> : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* ── CAMPUS CONNECT TAB ── */}
          {activeTab === 'campus' && (
            <div className="flex flex-col flex-1 overflow-hidden">

              {/* Search */}
              <div className="px-5 py-3 flex-shrink-0">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5" style={{ color: '#9ca3af' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search connections or groups..."
                    autoFocus
                    className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all"
                    style={{ background: '#f9fafb', border: '2px solid #e5e7eb' }}
                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>

              {/* Scrollable List */}
              <div className="overflow-y-auto flex-1 px-5 pb-5">
                {loadingConnections ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 shimmer rounded-2xl" />
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Group Chats */}
                    {groupChats.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                          Groups
                        </p>
                        <div className="space-y-2">
                          {groupChats.map(chat => (
                            <div
                              key={chat._id}
                              className="flex items-center gap-3 p-3 rounded-2xl"
                              style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}
                            >
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                              >
                                {chat.name?.charAt(0)?.toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 text-sm truncate">{chat.name}</p>
                                <p className="text-xs text-gray-400">
                                  {chat.members?.length} members
                                </p>
                              </div>
                              <button
                                onClick={() => handleShareToChat(chat._id)}
                                disabled={sending[chat._id] || sent[chat._id]}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0"
                                style={sent[chat._id] ? {
                                  background: '#ecfdf5',
                                  color: '#059669',
                                } : {
                                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                                  color: 'white',
                                  opacity: sending[chat._id] ? 0.6 : 1,
                                }}
                              >
                                {sent[chat._id]
                                  ? <><Check size={12} /> Sent</>
                                  : sending[chat._id]
                                  ? '...'
                                  : <><Send size={12} /> Send</>
                                }
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Connections */}
                    {filteredConnections.length > 0 && (
                      <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                          Connections
                        </p>
                        <div className="space-y-2">
                          {filteredConnections.map(conn => {
                            const key = `conn_${conn._id}`;
                            return (
                              <div
                                key={conn._id}
                                className="flex items-center gap-3 p-3 rounded-2xl"
                                style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}
                              >
                                <img
                                  src={conn.profilePicture ||
                                    `https://ui-avatars.com/api/?name=${conn.name}&background=7c3aed&color=fff&size=40`}
                                  className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                                  alt={conn.name}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-gray-900 text-sm truncate">
                                    {conn.name}
                                  </p>
                                  <p className="text-xs font-medium" style={{ color: '#7c3aed' }}>
                                    @{conn.username}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleShareToConnection(conn._id)}
                                  disabled={sending[key] || sent[key]}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0"
                                  style={sent[key] ? {
                                    background: '#ecfdf5',
                                    color: '#059669',
                                  } : {
                                    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                                    color: 'white',
                                    opacity: sending[key] ? 0.6 : 1,
                                  }}
                                >
                                  {sent[key]
                                    ? <><Check size={12} /> Sent</>
                                    : sending[key]
                                    ? '...'
                                    : <><Send size={12} /> Send</>
                                  }
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Empty */}
                    {filteredConnections.length === 0 && groupChats.length === 0 && (
                      <div className="text-center py-10">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3"
                          style={{ background: '#f5f3ff' }}
                        >
                          👥
                        </div>
                        <p className="font-bold text-gray-700 text-sm">
                          {searchQuery ? 'No results found' : 'No connections yet'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {searchQuery
                            ? 'Try a different search'
                            : 'Connect with students to share posts directly'}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ShareModal;