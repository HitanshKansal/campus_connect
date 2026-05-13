// frontend/src/components/CommentsSection.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const CommentsSection = ({ postId, currentUserId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const { data } = await API.get(`/comments/${postId}`);
      setComments(data.comments);
    } catch (err) {
      console.log('Error fetching comments:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);

    try {
      const { data } = await API.post(`/comments/${postId}`, { content: newComment });
      setComments(prev => [data.comment, ...prev]);
      setNewComment('');
    } catch (err) {
      console.log('Comment error:', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReply = async (commentId) => {
    if (!replyText.trim()) return;

    try {
      const { data } = await API.post(`/comments/${commentId}/reply`, { content: replyText });
      setComments(prev => prev.map(c =>
        c._id === commentId
          ? { ...c, replies: [...c.replies, data.reply] }
          : c
      ));
      setReplyText('');
      setReplyingTo(null);
      setExpandedReplies(prev => ({ ...prev, [commentId]: true }));
    } catch (err) {
      console.log('Reply error:', err.message);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const { data } = await API.put(`/comments/${commentId}/like`);
      setComments(prev => prev.map(c =>
        c._id === commentId
          ? {
              ...c,
              likes: data.isLiked
                ? [...c.likes, currentUserId]
                : c.likes.filter(id => id !== currentUserId)
            }
          : c
      ));
    } catch (err) {
      console.log('Like error:', err.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await API.delete(`/comments/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch (err) {
      console.log('Delete error:', err.message);
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
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

  return (
    <div className="border-t border-gray-100 px-4 py-4">

      {/* Add Comment Input */}
      <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? '...' : 'Post'}
        </button>
      </form>

      {/* Comments List */}
      {loading ? (
        <p className="text-center text-gray-400 text-sm py-4">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-4">
          No comments yet. Be the first! 💬
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment._id}>
              {/* Comment */}
              <div className="flex gap-2">
                <img
                  src={comment.author?.profilePicture ||
                    `https://ui-avatars.com/api/?name=${comment.author?.name}&background=4F46E5&color=fff&size=32`}
                  className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                  alt={comment.author?.name}
                />
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-2xl px-3 py-2">
                    <p
  className="font-semibold text-xs text-gray-800 cursor-pointer hover:text-indigo-600 transition-colors"
  onClick={() => navigate(`/profile/${comment.author?.username}`)}
>
  {comment.author?.name}
  {comment.author?.isIdVerified && <span className="ml-1">🪪</span>}
</p>
                    <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
                  </div>

                  {/* Comment Actions */}
                  <div className="flex items-center gap-3 mt-1 ml-2">
                    <span className="text-xs text-gray-400">{formatTime(comment.createdAt)}</span>
                    <button
                      onClick={() => handleLikeComment(comment._id)}
                      className={`text-xs font-medium ${
                        comment.likes?.includes(currentUserId)
                          ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'
                      }`}
                    >
                      ❤️ {comment.likes?.length > 0 && comment.likes.length}
                    </button>
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                      className="text-xs font-medium text-gray-500 hover:text-indigo-600"
                    >
                      Reply
                    </button>
                    {comment.author?._id === currentUserId && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  {/* Reply Input */}
                  {replyingTo === comment._id && (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Reply to ${comment.author?.name}...`}
                        autoFocus
                        className="flex-1 bg-gray-100 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                      <button
                        onClick={() => handleAddReply(comment._id)}
                        disabled={!replyText.trim()}
                        className="bg-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-medium hover:bg-indigo-700 disabled:opacity-50"
                      >
                        Reply
                      </button>
                    </div>
                  )}

                  {/* Show/Hide Replies */}
                  {comment.replies?.length > 0 && (
                    <button
                      onClick={() => toggleReplies(comment._id)}
                      className="text-xs text-indigo-600 font-medium mt-1 ml-2 hover:underline"
                    >
                      {expandedReplies[comment._id]
                        ? '▲ Hide replies'
                        : `▼ View ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`}
                    </button>
                  )}

                  {/* Replies */}
                  {expandedReplies[comment._id] && (
                    <div className="mt-2 space-y-2 ml-4">
                      {comment.replies.map((reply, idx) => (
                        <div key={idx} className="flex gap-2">
                          <img
                            src={reply.author?.profilePicture ||
                              `https://ui-avatars.com/api/?name=${reply.author?.name}&background=6366F1&color=fff&size=28`}
                            className="w-7 h-7 rounded-full flex-shrink-0 object-cover"
                            alt={reply.author?.name}
                          />
                          <div className="flex-1">
                            <div className="bg-gray-100 rounded-2xl px-3 py-2">
                              <p
  className="font-semibold text-xs text-gray-800 cursor-pointer hover:text-indigo-600 transition-colors"
  onClick={() => navigate(`/profile/${reply.author?.username}`)}
>
  {reply.author?.name}
</p>
                              <p className="text-sm text-gray-700 mt-0.5">{reply.content}</p>
                            </div>
                            <div className="flex items-center gap-3 mt-1 ml-2">
                              <span className="text-xs text-gray-400">{formatTime(reply.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;