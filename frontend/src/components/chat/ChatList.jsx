// frontend/src/components/chat/ChatList.jsx

import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';

const ChatList = ({ chats, selectedChat, currentUserId, loading, onSelectChat }) => {
  const { onlineUsers } = useSocket();
  const navigate = useNavigate();

  const getOtherMember = (chat) =>
    chat.members?.find(m => m._id !== currentUserId);

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000) {
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const getLastMessageText = (chat) => {
    if (!chat.lastMessage) return 'Start a conversation';
    if (chat.lastMessage.deletedForEveryone) return '🚫 Message deleted';
    if (chat.lastMessage.mediaType === 'image') return '📷 Photo';
    if (chat.lastMessage.mediaType === 'video') return '🎥 Video';
    if (chat.lastMessage.mediaType === 'pdf') return '📄 PDF';
    return chat.lastMessage.content || '';
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-3 p-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3 items-center">
            <div className="w-12 h-12 rounded-2xl shimmer flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 shimmer rounded-full w-1/2" />
              <div className="h-2 shimmer rounded-full w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3"
          style={{ background: 'linear-gradient(135deg, #f5f3ff, #eef2ff)' }}
        >
          💬
        </div>
        <p className="font-bold text-gray-600 text-sm">No chats yet</p>
        <p className="text-gray-400 text-xs mt-1">Start a new conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {chats.map(chat => {
        const other = getOtherMember(chat);
        const isOnline = onlineUsers.includes(other?._id);
        const isSelected = selectedChat?._id === chat._id;

        return (
          <div
            key={chat._id}
            onClick={() => onSelectChat(chat)}
            className="flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all"
            style={{
              borderBottom: '1px solid #f9fafb',
              background: isSelected ? '#f5f3ff' : 'white',
            }}
            onMouseEnter={e => {
              if (!isSelected) e.currentTarget.style.background = '#fafafa';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = isSelected ? '#f5f3ff' : 'white';
            }}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {chat.isGroup ? (
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-base"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                >
                  {chat.name?.charAt(0)?.toUpperCase()}
                </div>
              ) : other?.profilePicture ? (
                <img
                  src={other.profilePicture}
                  className="w-12 h-12 rounded-2xl object-cover"
                  alt={other?.name}
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-base"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                >
                  {(chat.isGroup ? chat.name : other?.name)?.charAt(0)?.toUpperCase()}
                </div>
              )}
              {!chat.isGroup && isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>

            {/* Chat Info */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <p className="font-bold text-gray-900 text-sm truncate">
                  {chat.isGroup ? chat.name : other?.name}
                </p>
                <span
                  className="text-xs flex-shrink-0 ml-2"
                  style={{ color: '#9ca3af' }}
                >
                  {formatTime(chat.updatedAt)}
                </span>
              </div>
              <p className="text-xs truncate" style={{ color: '#9ca3af' }}>
                {getLastMessageText(chat)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;