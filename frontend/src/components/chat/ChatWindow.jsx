// frontend/src/components/chat/ChatWindow.jsx
// Full complete file:

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import API from '../../api/axios';
import MessageBubble from './MessageBubble';
import GroupInfoPanel from './GroupInfoPanel';
import { Info, ArrowLeft, Paperclip, Send, X } from 'lucide-react';

const ChatWindow = ({ chat, currentUser, onMessageSent, onBack, onGroupLeft, onGroupDeleted }) => {
  const navigate = useNavigate();
  const { socket, onlineUsers } = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef();
  const typingTimeoutRef = useRef();

  const otherMember = chat.isGroup
    ? null
    : chat.members?.find(m => m._id !== currentUser.id);
  const isOnline = !chat.isGroup && onlineUsers.includes(otherMember?._id);

  useEffect(() => {
    fetchMessages();
    if (socket) {
      socket.emit('chat:join', chat._id);

      socket.on('message:receive', (message) => {
        setMessages(prev => [...prev, message]);
        setTimeout(scrollToBottom, 50);
      });

      socket.on('message:edited', ({ message }) => {
        setMessages(prev =>
          prev.map(m => m._id === message._id ? { ...m, ...message } : m)
        );
      });

      socket.on('message:deleted', ({ messageId, deletedForEveryone }) => {
        if (deletedForEveryone) {
          setMessages(prev =>
            prev.map(m =>
              m._id === messageId
                ? { ...m, deletedForEveryone: true, content: '', mediaUrl: '' }
                : m
            )
          );
        } else {
          setMessages(prev => prev.filter(m => m._id !== messageId));
        }
      });

      socket.on('typing:start', ({ name }) => { setTypingUser(name); setTyping(true); });
      socket.on('typing:stop', () => { setTyping(false); setTypingUser(''); });
    }

    return () => {
      if (socket) {
        socket.emit('chat:leave', chat._id);
        socket.off('message:receive');
        socket.off('message:edited');
        socket.off('message:deleted');
        socket.off('typing:start');
        socket.off('typing:stop');
      }
    };
  }, [chat._id, socket]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/chats/${chat._id}/messages`);
      setMessages(data.messages);
    } catch (err) {
      console.log('Error fetching messages:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (socket) {
      socket.emit('typing:start', { chatId: chat._id, userId: currentUser.id, name: currentUser.name });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop', { chatId: chat._id, userId: currentUser.id });
      }, 1500);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!text.trim() && !fileInputRef.current?.files[0]) return;
    setSending(true);
    try {
      const formData = new FormData();
      if (text.trim()) formData.append('content', text.trim());
      if (replyTo) formData.append('replyTo', replyTo._id);
      if (fileInputRef.current?.files[0]) formData.append('media', fileInputRef.current.files[0]);

      const { data } = await API.post(`/chats/${chat._id}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessages(prev => [...prev, data.message]);
      setText('');
      setReplyTo(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      if (socket) {
        socket.emit('message:send', { chatId: chat._id, message: data.message });
        socket.emit('typing:stop', { chatId: chat._id, userId: currentUser.id });
      }

      onMessageSent(data.message, chat._id);
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      console.log('Send error:', err.message);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = async () => {
    if (fileInputRef.current?.files[0]) await handleSend();
  };

  const handleMessageUpdated = (updatedMessage) => {
    setMessages(prev =>
      prev.map(m => m._id === updatedMessage._id ? { ...m, ...updatedMessage } : m)
    );
    if (socket) {
      socket.emit('message:edited', { chatId: chat._id, message: updatedMessage });
    }
  };

  const handleMessageDeleted = (messageId, deletedForEveryone) => {
    if (deletedForEveryone) {
      setMessages(prev =>
        prev.map(m =>
          m._id === messageId
            ? { ...m, deletedForEveryone: true, content: '', mediaUrl: '' }
            : m
        )
      );
    } else {
      setMessages(prev => prev.filter(m => m._id !== messageId));
    }
    if (socket) {
      socket.emit('message:deleted', { chatId: chat._id, messageId, deletedForEveryone });
    }
  };

  const groupMessagesByDate = (msgs) => {
    const groups = {};
    msgs.forEach(msg => {
      const date = new Date(msg.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);
  const chatName = chat.isGroup ? chat.name : otherMember?.name;
  const chatAvatar = chat.isGroup ? null : otherMember?.profilePicture || null;

  return (
    // ✅ KEY FIX: use fixed positioning approach for mobile
    <div className="flex h-full overflow-hidden">

      {/* Chat Area */}
      <div
        className={`flex flex-col ${showGroupInfo && chat.isGroup ? 'hidden sm:flex sm:flex-1' : 'flex-1'}`}
        style={{ height: '100%', overflow: 'hidden' }}
      >

        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{ background: 'white', borderBottom: '1px solid #f3f4f6' }}
        >
          <button
            onClick={onBack}
            className="sm:hidden w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#f5f3ff', color: '#7c3aed' }}
          >
            <ArrowLeft size={16} />
          </button>

          <div
            className="relative flex-shrink-0 cursor-pointer"
            onClick={() => {
              if (chat.isGroup) setShowGroupInfo(true);
              else navigate(`/profile/${otherMember?.username}`);
            }}
          >
            {chatAvatar ? (
              <img src={chatAvatar} className="w-10 h-10 rounded-xl object-cover" alt={chatName} />
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
              >
                {chatName?.charAt(0)?.toUpperCase()}
              </div>
            )}
            {!chat.isGroup && isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
            )}
          </div>

          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => {
              if (chat.isGroup) setShowGroupInfo(true);
              else navigate(`/profile/${otherMember?.username}`);
            }}
          >
            <p className="font-bold text-gray-900 text-sm truncate">{chatName}</p>
            <p className="text-xs" style={{ color: '#9ca3af' }}>
              {chat.isGroup
                ? `${chat.members?.length} members`
                : isOnline ? '🟢 Online' : 'Offline'
              }
            </p>
          </div>

          {chat.isGroup && (
            <button
              onClick={() => setShowGroupInfo(!showGroupInfo)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
              style={showGroupInfo
                ? { background: '#f5f3ff', color: '#7c3aed' }
                : { color: '#9ca3af' }
              }
            >
              <Info size={18} />
            </button>
          )}
        </div>

        {/* ✅ Messages — flex-1 with overflow scroll */}
        <div
          className="flex-1 overflow-y-auto px-3 sm:px-4 py-3"
          style={{ background: '#f8fafc', overflowY: 'auto' }}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-400">Loading...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
                style={{ background: 'linear-gradient(135deg, #f5f3ff, #eef2ff)' }}
              >
                👋
              </div>
              <p className="font-bold text-gray-700">Say hello!</p>
              <p className="text-xs text-gray-400 mt-1">
                {chat.isGroup ? `Welcome to ${chat.name}` : `Start chatting with ${otherMember?.name}`}
              </p>
            </div>
          ) : (
            Object.entries(messageGroups).map(([date, msgs]) => (
              <div key={date}>
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px" style={{ background: '#e5e7eb' }} />
                  <span
                    className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{ background: '#f3f4f6', color: '#9ca3af' }}
                  >
                    {date}
                  </span>
                  <div className="flex-1 h-px" style={{ background: '#e5e7eb' }} />
                </div>
                {msgs.map((message, idx) => (
                  <MessageBubble
                    key={message._id || idx}
                    message={message}
                    isOwn={message.sender?._id === currentUser.id || message.sender === currentUser.id}
                    onReply={() => setReplyTo(message)}
                    isGroup={chat.isGroup}
                    onProfileClick={(username) => navigate(`/profile/${username}`)}
                    onMessageUpdated={handleMessageUpdated}
                    onMessageDeleted={handleMessageDeleted}
                  />
                ))}
              </div>
            ))
          )}

          {typing && (
            <div className="flex items-center gap-2 px-2 mt-2">
              <div
                className="rounded-2xl px-4 py-2"
                style={{ background: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
              >
                <div className="flex gap-1 items-center">
                  {[0, 150, 300].map(delay => (
                    <div
                      key={delay}
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ background: '#9ca3af', animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs text-gray-400">{typingUser} is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Reply Preview */}
        {replyTo && (
          <div
            className="flex items-center gap-2 px-4 py-2 flex-shrink-0"
            style={{ background: '#f5f3ff', borderTop: '1px solid #ede9fe' }}
          >
            <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: '#7c3aed' }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold" style={{ color: '#7c3aed' }}>{replyTo.sender?.name}</p>
              <p className="text-xs text-gray-500 truncate">
                {replyTo.mediaType ? `📎 ${replyTo.mediaType}` : replyTo.content}
              </p>
            </div>
            <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
              <X size={14} />
            </button>
          </div>
        )}

        {/* ✅ Input — always at bottom, flex-shrink-0 */}
        <div
          className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
          style={{
            background: 'white',
            borderTop: '1px solid #f3f4f6',
            // ✅ Fix for mobile keyboard pushing input up
            position: 'relative',
            zIndex: 10,
          }}
        >
          <label
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all"
            style={{ color: '#9ca3af' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f5f3ff'; e.currentTarget.style.color = '#7c3aed'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Paperclip size={18} />
          </label>

          <input
            type="text"
            value={text}
            onChange={handleTyping}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend(e)}
            placeholder="Type a message..."
            className="flex-1 rounded-2xl px-4 py-2.5 text-sm font-medium outline-none"
            style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              color: '#374151',
              // ✅ Prevent zoom on iOS
              fontSize: '16px',
            }}
            onFocus={e => e.target.style.borderColor = '#a78bfa'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />

          <button
            onClick={handleSend}
            disabled={sending || !text.trim()}
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={text.trim()
              ? { background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white' }
              : { background: '#f3f4f6', color: '#d1d5db' }
            }
          >
            {sending
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Send size={16} />
            }
          </button>
        </div>
      </div>

      {/* Group Info Panel */}
      {showGroupInfo && chat.isGroup && (
        <div
          className="w-full sm:w-72 flex-shrink-0 border-l overflow-hidden"
          style={{ borderColor: '#f3f4f6' }}
        >
          <GroupInfoPanel
            chat={chat}
            currentUser={currentUser}
            onClose={() => setShowGroupInfo(false)}
            onGroupLeft={onGroupLeft || (() => {})}
            onGroupDeleted={onGroupDeleted || (() => {})}
          />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;