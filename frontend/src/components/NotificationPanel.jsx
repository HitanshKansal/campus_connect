// frontend/src/components/NotificationPanel.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const NotificationPanel = ({ onClose }) => {
  
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data.notifications);
      await API.put('/notifications/mark-all-read');
    } catch (err) {
      console.log('Error fetching notifications');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      like: '❤️',
      comment: '💬',
      reply: '↩️',
      connection_request: '🤝',
      connection_accept: '✅',
    };
    return icons[type] || '🔔';
  };


  const getNotificationText = (notif) => {
    const name = notif.sender?.name || 'Someone';
    const postTitle = notif.post?.title
      ? `"${notif.post.title.slice(0, 30)}${notif.post.title.length > 30 ? '...' : ''}"`
      : 'your post';

    switch (notif.type) {
      case 'like':
        return (
          <span>
            <strong>{name}</strong> liked your post {' '}
            <span style={{ color: '#7c3aed' }}>{postTitle}</span>
          </span>
        );
      case 'comment':
        return (
          <span>
            <strong>{name}</strong> commented on {' '}
            <span style={{ color: '#7c3aed' }}>{postTitle}</span>
          </span>
        );
      case 'reply':
        return (
          <span>
            <strong>{name}</strong> replied to your comment on {' '}
            <span style={{ color: '#7c3aed' }}>{postTitle}</span>
          </span>
        );
      case 'connection_request':
        return (
          <span>
            <strong>{name}</strong>{' '}
            <span style={{ color: '#7c3aed' }}>@{notif.sender?.username}</span>{' '}
            sent you a connection request
          </span>
        );
      case 'connection_accept':
        return (
          <span>
            <strong>{name}</strong>{' '}
            <span style={{ color: '#7c3aed' }}>@{notif.sender?.username}</span>{' '}
            accepted your connection request
          </span>
        );
      default:
        return <span>{notif.message}</span>;
    }
  };

  const formatTime = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

const handleNotificationClick = (notif) => {
  console.log('Notification clicked:', notif); // ← check what's inside
  console.log('Post data:', notif.post);        // ← check if post exists

  const postId = notif.post?._id || notif.post; // ✅ handles both populated and unpopulated

  if (postId) {
    onClose();
    navigate(`/post/${postId}`);
  } else if (notif.sender?.username) {
    onClose();
    navigate(`/profile/${notif.sender.username}`);
  }
};

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div
        className="fixed z-50 bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{
          top: '70px',
          right: '16px',
          width: '360px',
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: '520px',
          border: '1px solid #e5e7eb',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid #f3f4f6' }}
        >
          <h3 className="font-black text-gray-900 text-base">Notifications</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all"
            style={{ background: '#f9fafb' }}
          >
            ✕
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto" style={{ maxHeight: '450px' }}>
          {loading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-2xl shimmer flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 shimmer rounded-full w-3/4" />
                    <div className="h-2 shimmer rounded-full w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-14">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3"
                style={{ background: '#f5f3ff' }}
              >
                🔔
              </div>
              <p className="font-bold text-gray-600 text-sm">No notifications yet</p>
              <p className="text-gray-400 text-xs mt-1">
                Activity from others will appear here
              </p>
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                className="flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-all"
                style={{
                  background: !notif.isRead ? '#faf5ff' : 'white',
                  borderBottom: '1px solid #f9fafb',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f5f3ff'}
                onMouseLeave={e => e.currentTarget.style.background = !notif.isRead ? '#faf5ff' : 'white'}
              >
                {/* Avatar + icon badge */}
                <div className="relative flex-shrink-0">
                  <img
                    src={notif.sender?.profilePicture ||
                      `https://ui-avatars.com/api/?name=${notif.sender?.name}&background=7c3aed&color=fff&size=40`}
                    className="w-10 h-10 rounded-2xl object-cover"
                    alt={notif.sender?.name}
                  />
                  <div
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                    style={{ background: 'white', border: '1px solid #f3f4f6' }}
                  >
                    {getNotificationIcon(notif.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 leading-snug">
                    {getNotificationText(notif)}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>
                    {formatTime(notif.createdAt)}
                  </p>

                  {/* ✅ Show post preview if available */}
                  {notif.post?.title && (
                    <div
                      className="mt-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium truncate"
                      style={{ background: '#f5f3ff', color: '#7c3aed', maxWidth: '220px' }}
                    >
                      📄 {notif.post.title}
                    </div>
                  )}
                </div>

                {/* Unread dot */}
                {!notif.isRead && (
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                    style={{ background: '#7c3aed' }}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;