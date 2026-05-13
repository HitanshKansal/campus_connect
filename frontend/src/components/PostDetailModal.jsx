// frontend/src/components/PostDetailModal.jsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CommentsSection from './CommentsSection';
import ShareModal from './ShareModal';
import API from '../api/axios';
import { X, Heart, Share2, Bookmark, BookmarkCheck, Trash2 } from 'lucide-react';

const PostDetailModal = ({ post, currentUserId, onClose, onLike, onDelete }) => {
  const navigate = useNavigate();
  const [showShare, setShowShare] = useState(false);
  const [isSaved, setIsSaved] = useState(post.saves?.includes(currentUserId));
  const [isLiked, setIsLiked] = useState(
    post.likes?.some(id => id === currentUserId || id?._id === currentUserId)
  );
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [contentExpanded, setContentExpanded] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleLike = async () => {
    try {
      const { data } = await API.put(`/posts/${post._id}/like`);
      setIsLiked(data.isLiked);
      setLikesCount(data.likesCount);
      if (onLike) onLike(post._id);
    } catch (err) {
      console.log('Like error:', err.message);
    }
  };

  const handleSave = async () => {
    try {
      const { data } = await API.put(`/posts/${post._id}/save`);
      setIsSaved(data.isSaved);
    } catch (err) {
      console.log('Save error:', err.message);
    }
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!post.author?.username) return;
    onClose();
    setTimeout(() => navigate(`/profile/${post.author.username}`), 50);
  };

  const typeConfig = {
    project: { label: 'Project', bg: '#ede9fe', color: '#5b21b6' },
    job:     { label: 'Job',     bg: '#dcfce7', color: '#15803d' },
    review:  { label: 'Review',  bg: '#fef9c3', color: '#a16207' },
  };
  const config = typeConfig[post.type] || typeConfig.project;

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const isOwner = post.author?._id === currentUserId;
  const CHAR_LIMIT = 220;
  const isLong = post.content?.length > CHAR_LIMIT;
  const displayContent = contentExpanded || !isLong
    ? post.content
    : post.content?.slice(0, CHAR_LIMIT);

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* ── Modal ── */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6">
        <div
          className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-5xl sm:rounded-3xl overflow-hidden flex flex-col sm:flex-row relative"
          style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}
          onClick={e => e.stopPropagation()}
        >

          {/* ── CLOSE BUTTON — always visible, top right ── */}
          <button
            onClick={onClose}
            className="absolute z-50 flex items-center justify-center transition-all hover:scale-110"
            style={{
              top: '12px',
              right: '12px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)',
              border: '1.5px solid rgba(255,255,255,0.2)',
              cursor: 'pointer',
              color: 'white',
            }}
          >
            <X size={16} strokeWidth={2.5} />
          </button>

          {/* ── LEFT: Media ── */}
          <div
            className="sm:w-[55%] flex-shrink-0 flex items-center justify-center overflow-hidden"
            style={{ background: '#0a0a0a', minHeight: '220px' }}
          >
            {post.mediaUrl ? (
              post.mediaType === 'video' ? (
                <video
                  src={post.mediaUrl}
                  controls
                  className="w-full h-full object-contain"
                  style={{ maxHeight: '90vh' }}
                />
              ) : (
                <img
                  src={post.mediaUrl}
                  alt="post"
                  className="w-full h-full object-contain"
                  style={{ maxHeight: '90vh' }}
                />
              )
            ) : (
              <div
                className="w-full flex flex-col items-center justify-center p-10 text-center"
                style={{
                  background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
                  minHeight: '300px',
                }}
              >
                <span className="text-6xl mb-5">
                  {post.type === 'project' ? '🚀' : post.type === 'job' ? '💼' : '⭐'}
                </span>
                <h2 className="text-2xl font-black text-white mb-3 leading-tight">{post.title}</h2>
                <p className="text-purple-200 text-sm leading-relaxed max-w-xs opacity-80">
                  {post.content?.slice(0, 120)}...
                </p>
              </div>
            )}
          </div>

          {/* ── RIGHT: Details ── */}
          <div className="sm:w-[45%] flex flex-col bg-white overflow-hidden">

            {/* Author Header */}
            <div
              className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
              style={{ borderBottom: '1px solid #f3f4f6' }}
            >
              {/* Avatar — clickable */}
              <img
                src={post.author?.profilePicture ||
                  `https://ui-avatars.com/api/?name=${post.author?.name || 'U'}&background=7c3aed&color=fff&size=44`}
                className="flex-shrink-0 object-cover cursor-pointer transition-opacity hover:opacity-80"
                style={{ width: '44px', height: '44px', borderRadius: '12px', border: '2px solid #ede9fe' }}
                alt={post.author?.name}
                onClick={handleProfileClick}
              />
              <div className="flex-1 min-w-0">
                {/* Name — clickable */}
                <button
                  onClick={handleProfileClick}
                  style={{
                    fontWeight: 700, fontSize: '14px', color: '#111827',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: 0, textAlign: 'left', display: 'block',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#7c3aed'}
                  onMouseLeave={e => e.currentTarget.style.color = '#111827'}
                >
                  {post.author?.name || 'Unknown'}
                  {post.author?.isIdVerified && (
                    <span style={{ marginLeft: '4px', color: '#7c3aed', fontSize: '12px' }}>✓</span>
                  )}
                </button>
                <p style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500, marginTop: '2px' }}>
                  @{post.author?.username || '—'} · {formatDate(post.createdAt)}
                </p>
              </div>
              <span
                className="text-xs px-2.5 py-1 rounded-lg font-semibold flex-shrink-0"
                style={{ background: config.bg, color: config.color }}
              >
                {config.label}
              </span>
            </div>

            {/* ── Scrollable Content + Comments ── */}
            <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>

              {/* Post Content */}
              <div className="px-5 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
                <h3 className="font-black text-gray-900 text-base mb-2 leading-snug">{post.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {displayContent}
                  {isLong && !contentExpanded && (
                    <> {'... '}
                      <button
                        onClick={() => setContentExpanded(true)}
                        style={{ color: '#7c3aed', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        more
                      </button>
                    </>
                  )}
                  {isLong && contentExpanded && (
                    <> {' '}
                      <button
                        onClick={() => setContentExpanded(false)}
                        style={{ color: '#7c3aed', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        less
                      </button>
                    </>
                  )}
                </p>

                {/* Tech Stack */}
                {post.techStack?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {post.techStack.map((tech, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                        style={{ background: '#f5f3ff', color: '#5b21b6' }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* Project Links */}
                {post.type === 'project' && (
                  <div className="flex gap-4 mt-3">
                    {post.githubLink && (
                      <a href={post.githubLink} target="_blank" rel="noreferrer"
                        className="text-xs font-semibold hover:underline" style={{ color: '#7c3aed' }}>
                        ↗ GitHub
                      </a>
                    )}
                    {post.projectLink && (
                      <a href={post.projectLink} target="_blank" rel="noreferrer"
                        className="text-xs font-semibold hover:underline" style={{ color: '#7c3aed' }}>
                        ↗ Live Demo
                      </a>
                    )}
                  </div>
                )}

                {/* Job Info */}
                {post.type === 'job' && (
                  <div className="mt-3 rounded-xl p-3 space-y-1.5"
                    style={{ background: 'linear-gradient(135deg,#f0fdf4,#ecfdf5)', border: '1px solid #bbf7d0' }}>
                    {post.companyName && <p className="text-sm font-bold text-gray-800">{post.companyName}</p>}
                    {post.jobRole && <p className="text-xs text-gray-600 font-medium">{post.jobRole}</p>}
                    {post.jobLocation && <p className="text-xs text-gray-500">{post.jobLocation}</p>}
                    {post.applyLink && (
                      <a href={post.applyLink} target="_blank" rel="noreferrer"
                        className="inline-block mt-1 text-white text-xs px-4 py-1.5 rounded-lg font-bold hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg,#059669,#0891b2)' }}>
                        Apply Now →
                      </a>
                    )}
                  </div>
                )}

                {/* Review */}
                {post.type === 'review' && (
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(star => (
                        <span key={star} style={{ color: star <= (post.rating || 0) ? '#f59e0b' : '#e5e7eb', fontSize: '16px' }}>★</span>
                      ))}
                    </div>
                    <span className="text-xs font-medium text-gray-400">({post.rating}/5)</span>
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
                  <div className="flex flex-wrap gap-1 mt-3">
                    {post.tags.map((tag, i) => (
                      <span key={i} className="text-xs font-medium" style={{ color: '#a78bfa' }}>#{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Comments */}
              <CommentsSection postId={post._id} currentUserId={currentUserId} />
            </div>

            {/* ── Action Bar ── */}
            <div className="flex-shrink-0 px-4 py-3 bg-white" style={{ borderTop: '1px solid #f3f4f6' }}>
              <p className="text-xs font-semibold mb-2 px-1" style={{ color: '#9ca3af' }}>
                {likesCount} {likesCount === 1 ? 'like' : 'likes'}
              </p>
              <div className="flex items-center gap-1">

                {/* Like */}
                <button
                  onClick={handleLike}
                  className="flex items-center gap-1.5 flex-1 justify-center py-2 rounded-xl text-xs font-semibold transition-all"
                  style={isLiked ? { color: '#ef4444', background: '#fef2f2' } : { color: '#9ca3af' }}
                  onMouseEnter={e => { if (!isLiked) { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}}
                  onMouseLeave={e => { if (!isLiked) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; }}}
                >
                  <Heart size={16} fill={isLiked ? '#ef4444' : 'none'} strokeWidth={isLiked ? 0 : 1.8} color={isLiked ? '#ef4444' : '#9ca3af'} />
                  <span>Like</span>
                </button>

                {/* Share */}
                <button
                  onClick={() => setShowShare(true)}
                  className="flex items-center gap-1.5 flex-1 justify-center py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{ color: '#9ca3af' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#374151'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; }}
                >
                  <Share2 size={16} strokeWidth={1.8} />
                  <span>Share</span>
                </button>

                {/* Save */}
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 flex-1 justify-center py-2 rounded-xl text-xs font-semibold transition-all"
                  style={isSaved ? { color: '#7c3aed', background: '#f5f3ff' } : { color: '#9ca3af' }}
                  onMouseEnter={e => { if (!isSaved) { e.currentTarget.style.background = '#f5f3ff'; e.currentTarget.style.color = '#7c3aed'; }}}
                  onMouseLeave={e => { if (!isSaved) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; }}}
                >
                  {isSaved ? <BookmarkCheck size={16} strokeWidth={2} /> : <Bookmark size={16} strokeWidth={1.8} />}
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>

                {/* Delete */}
                {isOwner && (
                  <button
                    onClick={() => { onDelete(post._id); onClose(); }}
                    className="flex items-center gap-1.5 flex-1 justify-center py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{ color: '#fca5a5' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fca5a5'; }}
                  >
                    <Trash2 size={15} strokeWidth={1.8} />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showShare && <ShareModal post={post} onClose={() => setShowShare(false)} />}
    </>
  );
};

export default PostDetailModal;