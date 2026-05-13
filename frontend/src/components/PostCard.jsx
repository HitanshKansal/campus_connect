// frontend/src/components/PostCard.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import CommentsSection from './CommentsSection';
import ShareModal from './ShareModal';
import PostDetailModal from './PostDetailModal';
import { Heart, MessageCircle, Share2, Bookmark, BookmarkCheck, Trash2, X } from 'lucide-react';

const PostCard = ({ post, currentUserId, onLike, onDelete }) => {
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isSaved, setIsSaved] = useState(post.saves?.includes(currentUserId));
  const [savesCount, setSavesCount] = useState(post.saves?.length || 0);
  const [expanded, setExpanded] = useState(false);

  const isLiked = post.likes?.some(id => id === currentUserId || id?._id === currentUserId);
  const isOwner = post.author?._id === currentUserId;

  const typeConfig = {
    project: { label: 'Project', bg: '#ede9fe', color: '#5b21b6' },
    job:     { label: 'Job',     bg: '#dcfce7', color: '#15803d' },
    review:  { label: 'Review',  bg: '#fef9c3', color: '#a16207' },
  };
  const config = typeConfig[post.type] || typeConfig.project;

  const formatDate = (dateString) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const handleSave = async () => {
    try {
      const { data } = await API.put(`/posts/${post._id}/save`);
      setIsSaved(data.isSaved);
      setSavesCount(data.savesCount);
    } catch (err) {
      console.log('Save error:', err.message);
    }
  };

  const CHAR_LIMIT = 180;
  const isLong = post.content?.length > CHAR_LIMIT;
  const displayContent = expanded || !isLong
    ? post.content
    : post.content?.slice(0, CHAR_LIMIT);

  const actionBtn = (active, activeStyle, defaultColor = '#9ca3af') => ({
    base: {
      display: 'flex', alignItems: 'center', gap: '6px',
      padding: '8px 12px', borderRadius: '12px',
      transition: 'all 0.15s ease', flex: 1, justifyContent: 'center',
      fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none',
      background: 'transparent',
    },
    style: active ? activeStyle : { color: defaultColor },
  });

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden transition-all duration-200"
      style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
    >

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 min-w-0">

          {/* Avatar — clickable */}
          <img
            src={post.author?.profilePicture ||
              `https://ui-avatars.com/api/?name=${post.author?.name}&background=7c3aed&color=fff&size=44`}
            className="w-11 h-11 rounded-xl object-cover flex-shrink-0 cursor-pointer transition-opacity hover:opacity-85"
            style={{ border: '2px solid #ede9fe' }}
            alt={post.author?.name}
            onClick={() => navigate(`/profile/${post.author?.username}`)}
          />

          <div className="min-w-0">
            {/* Name — clickable */}
            <button
              onClick={() => navigate(`/profile/${post.author?.username}`)}
              className="font-bold text-sm text-left leading-tight block w-full truncate transition-colors hover:text-violet-600"
              style={{ color: '#111827', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {post.author?.name}
              {post.author?.isIdVerified && (
                <span className="ml-1 text-xs" style={{ color: '#7c3aed' }}>✓</span>
              )}
            </button>
            <p className="text-xs font-medium mt-0.5 truncate" style={{ color: '#9ca3af' }}>
              @{post.author?.username} · {formatDate(post.createdAt)}
            </p>
          </div>
        </div>

        <span
          className="text-xs px-2.5 py-1 rounded-lg font-semibold flex-shrink-0 ml-2"
          style={{ background: config.bg, color: config.color }}
        >
          {config.label}
        </span>
      </div>

      {/* ── Title + Content ── */}
      <div className="px-4 pb-3">
        <h3
          onClick={() => setShowDetail(true)}
          className="font-bold text-gray-900 mb-1.5 cursor-pointer leading-snug transition-colors"
          style={{ fontSize: '15px' }}
          onMouseEnter={e => e.currentTarget.style.color = '#6d28d9'}
          onMouseLeave={e => e.currentTarget.style.color = '#111827'}
        >
          {post.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          {displayContent}
          {isLong && !expanded && (
            <> {'... '}
              <button onClick={() => setExpanded(true)}
                style={{ color: '#7c3aed', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                more
              </button>
            </>
          )}
          {isLong && expanded && (
            <> {' '}
              <button onClick={() => setExpanded(false)}
                style={{ color: '#7c3aed', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                less
              </button>
            </>
          )}
        </p>
      </div>

      {/* ── Media ── */}
      {post.mediaUrl && (
        <div className="w-full cursor-pointer overflow-hidden" onClick={() => setShowDetail(true)}>
          {post.mediaType === 'video' ? (
            <video src={post.mediaUrl} controls className="w-full object-cover bg-black"
              style={{ maxHeight: '360px' }} onClick={e => e.stopPropagation()} />
          ) : (
            <img src={post.mediaUrl} alt="post" className="w-full object-cover"
              style={{ maxHeight: '360px' }} />
          )}
        </div>
      )}

      {/* ── Project Info ── */}
      {post.type === 'project' && (
        <div className="px-4 py-3 space-y-2">
          {post.techStack?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.techStack.map((tech, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                  style={{ background: '#f5f3ff', color: '#5b21b6' }}>
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

      {/* ── Job Info ── */}
      {post.type === 'job' && (
        <div className="px-4 py-3">
          <div className="rounded-xl p-3 space-y-1.5"
            style={{ background: 'linear-gradient(135deg,#f0fdf4,#ecfdf5)', border: '1px solid #bbf7d0' }}>
            {post.companyName && <p className="text-sm font-bold text-gray-800">{post.companyName}</p>}
            {post.jobRole && <p className="text-xs text-gray-600 font-medium">{post.jobRole}</p>}
            {post.jobLocation && <p className="text-xs text-gray-500">{post.jobLocation}</p>}
            {post.applyLink && (
              <a href={post.applyLink} target="_blank" rel="noreferrer"
                className="inline-block mt-1.5 text-white text-xs px-4 py-1.5 rounded-lg font-bold hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg,#059669,#0891b2)' }}>
                Apply Now →
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── Review Info ── */}
      {post.type === 'review' && (
        <div className="px-4 py-2 flex items-center gap-2 flex-wrap">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(star => (
              <span key={star} style={{ color: star <= (post.rating || 0) ? '#f59e0b' : '#e5e7eb', fontSize: '14px' }}>★</span>
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

      {/* ── Tags ── */}
      {post.tags?.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1">
          {post.tags.map((tag, i) => (
            <span key={i} className="text-xs font-medium" style={{ color: '#a78bfa' }}>#{tag}</span>
          ))}
        </div>
      )}

      {/* ── Stats Row ── */}
  
<div className="px-4 py-2 flex items-center gap-3 text-xs font-medium"
  style={{ color: '#9ca3af', borderTop: '1px solid #f9fafb' }}>
  <span>{post.likes?.length || 0} likes</span>
  <span>·</span>
  <button
    onClick={() => setShowComments(!showComments)}
    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '12px', fontWeight: 500 }}
    onMouseEnter={e => e.currentTarget.style.color = '#7c3aed'}
    onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
  >
    {/* ✅ Fixed — commentCount from backend */}
    {post.commentCount || 0} comments
  </button>
  <span>·</span>
  <span>{savesCount} saves</span>
</div>

      {/* ── Action Buttons ── */}
      <div className="flex items-center px-1 py-1.5" style={{ borderTop: '1px solid #f3f4f6' }}>

        {/* Like */}
        <button
          onClick={() => onLike(post._id)}
          className="flex items-center gap-1.5 flex-1 justify-center py-2 px-2 rounded-xl text-xs font-semibold transition-all"
          style={isLiked
            ? { color: '#ef4444', background: '#fef2f2' }
            : { color: '#9ca3af' }
          }
          onMouseEnter={e => { if (!isLiked) { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#ef4444'; }}}
          onMouseLeave={e => { if (!isLiked) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; }}}
        >
          <Heart size={16} fill={isLiked ? '#ef4444' : 'none'} strokeWidth={isLiked ? 0 : 1.8} color={isLiked ? '#ef4444' : '#9ca3af'} />
          <span className="hidden sm:inline">Like</span>
        </button>

        {/* Comment */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 flex-1 justify-center py-2 px-2 rounded-xl text-xs font-semibold transition-all"
          style={showComments
            ? { color: '#7c3aed', background: '#f5f3ff' }
            : { color: '#9ca3af' }
          }
          onMouseEnter={e => { if (!showComments) { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#7c3aed'; }}}
          onMouseLeave={e => { if (!showComments) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; }}}
        >
          <MessageCircle size={16} strokeWidth={1.8} />
          <span className="hidden sm:inline">Comment</span>
        </button>

        {/* Share */}
        <button
          onClick={() => setShowShare(true)}
          className="flex items-center gap-1.5 flex-1 justify-center py-2 px-2 rounded-xl text-xs font-semibold transition-all"
          style={{ color: '#9ca3af' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#374151'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; }}
        >
          <Share2 size={16} strokeWidth={1.8} />
          <span className="hidden sm:inline">Share</span>
        </button>

        {/* Save */}
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 flex-1 justify-center py-2 px-2 rounded-xl text-xs font-semibold transition-all"
          style={isSaved
            ? { color: '#7c3aed', background: '#f5f3ff' }
            : { color: '#9ca3af' }
          }
          onMouseEnter={e => { if (!isSaved) { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#7c3aed'; }}}
          onMouseLeave={e => { if (!isSaved) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; }}}
        >
          {isSaved
            ? <BookmarkCheck size={16} strokeWidth={2} />
            : <Bookmark size={16} strokeWidth={1.8} />
          }
          <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
        </button>

        {/* Delete — owner only */}
        {isOwner && (
          <button
            onClick={() => onDelete(post._id)}
            className="flex items-center gap-1.5 flex-1 justify-center py-2 px-2 rounded-xl text-xs font-semibold transition-all"
            style={{ color: '#fca5a5' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fca5a5'; }}
          >
            <Trash2 size={15} strokeWidth={1.8} />
            <span className="hidden sm:inline">Delete</span>
          </button>
        )}
      </div>

      {showComments && <CommentsSection postId={post._id} currentUserId={currentUserId} />}
      {showShare && <ShareModal post={post} onClose={() => setShowShare(false)} />}
      {showDetail && (
        <PostDetailModal
          post={post}
          currentUserId={currentUserId}
          onClose={() => setShowDetail(false)}
          onLike={onLike}
          onDelete={onDelete}
        />
      )}
    </div>
  );
};

export default PostCard;