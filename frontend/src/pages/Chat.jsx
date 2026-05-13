// frontend/src/pages/Chat.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';
import NewChatModal from '../components/chat/NewChatModal';
import Sidebar from '../components/Sidebar';
import useHideChatbot from '../hooks/useHideChatbot';
import MobileNav from '../components/MobileNav';
import { Edit, ArrowLeft } from 'lucide-react';

const Chat = () => {
  useHideChatbot();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { fetchChats(); }, []);

  const fetchChats = async () => {
    try {
      const { data } = await API.get('/chats');
      setChats(data.chats);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSelect = (chat) => setSelectedChat(chat);

  const handleNewChat = (chat) => {
    setChats(prev => {
      const exists = prev.find(c => c._id === chat._id);
      if (exists) return prev;
      return [chat, ...prev];
    });
    setSelectedChat(chat);
    setShowNewChat(false);
  };

  const handleMessageSent = (message, chatId) => {
    setChats(prev =>
      prev.map(chat =>
        chat._id === chatId
          ? { ...chat, lastMessage: message, updatedAt: new Date() }
          : chat
      ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    );
  };

  const handleGroupLeft = (chatId) => {
    setChats(prev => prev.filter(c => c._id !== chatId));
    setSelectedChat(null);
  };

  const handleGroupDeleted = (chatId) => {
    setChats(prev => prev.filter(c => c._id !== chatId));
    setSelectedChat(null);
  };

  return (
    // ✅ KEY FIX: use 100dvh for dynamic viewport height on mobile
    <div
      className="flex overflow-hidden"
      style={{ height: '100dvh', maxHeight: '100dvh' }}
    >
      <Sidebar onCreatePost={() => {}} />

      <div
        className="flex-1 sm:ml-64 flex flex-col overflow-hidden"
        style={{ height: '100dvh' }}
      >
        {/* Mobile top bar spacer */}
        <div className="h-14 sm:hidden flex-shrink-0" />

        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ background: 'white', borderBottom: '1px solid #f3f4f6' }}
        >
          <div className="flex items-center gap-3">
            {selectedChat && (
              <button
                onClick={() => setSelectedChat(null)}
                className="sm:hidden w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: '#f5f3ff', color: '#7c3aed' }}
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <h1 className="font-black text-gray-900 text-base sm:text-lg">
              {selectedChat
                ? (selectedChat.isGroup
                    ? selectedChat.name
                    : selectedChat.members?.find(m => m._id !== user.id)?.name || 'Chat')
                : 'Messages'
              }
            </h1>
          </div>
          <button
            onClick={() => setShowNewChat(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-white text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            <Edit size={14} />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>

        {/* ✅ Content area — takes remaining height */}
        <div className="flex flex-1 overflow-hidden">

          {/* Chat List */}
          <div
            className={`flex-col w-full sm:w-72 bg-white border-r flex-shrink-0 overflow-hidden ${
              selectedChat ? 'hidden sm:flex' : 'flex'
            }`}
            style={{ borderColor: '#f3f4f6' }}
          >
            <ChatList
              chats={chats}
              selectedChat={selectedChat}
              currentUserId={user.id}
              loading={loading}
              onSelectChat={handleChatSelect}
            />
          </div>

          {/* Chat Window */}
          <div
            className={`flex-col flex-1 overflow-hidden ${
              selectedChat ? 'flex' : 'hidden sm:flex'
            }`}
          >
            {selectedChat ? (
              <ChatWindow
                chat={selectedChat}
                currentUser={user}
                onMessageSent={handleMessageSent}
                onBack={() => setSelectedChat(null)}
                onGroupLeft={handleGroupLeft}
                onGroupDeleted={handleGroupDeleted}
              />
            ) : (
              <div className="flex-1 flex-col items-center justify-center text-center p-8 hidden sm:flex">
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-5"
                  style={{ background: 'linear-gradient(135deg, #f5f3ff, #eef2ff)' }}
                >
                  💬
                </div>
                <h3 className="text-xl font-black text-gray-800 mb-2">Your Messages</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-xs">
                  Connect with fellow students
                </p>
                <button
                  onClick={() => setShowNewChat(true)}
                  className="text-white px-6 py-2.5 rounded-xl font-bold hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                >
                  Start a Conversation
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ✅ Mobile bottom nav spacer — only when no chat selected */}
        {!selectedChat && <div className="h-16 sm:hidden flex-shrink-0" />}
      </div>

      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onChatCreated={handleNewChat}
          currentUserId={user.id}
        />
      )}

      {!selectedChat && <MobileNav onCreatePost={() => {}} />}
    </div>
  );
};

export default Chat;