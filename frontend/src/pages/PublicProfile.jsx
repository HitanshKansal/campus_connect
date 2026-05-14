// frontend/src/pages/PublicProfile.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import PostDetailModal from '../components/PostDetailModal';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import { MapPin, BookOpen, Calendar, Code, UserPlus, MessageCircle, UserCheck, Clock, ArrowLeft, Grid3X3, Layers } from 'lucide-react';
import useHideChatbot from '../hooks/useHideChatbot';

const PublicProfile = () => {
  useHideChatbot();
  const { username } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('none');
  const [selectedPost, setSelectedPost] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const { data } = await API.get(`/users/${username}`);
      setProfileUser(data.user);
      if (data.connectionStatus.isConnected) setConnectionStatus('connected');
      else if (data.connectionStatus.requestSent) setConnectionStatus('pending');
      else if (data.connectionStatus.requestReceived) setConnectionStatus('received');
      else setConnectionStatus('none');
    } catch (err) {
      if (err.response?.status === 404) navigate('/feed');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const { data } = await API.get(`/posts/user/${username}`);
      setPosts(data.posts || []);
    } catch (err) {
      console.log('Error fetching posts:', err.message);
    }
  };

  const handleConnect = async () => {
    try {
      const { data } = await API.post(`/users/${username}/connect`);
      setConnectionStatus(data.status);
    } catch (err) {
      console.log('Connect error:', err.message);
    }
  };

  const handleAccept = async () => {
    try {
      await API.post(`/users/${username}/accept-connection`);
      setConnectionStatus('connected');
    } catch (err) {
      console.log('Accept error:', err.message);
    }
  };

  const handleReject = async () => {
    try {
      await API.post(`/users/${username}/reject-connection`);
      setConnectionStatus('none');
    } catch (err) {
      console.log('Reject error:', err.message);
    }
  };

  const handleMessage = async () => {
    try {
      await API.post('/chats/personal', { userId: profileUser._id });
      navigate('/chat');
    } catch (err) {
      console.log('Message error:', err.message);
    }
  };

  const skillColors = [
    { bg: '#fff1f2', text: '#be123c', border: '#fecdd3' },
    { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
    { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
    { bg: '#fdf4ff', text: '#7e22ce', border: '#f5d0fe' },
    { bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' },
    { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
  ];

  const typeConfig = {
    project: { emoji: '🚀', bg: '#faf5ff', text: '#6d28d9' },
    job:     { emoji: '💼', bg: '#f0fdf4', text: '#15803d' },
    review:  { emoji: '⭐', bg: '#fffbeb', text: '#b45309' },
  };

  const getConnectButton = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <button className="pp-btn pp-btn-connected">
            <UserCheck size={15} /> Connected
          </button>
        );
      case 'pending':
        return (
          <button onClick={handleConnect} className="pp-btn pp-btn-pending">
            <Clock size={15} /> Requested
          </button>
        );
      case 'received':
        return (
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={handleAccept} className="pp-btn pp-btn-primary">
              <UserCheck size={15} /> Accept
            </button>
            <button onClick={handleReject} className="pp-btn pp-btn-danger">
              Decline
            </button>
          </div>
        );
      default:
        return (
          <button onClick={handleConnect} className="pp-btn pp-btn-primary">
            <UserPlus size={15} /> Connect
          </button>
        );
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', background:'#f4f2ee' }}>
        <Sidebar onCreatePost={() => {}} />
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }} className="sm:ml-64">
          <div style={{ width:'100%', maxWidth:660, padding:'0 16px', display:'flex', flexDirection:'column', gap:12 }}>
            {[180, 320, 280].map((h,i) => (
              <div key={i} style={{ height:h, borderRadius:24, background:'linear-gradient(90deg,#e8e4de 0%,#ddd9d2 50%,#e8e4de 100%)', backgroundSize:'200% 100%', animation:'ppShimmer 1.4s infinite linear' }} />
            ))}
          </div>
        </div>
        <style>{`@keyframes ppShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
      </div>
    );
  }

  const isOwnProfile = profileUser?.username === currentUser.username;

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'#f4f2ee' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');

        @keyframes ppIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ppShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes avaIn { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }

        .pp * { box-sizing:border-box; font-family:'Sora',sans-serif; }

        .pp-main { flex:1; }
        @media(min-width:640px){ .pp-main{ margin-left:256px; } }

        /* TOP BAR */
        .pp-bar {
          position:sticky; top:0; z-index:40;
          background:rgba(244,242,238,0.92);
          backdrop-filter:blur(20px);
          -webkit-backdrop-filter:blur(20px);
          border-bottom:1px solid rgba(0,0,0,0.06);
          padding:12px 20px;
          display:flex; align-items:center; gap:14px;
        }
        .pp-back {
          width:36px; height:36px; border-radius:12px;
          border:1px solid rgba(0,0,0,0.1);
          background:white; color:#374151;
          cursor:pointer; display:flex; align-items:center; justify-content:center;
          transition:all 0.15s; flex-shrink:0;
          box-shadow:0 1px 4px rgba(0,0,0,0.06);
        }
        .pp-back:hover { background:#f3f0eb; box-shadow:0 2px 8px rgba(0,0,0,0.1); }

        .pp-wrap {
          max-width:660px; margin:0 auto;
          padding:0 14px 100px;
          animation:ppIn 0.35s cubic-bezier(0.22,1,0.36,1);
        }

        /* COVER */
        .pp-cover {
          height:168px;
          border-radius:0 0 28px 28px;
          background:#0f0e0d;
          position:relative; overflow:hidden;
        }
        .pp-cover-noise {
          position:absolute; inset:0; opacity:0.04;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size:128px;
        }
        .pp-cover-aurora {
          position:absolute; inset:0;
          background:
            radial-gradient(ellipse 80% 90% at 10% 70%, rgba(251,191,36,0.28) 0%, transparent 55%),
            radial-gradient(ellipse 60% 80% at 88% 20%, rgba(244,114,182,0.22) 0%, transparent 55%),
            radial-gradient(ellipse 50% 70% at 60% 110%, rgba(52,211,153,0.18) 0%, transparent 55%),
            radial-gradient(ellipse 35% 50% at 40% -10%, rgba(99,102,241,0.15) 0%, transparent 55%);
        }
        .pp-cover-lines {
          position:absolute; inset:0; opacity:0.035;
          background-image:repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(255,255,255,1) 32px);
        }

        /* AVATAR */
        .pp-ava-wrap {
          position:absolute; bottom:-46px; left:20px;
          animation:avaIn 0.4s cubic-bezier(0.22,1,0.36,1) 0.1s both;
        }
        .pp-ava-ring {
          width:90px; height:90px; border-radius:24px;
          border:4px solid #f4f2ee;
          overflow:hidden;
          box-shadow:0 8px 28px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.5);
        }
        .pp-ava-ring img { width:100%; height:100%; object-fit:cover; display:block; }

        .pp-verified {
          position:absolute; bottom:-50px; left:82px;
          width:22px; height:22px; border-radius:50%;
          background:linear-gradient(135deg,#22c55e,#16a34a);
          border:3px solid #f4f2ee;
          display:flex; align-items:center; justify-content:center;
          font-size:9px; color:white; font-weight:800;
          box-shadow:0 2px 6px rgba(34,197,94,0.4);
        }

        .pp-actions {
          position:absolute; bottom:-30px; right:0;
          display:flex; gap:8px; align-items:center;
        }

        /* BUTTONS */
        .pp-btn {
          display:flex; align-items:center; gap:6px;
          padding:10px 18px; border-radius:14px;
          font-size:13px; font-weight:600;
          cursor:pointer; font-family:'Sora',sans-serif;
          transition:all 0.18s; white-space:nowrap;
          letter-spacing:-0.01em;
        }
        .pp-btn-primary {
          border:none;
          background:linear-gradient(135deg,#1a1a1a,#0f0f0f);
          color:white;
          box-shadow:0 3px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .pp-btn-primary:hover { transform:translateY(-1px); box-shadow:0 5px 16px rgba(0,0,0,0.3); }
        .pp-btn-connected {
          border:1.5px solid #bbf7d0;
          background:linear-gradient(135deg,#f0fdf4,#dcfce7);
          color:#15803d;
        }
        .pp-btn-pending {
          border:1.5px solid #e5e7eb;
          background:#f9fafb;
          color:#9ca3af;
        }
        .pp-btn-danger {
          border:1.5px solid #fecdd3;
          background:#fff1f2;
          color:#be123c;
          padding:10px 14px;
        }
        .pp-btn-msg {
          width:40px; height:40px; border-radius:14px;
          border:1.5px solid rgba(0,0,0,0.1);
          background:white;
          color:#374151;
          cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          transition:all 0.15s;
          box-shadow:0 1px 4px rgba(0,0,0,0.06);
        }
        .pp-btn-msg:hover { background:#f3f0eb; box-shadow:0 2px 8px rgba(0,0,0,0.1); }

        /* CARDS */
        .pp-card {
          background:white;
          border-radius:24px;
          border:1px solid rgba(0,0,0,0.07);
          margin-top:12px;
          overflow:hidden;
          box-shadow:0 2px 12px rgba(0,0,0,0.04);
        }

        /* IDENTITY SECTION */
        .pp-identity {
          padding:56px 22px 22px;
        }
        .pp-name {
          font-family:'Instrument Serif', serif;
          font-size:26px; font-weight:400;
          color:#0f0e0d; line-height:1.2;
          letter-spacing:-0.02em;
        }
        .pp-handle {
          font-size:13px; color:#a3a09a;
          margin-top:4px; font-weight:400;
          letter-spacing:0.01em;
        }
        .pp-bio {
          font-size:14px; color:#6b6560;
          line-height:1.7; margin-top:12px;
          font-weight:400;
        }

        /* COLLEGE BAND */
        .pp-college-band {
          margin:18px 22px 0;
          padding:14px 16px;
          border-radius:16px;
          background:linear-gradient(135deg,#f5f3ff 0%,#ede9fe 100%);
          border:1px solid #ddd6fe;
          display:flex; flex-wrap:wrap;
          align-items:center; gap:8px;
        }
        .pp-college-name-row {
          display:flex; align-items:center; gap:10px;
          width:100%;
        }
        .pp-college-icon {
          width:32px; height:32px; border-radius:10px;
          background:linear-gradient(135deg,#7c3aed,#4f46e5);
          display:flex; align-items:center; justify-content:center;
          font-size:15px; flex-shrink:0;
          box-shadow:0 3px 8px rgba(124,58,237,0.3);
        }
        .pp-college-text {
          font-size:14px; font-weight:600; color:#1e1b4b;
          letter-spacing:-0.01em;
        }
        .pp-college-pills { display:flex; flex-wrap:wrap; gap:6px; }
        .pp-college-pill {
          display:flex; align-items:center; gap:5px;
          padding:5px 11px; border-radius:10px;
          font-size:12px; font-weight:500;
        }

        /* DIVIDER */
        .pp-sep { height:1px; background:rgba(0,0,0,0.06); margin:18px 22px; }

        /* SKILLS */
        .pp-skills-section { padding:0 22px 22px; }
        .pp-section-label {
          font-size:10px; font-weight:700;
          letter-spacing:0.12em; text-transform:uppercase;
          color:#b0ada7; margin-bottom:12px;
        }
        .pp-chips { display:flex; flex-wrap:wrap; gap:7px; }
        .pp-chip {
          padding:6px 13px; border-radius:10px;
          font-size:12px; font-weight:600;
          border:1px solid;
          letter-spacing:0.01em;
          transition:transform 0.15s;
        }
        .pp-chip:hover { transform:translateY(-1px); }

        /* POSTS HEADER */
        .pp-posts-header {
          padding:18px 22px 16px;
          display:flex; align-items:center; justify-content:space-between;
          border-bottom:1px solid rgba(0,0,0,0.06);
        }
        .pp-posts-title {
          font-family:'Instrument Serif', serif;
          font-size:20px; color:#0f0e0d; font-weight:400;
          letter-spacing:-0.02em;
        }
        .pp-posts-count {
          font-size:12px; font-weight:700;
          padding:4px 10px; border-radius:20px;
          background:#f4f2ee;
          color:#6b6560;
          letter-spacing:0.02em;
        }

        /* POSTS GRID */
        .pp-grid {
          display:grid; grid-template-columns:repeat(3,1fr);
          gap:4px; padding:4px;
        }
        .pp-gi {
          aspect-ratio:1; border-radius:16px; overflow:hidden;
          cursor:pointer; position:relative;
          transition:transform 0.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s;
          border:1px solid rgba(0,0,0,0.05);
        }
        .pp-gi:hover { transform:scale(1.03); box-shadow:0 10px 30px rgba(0,0,0,0.15); }
        .pp-gi img, .pp-gi video { width:100%; height:100%; object-fit:cover; display:block; }
        .pp-gp {
          width:100%; height:100%;
          display:flex; flex-direction:column;
          align-items:center; justify-content:center; padding:12px;
        }
        .pp-go {
          position:absolute; inset:0;
          background:rgba(15,14,13,0.55);
          display:flex; align-items:center; justify-content:center;
          opacity:0; transition:opacity 0.2s;
          border-radius:16px;
        }
        .pp-gi:hover .pp-go { opacity:1; }
        .pp-go span { font-size:13px; font-weight:700; color:white; letter-spacing:0.02em; }

        /* EMPTY STATE */
        .pp-empty {
          text-align:center; padding:52px 20px;
        }
        .pp-empty-icon {
          width:56px; height:56px; border-radius:18px;
          background:#f4f2ee; border:1px solid rgba(0,0,0,0.07);
          display:flex; align-items:center; justify-content:center;
          font-size:24px; margin:0 auto 12px;
        }
        .pp-empty-text { font-size:14px; color:#a3a09a; font-weight:500; }
      `}</style>

      <Sidebar onCreatePost={() => {}} />

      <div className="pp pp-main">
        <div style={{ height:56 }} className="sm:hidden" />

        {/* TOP BAR */}
        <div className="pp-bar">
          <button onClick={() => navigate(-1)} className="pp-back">
            <ArrowLeft size={17} />
          </button>
          <div>
            <p style={{ fontSize:14, fontWeight:600, color:'#0f0e0d', letterSpacing:'-0.01em' }}>@{username}</p>
            <p style={{ fontSize:12, color:'#a3a09a', marginTop:1 }}>{posts.length} {posts.length === 1 ? 'post' : 'posts'}</p>
          </div>
        </div>

        <div className="pp-wrap">

          {/* COVER + AVATAR */}
          <div style={{ position:'relative', marginBottom:0 }}>
            <div className="pp-cover">
              <div className="pp-cover-aurora" />
              <div className="pp-cover-lines" />
              <div className="pp-cover-noise" />
            </div>

            <div className="pp-ava-wrap">
              <div className="pp-ava-ring">
                <img
                  src={profileUser?.profilePicture ||
                    `https://ui-avatars.com/api/?name=${profileUser?.name}&background=1c1917&color=fff&size=200`}
                  alt={profileUser?.name}
                />
              </div>
            </div>
            {profileUser?.isVerified && <div className="pp-verified">✓</div>}

            <div className="pp-actions">
              {!isOwnProfile && (
                <>
                  {getConnectButton()}
                  <button onClick={handleMessage} className="pp-btn-msg">
                    <MessageCircle size={17} />
                  </button>
                </>
              )}
              {isOwnProfile && (
                <button
                  onClick={() => navigate('/profile')}
                  className="pp-btn pp-btn-pending"
                  style={{ border:'1.5px solid rgba(0,0,0,0.1)', background:'white', color:'#374151' }}
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* MAIN PROFILE CARD */}
          <div className="pp-card">
            {/* Identity */}
            <div className="pp-identity">
              <p className="pp-name">{profileUser?.name}</p>
              <p className="pp-handle">@{profileUser?.username}</p>
              {profileUser?.bio && <p className="pp-bio">{profileUser.bio}</p>}
            </div>

            {/* College Band */}
            {(profileUser?.collegeName || profileUser?.department || profileUser?.session) && (
              <div className="pp-college-band">
                {profileUser?.collegeName && (
                  <div className="pp-college-name-row">
                  
                    <p className="pp-college-text">{profileUser.collegeName}</p>
                  </div>
                )}
                <div className="pp-college-pills">
                  {profileUser?.department && (
                    <div
                      className="pp-college-pill"
                      style={{ background:'#eff6ff', color:'#1d4ed8', border:'1px solid #bfdbfe' }}
                    >
                      <BookOpen size={11} />
                      {profileUser.department}
                    </div>
                  )}
                  {profileUser?.session && (
                    <div
                      className="pp-college-pill"
                      style={{ background:'#f0fdf4', color:'#15803d', border:'1px solid #bbf7d0' }}
                    >
                      <Calendar size={11} />
                      Batch {profileUser.session}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Skills */}
            {profileUser?.skills?.length > 0 && (
              <>
                <div className="pp-sep" />
                <div className="pp-skills-section">
                  <p className="pp-section-label">Skills</p>
                  <div className="pp-chips">
                    {profileUser.skills.map((skill, i) => {
                      const c = skillColors[i % skillColors.length];
                      return (
                        <span
                          key={i}
                          className="pp-chip"
                          style={{ background:c.bg, color:c.text, borderColor:c.border }}
                        >
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* POSTS CARD */}
          <div className="pp-card" style={{ marginBottom:0 }}>
            <div className="pp-posts-header">
              <p className="pp-posts-title">Posts</p>
              <span className="pp-posts-count">{posts.length}</span>
            </div>

            {posts.length === 0 ? (
              <div className="pp-empty">
                <div className="pp-empty-icon">📭</div>
                <p className="pp-empty-text">No posts yet</p>
              </div>
            ) : (
              <div className="pp-grid">
                {posts.map(post => {
                  const config = typeConfig[post.type] || typeConfig.project;
                  return (
                    <div
                      key={post._id}
                      onClick={() => setSelectedPost(post)}
                      className="pp-gi"
                      style={{ background:config.bg }}
                    >
                      {post.mediaUrl ? (
                        post.mediaType === 'video'
                          ? <video src={post.mediaUrl} />
                          : <img src={post.mediaUrl} alt="post" />
                      ) : (
                        <div className="pp-gp">
                          <span style={{ fontSize:28 }}>{config.emoji}</span>
                          <p style={{ fontSize:11, color:config.text, textAlign:'center', marginTop:6, fontWeight:600, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', letterSpacing:'-0.01em' }}>
                            {post.title}
                          </p>
                        </div>
                      )}
                      <div className="pp-go"><span>❤️ {post.likes?.length || 0}</span></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      <MobileNav onCreatePost={() => {}} />

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          currentUserId={currentUser.id}
          onClose={() => setSelectedPost(null)}
          onLike={() => {}}
          onDelete={() => {}}
        />
      )}
    </div>
  );
};

export default PublicProfile;