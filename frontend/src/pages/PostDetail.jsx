// frontend/src/pages/PostDetail.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import CommentsSection from '../components/CommentsSection';
import useHideChatbot from '../hooks/useHideChatbot';
import { ArrowLeft, Heart, MessageCircle, Share2, Bookmark, BookmarkCheck } from 'lucide-react';

const PostDetail = () => {
  useHideChatbot();
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const typeConfig = {
    project: { emoji: '🚀', label: 'Project', bg: '#ede9fe', color: '#5b21b6' },
    job:     { emoji: '💼', label: 'Job',     bg: '#dcfce7', color: '#15803d' },
    review:  { emoji: '⭐', label: 'Review',  bg: '#fef9c3', color: '#a16207' },
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/posts/${id}`);
      setPost(data.post);
      setIsLiked(data.post.likes?.some(l => l === user.id || l?._id === user.id));
      setLikesCount(data.post.likes?.length || 0);
      setIsSaved(data.post.saves?.includes(user.id));
    } catch (err) {
      console.log('Post fetch error:', err.message);
      navigate('/feed');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const { data } = await API.put(`/posts/${id}/like`);
      setIsLiked(data.isLiked);
      setLikesCount(data.likesCount);
    } catch (err) {
      console.log('Like error:', err.message);
    }
  };

  const handleSave = async () => {
    try {
      const { data } = await API.put(`/posts/${id}/save`);
      setIsSaved(data.isSaved);
    } catch (err) {
      console.log('Save error:', err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await API.delete(`/posts/${id}`);
      navigate('/feed');
    } catch (err) {
      console.log('Delete error:', err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex" style={{ background: '#f1f5f9' }}>
        <Sidebar onCreatePost={() => {}} />
        <div className="flex-1 sm:ml-64 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: '#7c3aed', borderTopColor: 'transparent' }} />
        </div>
      </div>
    );
  }

  if (!post) return null;

  const config = typeConfig[post.type] || typeConfig.project;
  const isOwner = post.author?._id === user.id;

  return (
    <div className="min-h-screen flex" style={{ background: '#f1f5f9' }}>
      <Sidebar onCreatePost={() => {}} />

      <div className="flex-1 sm:ml-64">
        <div className="h-14 sm:hidden" />

        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 sm:pb-8">

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-5 font-bold text-sm transition-all hover:opacity-70"
            style={{ color: '#7c3aed' }}
          >
            <ArrowLeft size={18} />
            Back
          </button>

          {/* Post Card */}
          <div
            className="bg-white rounded-3xl overflow-hidden shadow-sm"
            style={{ border: '1px solid #e5e7eb' }}
          >
            {/* Author Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={post.author?.profilePicture ||
                    `https://ui-avatars.com/api/?name=${post.author?.name}&background=7c3aed&color=fff&size=44`}
                  className="w-11 h-11 rounded-2xl object-cover cursor-pointer"
                  style={{ border: '2px solid #ede9fe' }}
                  alt={post.author?.name}
                  onClick={() => navigate(`/profile/${post.author?.username}`)}
                />
                <div>
                  <button
                    onClick={() => navigate(`/profile/${post.author?.username}`)}
                    className="font-bold text-gray-900 text-sm hover:text-violet-600 transition-colors block text-left"
                  >
                    {post.author?.name}
                  </button>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>
                    @{post.author?.username}
                  </p>
                </div>
              </div>
              <span
                className="text-xs px-3 py-1.5 rounded-xl font-bold"
                style={{ background: config.bg, color: config.color }}
              >
                {config.emoji} {config.label}
              </span>
            </div>

            {/* Title */}
            <div className="px-5 pb-3">
              <h1 className="font-black text-gray-900 text-xl leading-snug mb-2">
                {post.title}
              </h1>
              <p className="text-gray-600 text-sm leading-relaxed">{post.content}</p>
            </div>

            {/* Media */}
            {post.mediaUrl && (
              <div className="w-full">
                {post.mediaType === 'video' ? (
                  <video
                    src={post.mediaUrl}
                    controls
                    className="w-full object-cover"
                    style={{ maxHeight: '420px', background: '#000' }}
                  />
                ) : (
                  <img
                    src={post.mediaUrl}
                    alt="post"
                    className="w-full object-cover"
                    style={{ maxHeight: '420px' }}
                  />
                )}
              </div>
            )}

            {/* Project Info */}
            {post.type === 'project' && (
              <div className="px-5 py-4 space-y-2">
                {post.techStack?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {post.techStack.map((tech, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                        style={{ background: '#f5f3ff', color: '#5b21b6' }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-4">
                  {post.githubLink && (
                    <a href={post.githubLink} target="_blank" rel="noreferrer"
                      className="text-xs font-semibold hover:underline"
                      style={{ color: '#7c3aed' }}>
                      ↗ GitHub
                    </a>
                  )}
                  {post.projectLink && (
                    <a href={post.projectLink} target="_blank" rel="noreferrer"
                      className="text-xs font-semibold hover:underline"
                      style={{ color: '#7c3aed' }}>
                      ↗ Live Demo
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Job Info */}
              {post.type === 'job' && (
  <div className="px-5 py-4">
    <div
      className="rounded-2xl p-4 space-y-1.5"
      style={{
        background: 'linear-gradient(135deg,#f0fdf4,#ecfdf5)',
        border: '1px solid #bbf7d0'
      }}
    >
      {post.companyName && (
        <p className="text-sm font-bold text-gray-800">
          {post.companyName}
        </p>
      )}
      {post.jobRole && (
        <p className="text-xs text-gray-600">{post.jobRole}</p>
      )}
      {post.jobLocation && (
        <p className="text-xs text-gray-500">{post.jobLocation}</p>
      )}

      {/* ✅ FIXED */}
      {post.applyLink && (
        <a
          href={post.applyLink}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-2 text-white text-xs px-4 py-1.5 rounded-lg font-bold hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg,#059669,#0891b2)'
          }}
        >
          Apply Now →
        </a>
      )}
    </div>
  </div>
)}

            {/* Review Info */}
            {post.type === 'review' && (
              <div className="px-5 py-3 flex items-center gap-2 flex-wrap">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(star => (
                    <span key={star} style={{ color: star <= (post.rating || 0) ? '#f59e0b' : '#e5e7eb', fontSize: '16px' }}>★</span>
                  ))}
                </div>
                <span className="text-xs text-gray-400">({post.rating}/5)</span>
                {post.reviewCategory && (
                  <span className="text-xs px-2 py-0.5 rounded-lg font-semibold capitalize"
                    style={{ background: '#fef9c3', color: '#a16207' }}>
                    {post.reviewCategory}
                  </span>
                )}
              </div>
            )}

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="px-5 pb-3 flex flex-wrap gap-1.5">
                {post.tags.map((tag, i) => (
                  <span key={i} className="text-xs font-medium" style={{ color: '#a78bfa' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div
              className="px-5 py-2.5 flex items-center gap-3 text-xs font-medium"
              style={{ color: '#9ca3af', borderTop: '1px solid #f9fafb' }}
            >
              <span>{likesCount} likes</span>
              <span>·</span>
              <span>{post.commentCount || 0} comments</span>
            </div>

            {/* Action Buttons */}
            <div
              className="flex items-center px-2 py-2"
              style={{ borderTop: '1px solid #f3f4f6' }}
            >
              <button
                onClick={handleLike}
                className="flex items-center gap-1.5 flex-1 justify-center py-2.5 px-2 rounded-xl text-xs font-semibold transition-all"
                style={isLiked
                  ? { color: '#ef4444', background: '#fef2f2' }
                  : { color: '#9ca3af' }
                }
                onMouseEnter={e => { if (!isLiked) { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#ef4444'; }}}
                onMouseLeave={e => { if (!isLiked) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; }}}
              >
                <Heart size={16} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : '#9ca3af'} />
                <span className="hidden sm:inline">Like</span>
              </button>

              <button
                className="flex items-center gap-1.5 flex-1 justify-center py-2.5 px-2 rounded-xl text-xs font-semibold"
                style={{ color: '#7c3aed', background: '#f5f3ff' }}
              >
                <MessageCircle size={16} />
                <span className="hidden sm:inline">Comments</span>
              </button>

              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 flex-1 justify-center py-2.5 px-2 rounded-xl text-xs font-semibold transition-all"
                style={isSaved
                  ? { color: '#7c3aed', background: '#f5f3ff' }
                  : { color: '#9ca3af' }
                }
                onMouseEnter={e => { if (!isSaved) { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#7c3aed'; }}}
                onMouseLeave={e => { if (!isSaved) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; }}}
              >
                {isSaved
                  ? <BookmarkCheck size={16} />
                  : <Bookmark size={16} />
                }
                <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 flex-1 justify-center py-2.5 px-2 rounded-xl text-xs font-semibold transition-all"
                  style={{ color: '#fca5a5' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fca5a5'; }}
                >
                  🗑️
                  <span className="hidden sm:inline">Delete</span>
                </button>
              )}
            </div>

            {/* ✅ Comments Section — always visible, scrolls to it */}
            <div
              id="comments-section"
              style={{ borderTop: '1px solid #f3f4f6' }}
            >
              <CommentsSection
                postId={post._id}
                currentUserId={user.id}
              />
            </div>
          </div>
        </div>
      </div>

      <MobileNav onCreatePost={() => {}} />
    </div>
  );
};

export default PostDetail;