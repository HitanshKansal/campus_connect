import { useState, useRef } from 'react';
import { Edit3, Trash2, X, Check, Reply } from 'lucide-react';
import API from '../../api/axios';

const MessageBubble = ({
  message,
  isOwn,
  onReply,
  isGroup,
  onProfileClick,
  onMessageUpdated,
  onMessageDeleted,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content || '');
  const [saving, setSaving] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [showTime, setShowTime] = useState(false);
  const touchStartX = useRef(null);
  const timeoutRef = useRef(null);

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchMove = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    if (dx < 0) {
      const offset = Math.max(dx, -55);
      setSwipeOffset(offset);
      if (dx < -15) setShowTime(true);
    }
  };

  const onTouchEnd = () => {
    setSwipeOffset(0);
    touchStartX.current = null;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShowTime(false), 2000);
  };

  const handleEdit = async () => {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === message.content) {
      setIsEditing(false);
      setEditText(message.content || '');
      return;
    }
    setSaving(true);
    try {
      await API.put(`/chats/messages/${message._id}`, { content: trimmed });
      onMessageUpdated?.({ ...message, content: trimmed, isEdited: true });
      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to edit');
      setEditText(message.content || '');
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (forEveryone) => {
    setShowMenu(false);
    try {
      await API.delete(`/chats/messages/${message._id}`, {
        data: { deleteForEveryone: forEveryone },
      });
      onMessageDeleted?.(message._id, forEveryone);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const renderMedia = () => {
    if (!message.mediaUrl) return null;

    if (message.mediaType === 'image') {
      return (
        <img
          src={message.mediaUrl}
          alt="media"
          className="rounded-xl max-w-full object-cover mb-1.5 cursor-pointer"
          style={{ maxHeight: '220px' }}
          onClick={() => window.open(message.mediaUrl, '_blank')}
        />
      );
    }

    if (message.mediaType === 'video') {
      return (
        <video
          src={message.mediaUrl}
          controls
          className="rounded-xl max-w-full mb-1.5"
          style={{ maxHeight: '220px' }}
        />
      );
    }

    if (message.mediaType === 'pdf') {
      return (
        <a
          href={message.mediaUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-xl mb-1.5"
          style={{
            background: isOwn ? 'rgba(255,255,255,0.15)' : '#f3f4f6',
            color: isOwn ? 'white' : '#374151',
          }}
        >
          <span className="text-xl">📄</span>
          <span className="text-sm font-medium">View PDF</span>
        </a>
      );
    }

    return null;
  };

  if (message.deletedForEveryone) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
        <div
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs italic"
          style={{
            background: '#f3f4f6',
            color: '#9ca3af',
            border: '1px solid #e5e7eb',
          }}
        >
          🚫 Message deleted
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 relative`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {showTime && (
        <div
          className="absolute text-xs font-medium px-2 py-0.5 rounded-lg pointer-events-none"
          style={{
            color: '#9ca3af',
            top: '50%',
            transform: 'translateY(-50%)',
            [isOwn ? 'left' : 'right']: 'calc(100% + 6px)',
          }}
        >
          {formatTime(message.createdAt)}
        </div>
      )}

      <div
        className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
        style={{
          maxWidth: '70%',
          transform: `translateX(${swipeOffset}px)`,
          transition: swipeOffset === 0 ? 'transform 0.25s ease' : 'none',
        }}
      >
        {!isOwn && isGroup && message.sender?.name && (
          <button
            onClick={() => onProfileClick?.(message.sender?.username)}
            className="text-xs font-bold mb-1 ml-1 hover:underline"
            style={{ color: '#7c3aed' }}
          >
            {message.sender.name}
          </button>
        )}

        {message.replyTo && !message.replyTo.deletedForEveryone && (
          <div
            className="px-3 py-2 rounded-xl mb-1 border-l-2"
            style={{
              background: isOwn ? 'rgba(255,255,255,0.15)' : '#f5f3ff',
              borderLeftColor: '#7c3aed',
            }}
          >
            <p className="text-xs font-bold text-purple-600">
              {message.replyTo.sender?.name}
            </p>
            <p className="text-xs truncate">
              {message.replyTo.mediaType
                ? `📎 ${message.replyTo.mediaType}`
                : message.replyTo.content}
            </p>
          </div>
        )}

        <div className="relative group">
          <div
            className={`rounded-2xl px-3.5 py-2.5 shadow-sm ${
              isOwn ? 'rounded-br-sm' : 'rounded-bl-sm'
            }`}
            style={
              isOwn
                ? { background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white' }
                : { background: 'white', color: '#1f2937', border: '1px solid #f3f4f6' }
            }
          >
            {renderMedia()}

            {isEditing ? (
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full text-sm bg-transparent outline-none resize-none text-white"
              />
            ) : (
              <>
                {message.content && (
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                )}

                <div className="flex items-center gap-1 mt-1 text-xs">
                  {message.isEdited && <span className="italic">edited</span>}
                  <span>{formatTime(message.createdAt)}</span>
                  {isOwn && (
                    <span>
                      {message.readBy?.length > 1 ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {!isEditing && (
            <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100">
              <button onClick={() => onReply(message)}>
                <Reply size={12} />
              </button>

              {isOwn && (
                <button onClick={() => setIsEditing(true)}>
                  <Edit3 size={12} />
                </button>
              )}

              <button onClick={() => setShowMenu(!showMenu)}>
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;