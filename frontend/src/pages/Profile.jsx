// frontend/src/pages/Profile.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api/axios';
import PostDetailModal from '../components/PostDetailModal';
import CreatePost from '../components/CreatePost';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import ImageCropper from '../components/ImageCropper';
import EditProfileModal from '../components/EditProfileModal';
import useHideChatbot from '../hooks/useHideChatbot';

import {
  Camera, Edit3, MapPin, BookOpen, Code,
  Calendar, Award, Grid, Bookmark, Settings, PlusSquare
} from 'lucide-react';

const Profile = () => {
  useHideChatbot();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [savedPosts, setSavedPosts] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false); 
  const [showEditModal, setShowEditModal] = useState(false);

  // Profile picture crop states
  const [showProfileCropper, setShowProfileCropper] = useState(false);
  const [rawProfileImage, setRawProfileImage] = useState(null);
  const [rawProfileFileName, setRawProfileFileName] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    college: '',
    department: '',
    skills: '',
    session: '',
  });

  useEffect(() => {
    fetchProfile();
    fetchMyPosts();
    if (location.state?.justVerified) {
      setMessage('🎉 Profile updated!');
    }
  }, []);

  const handleProfileSaved = (updatedUser) => {
  setUser(updatedUser);
  setMessage('✅ Profile updated successfully!');
};

  const fetchProfile = async () => {
    try {
      const { data } = await API.get('/users/profile');
      setUser(data.user);
      setFormData({
        name: data.user.name || '',
        username: data.user.username || '',
        bio: data.user.bio || '',
        college: data.user.college || '',
        department: data.user.department || '',
        skills: data.user.skills?.join(', ') || '',
        session: data.user.session || '',
      });
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPosts = async () => {
    try {
      setPostsLoading(true);
      const { data } = await API.get('/posts/my-posts');
      setMyPosts(data.posts || []);
    } catch (err) {
      console.log('Error fetching posts:', err.message);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchSavedPosts = async () => {
    setSavedLoading(true);
    try {
      const { data } = await API.get('/posts/saved');
      setSavedPosts(data.posts);
    } catch (err) {
      console.log('Error fetching saved posts');
    } finally {
      setSavedLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const { data } = await API.put('/users/profile', formData);
      setUser(data.user);
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...stored,
        name: data.user.name,
        username: data.user.username,
      }));
      setMessage('✅ Profile updated successfully!');
      setActiveTab('posts');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  // Profile picture select — open cropper
  const handleProfilePictureSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setRawProfileFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setRawProfileImage(reader.result);
      setShowProfileCropper(true);
    };
    reader.readAsDataURL(file);
  };

  // After crop done — upload
  const handleProfileCropDone = async (croppedFile) => {
    setShowProfileCropper(false);
    setRawProfileImage(null);

    const formDataUpload = new FormData();
    formDataUpload.append('profilePicture', croppedFile);

    try {
      const { data } = await API.post('/users/upload-profile-picture', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser(prev => ({ ...prev, profilePicture: data.profilePicture }));

      // Update sidebar avatar
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...stored,
        profilePicture: data.profilePicture,
      }));

      setMessage('✅ Profile photo updated!');
    } catch (err) {
      setError('Failed to upload picture');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await API.delete(`/posts/${postId}`);
      setMyPosts(prev => prev.filter(p => p._id !== postId));
      setSelectedPost(null);
    } catch (err) {
      console.log('Delete error:', err.message);
    }
  };

  const typeConfig = {
    project: { emoji: '🚀', bg: '#f5f3ff' },
    job: { emoji: '💼', bg: '#f0fdf4' },
    review: { emoji: '⭐', bg: '#fefce8' },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex" style={{ background: '#f1f5f9' }}>
        <Sidebar onCreatePost={() => {}} />
        <div className="flex-1 sm:ml-64 flex items-center justify-center">
          <div className="space-y-4 w-full max-w-2xl px-4">
            <div className="h-48 shimmer rounded-3xl" />
            <div className="h-24 shimmer rounded-2xl" />
            <div className="h-64 shimmer rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#f1f5f9' }}>


      <Sidebar onCreatePost={() => setShowCreatePost(true)} />

      <div className="flex-1 sm:ml-64">
        <div className="h-14 sm:hidden" />

        {/* Messages */}
        {message && (
          <div
            className="mx-4 mt-4 px-4 py-3 rounded-2xl text-sm font-medium animate-fadeIn"
            style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}
          >
            {message}
          </div>
        )}
        {error && (
          <div
            className="mx-4 mt-4 px-4 py-3 rounded-2xl text-sm font-medium"
            style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}
          >
            {error}
          </div>
        )}

        <div className="max-w-3xl mx-auto pb-24 sm:pb-8">

          {/* ── Cover + Header ── */}
          <div className="relative mb-4">

            {/* Cover Banner */}
            <div
              className="h-40 sm:h-52 w-full rounded-b-3xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 70%, #6d28d9 100%)',
              }}
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20"
                style={{ background: 'rgba(167,139,250,0.4)' }} />
              <div className="absolute top-5 right-20 w-20 h-20 rounded-full opacity-15"
                style={{ background: 'rgba(196,181,253,0.5)' }} />
              <div className="absolute -bottom-5 left-20 w-32 h-32 rounded-full opacity-10"
                style={{ background: 'rgba(139,92,246,0.6)' }} />
              <div className="absolute top-3 right-3">
                <div
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                  style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}
                >
                  ✨ Campus Connect
                </div>
              </div>
            </div>

            {/* Profile Picture */}
            <div className="absolute left-6 -bottom-16">
              <div className="relative">
                <div
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden shadow-2xl"
                  style={{ border: '4px solid white' }}
                >
                  <img
                    src={user?.profilePicture ||
                      `https://ui-avatars.com/api/?name=${user?.name}&background=7c3aed&color=fff&size=200`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <label
                  className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer shadow-lg transition-transform hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                >
                  <Camera size={16} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Create Post + Edit Profile Buttons */}
            <div className="absolute right-4 -bottom-5 flex gap-2">
                <button onClick={() => setShowCreatePost(true)}            
                
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all hover:opacity-90 shadow-md"
                style={{ background: 'white', color: '#7c3aed', border: '1px solid #e5e7eb' }}
              >
                <PlusSquare size={15} />
                <span className="hidden sm:inline">Create Post</span>
              </button>
<button
  onClick={() => setShowEditModal(true)}  // ✅ changed from setActiveTab('edit')
  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all hover:opacity-90 shadow-md"
  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white' }}
>
  <Edit3 size={15} />
  <span className="hidden sm:inline">Edit Profile</span>
</button>
            </div>
          </div>

          {/* ── User Info Card ── */}
          <div
            className="bg-white mx-4 rounded-3xl shadow-sm px-6 pt-20 pb-6 mb-4"
            style={{ border: '1px solid #e5e7eb' }}
          >
            {/* Name + Username */}
            <div className="mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-gray-900">{user?.name}</h1>
                {user?.isVerified && (
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: '#ecfdf5', color: '#065f46' }}
                  >
                    ✅ Verified
                  </span>
                )}
              </div>
              <p className="font-bold mt-0.5" style={{ color: '#7c3aed' }}>
                @{user?.username}
              </p>
              {user?.bio && (
                <p className="text-gray-600 text-sm mt-2 leading-relaxed max-w-lg">
                  {user.bio}
                </p>
              )}
            </div>

            {/* Info Pills */}
            {/* Info Pills — find this section in Profile.jsx and add collegeName pill */}
<div className="flex flex-wrap gap-2 mb-5">

  {/* ✅ ADD THIS — College name pill */}
  {user?.collegeName && (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium"
      style={{ background: '#ede9fe', color: '#5b21b6' }}
    >
      🎓 {user.collegeName}
    </div>
  )}

  {/* Existing department pill */}
  {user?.department && (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium"
      style={{ background: '#eff6ff', color: '#1d4ed8' }}
    >
      <BookOpen size={13} />
      {user.department}
    </div>
  )}

  {/* Existing session pill */}
  {user?.session && (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium"
      style={{ background: '#f0fdf4', color: '#15803d' }}
    >
      <Calendar size={13} />
      Batch {user.session}
    </div>
  )}
</div>

            {/* Skills */}
            {user?.skills?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Code size={14} style={{ color: '#7c3aed' }} />
                  <p className="text-xs font-black text-gray-500 uppercase tracking-wider">
                    Skills
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105 cursor-default"
                      style={{
                        background: `hsl(${(i * 47) % 360}, 70%, 95%)`,
                        color: `hsl(${(i * 47) % 360}, 60%, 35%)`,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Tabs ── */}
          <div className="mx-4 mb-4">
            <div
              className="flex bg-white rounded-2xl shadow-sm overflow-hidden"
              style={{ border: '1px solid #e5e7eb' }}
            >
              {[
                { key: 'posts', label: 'Posts', icon: <Grid size={15} /> },
                { key: 'saved', label: 'Saved', icon: <Bookmark size={15} /> },
                { key: 'edit', label: 'Edit Profile', icon: <Settings size={15} /> },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    if (tab.key === 'saved') fetchSavedPosts();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-all"
                  style={activeTab === tab.key ? {
                    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                    color: 'white',
                  } : {
                    color: '#9ca3af',
                    background: 'white',
                  }}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── TAB: My Posts ── */}
          {activeTab === 'posts' && (
            <div className="mx-4">
              {postsLoading ? (
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="aspect-square shimmer rounded-2xl" />
                  ))}
                </div>
              ) : myPosts.length === 0 ? (
                <div
                  className="bg-white rounded-3xl p-12 text-center shadow-sm"
                  style={{ border: '1px solid #e5e7eb' }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
                    style={{ background: '#f5f3ff' }}
                  >
                    📭
                  </div>
                  <h3 className="font-black text-gray-800 mb-2">No posts yet</h3>
                  <p className="text-gray-400 text-sm mb-5">
                    Share your first post with the campus!
                  </p>
                  <button
  onClick={() => setShowCreatePost(true)}
  className="px-6 py-2.5 rounded-xl text-white font-bold text-sm"
  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
>
  Create Post ✨
</button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {myPosts.map(post => {
                    const config = typeConfig[post.type] || typeConfig.project;
                    return (
                      <div
                        key={post._id}
                        onClick={() => setSelectedPost(post)}
                        className="aspect-square rounded-2xl overflow-hidden cursor-pointer relative group"
                        style={{ background: config.bg }}
                      >
                        {post.mediaUrl ? (
                          post.mediaType === 'video' ? (
                            <video
                              src={post.mediaUrl}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={post.mediaUrl}
                              alt="post"
                              className="w-full h-full object-cover"
                            />
                          )
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-3">
                            <span className="text-3xl mb-1">{config.emoji}</span>
                            <p className="text-xs font-semibold text-center text-gray-600 line-clamp-2 px-1">
                              {post.title}
                            </p>
                          </div>
                        )}
                        {/* Hover overlay */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                          style={{ background: 'rgba(124,58,237,0.75)' }}
                        >
                          <div className="text-center text-white">
                            <p className="text-lg font-black">❤️ {post.likes?.length || 0}</p>
                            <p className="text-xs mt-1 font-semibold">View Post</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Saved Posts ── */}
          {activeTab === 'saved' && (
            <div className="mx-4 space-y-3">
              {savedLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 shimmer rounded-2xl" />
                  ))}
                </div>
              ) : savedPosts.length === 0 ? (
                <div
                  className="bg-white rounded-3xl p-12 text-center shadow-sm"
                  style={{ border: '1px solid #e5e7eb' }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
                    style={{ background: '#f5f3ff' }}
                  >
                    📌
                  </div>
                  <h3 className="font-black text-gray-800 mb-1">Nothing saved yet</h3>
                  <p className="text-gray-400 text-sm">Posts you save will appear here</p>
                </div>
              ) : (
                savedPosts.map(post => {
                  const config = typeConfig[post.type] || typeConfig.project;
                  return (
                    <div
                      key={post._id}
                      onClick={() => setSelectedPost(post)}
                      className="bg-white rounded-2xl p-4 flex gap-4 cursor-pointer transition-all hover:shadow-md"
                      style={{ border: '1px solid #e5e7eb' }}
                    >
                      <div
                        className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
                        style={{ background: config.bg }}
                      >
                        {post.mediaUrl && post.mediaType === 'image' ? (
                          <img
                            src={post.mediaUrl}
                            alt="post"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            {config.emoji}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">
                          {post.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {post.content}
                        </p>
                        <p
                          className="text-xs font-semibold mt-1"
                          style={{ color: '#7c3aed' }}
                        >
                          @{post.author?.username}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── TAB: Edit Profile ── */}
          {activeTab === 'edit' && (
            <div className="mx-4">
              <div
                className="bg-white rounded-3xl shadow-sm px-6 py-6"
                style={{ border: '1px solid #e5e7eb' }}
              >
                <h3 className="font-black text-gray-900 text-lg mb-6 flex items-center gap-2">
                  <Settings size={18} style={{ color: '#7c3aed' }} />
                  Edit Profile
                </h3>

                <form onSubmit={handleSave} className="space-y-4">

                  {/* Name + Username */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className="w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all outline-none"
                        style={{ background: '#f9fafb', border: '2px solid #e5e7eb' }}
                        onFocus={e => e.target.style.borderColor = '#7c3aed'}
                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                        Username
                      </label>
                      <div className="relative">
                        <span
                          className="absolute left-3 top-2.5 text-sm font-bold"
                          style={{ color: '#7c3aed' }}
                        >
                          @
                        </span>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          placeholder="username"
                          className="w-full pl-7 pr-4 py-2.5 rounded-xl text-sm font-medium transition-all outline-none"
                          style={{ background: '#f9fafb', border: '2px solid #e5e7eb' }}
                          onFocus={e => e.target.style.borderColor = '#7c3aed'}
                          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell your campus story..."
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all outline-none resize-none"
                      style={{ background: '#f9fafb', border: '2px solid #e5e7eb' }}
                      onFocus={e => e.target.style.borderColor = '#7c3aed'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  {/* College + Department */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   
<div>
  <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
    College
  </label>
  <div
    className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm"
    style={{
      background: '#f5f3ff',
      border: '2px solid #ede9fe',
      color: '#5b21b6',
    }}
  >
    <span>🎓</span>
    <span className="font-semibold flex-1">{user?.collegeName || 'Not set'}</span>
    <span
      className="text-xs px-2 py-0.5 rounded-full font-bold"
      style={{ background: '#ede9fe', color: '#7c3aed' }}
    >
      Auto-filled
    </span>
  </div>
  <p className="text-xs text-gray-400 mt-1 ml-1">
    Set automatically from your college email
  </p>
</div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                        Department
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="e.g. MCA, B.Tech CSE"
                        className="w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all outline-none"
                        style={{ background: '#f9fafb', border: '2px solid #e5e7eb' }}
                        onFocus={e => e.target.style.borderColor = '#7c3aed'}
                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </div>
                  </div>

                  {/* Session + Skills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                        Session / Batch Year
                      </label>
                      <input
                        type="text"
                        name="session"
                        value={formData.session}
                        onChange={handleChange}
                        placeholder="e.g. 2024-2026"
                        className="w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all outline-none"
                        style={{ background: '#f9fafb', border: '2px solid #e5e7eb' }}
                        onFocus={e => e.target.style.borderColor = '#7c3aed'}
                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                        Skills
                        <span className="normal-case font-normal ml-1 text-gray-400">
                          (comma separated)
                        </span>
                      </label>
                      <input
                        type="text"
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        placeholder="React, Node.js, Python"
                        className="w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all outline-none"
                        style={{ background: '#f9fafb', border: '2px solid #e5e7eb' }}
                        onFocus={e => e.target.style.borderColor = '#7c3aed'}
                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </div>
                  </div>

                  {/* Skills Preview */}
                  {formData.skills && (
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.split(',').map((s, i) =>
                        s.trim() ? (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-xl text-xs font-bold"
                            style={{
                              background: `hsl(${(i * 47) % 360}, 70%, 95%)`,
                              color: `hsl(${(i * 47) % 360}, 60%, 35%)`,
                            }}
                          >
                            {s.trim()}
                          </span>
                        ) : null
                      )}
                    </div>
                  )}

                  {/* Save Button */}
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3.5 rounded-2xl text-white font-black text-base transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                  >
                    {saving ? 'Saving...' : 'Save Changes ✨'}
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* <MobileNav onCreatePost={() => navigate('/feed')} /> */}
      <MobileNav onCreatePost={() => setShowCreatePost(true)} />

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          currentUserId={user?.id || user?._id}
          onClose={() => setSelectedPost(null)}
          onLike={() => {}}
          onDelete={handleDeletePost}
        />
      )}

      {showCreatePost && (
  <CreatePost
    onClose={() => setShowCreatePost(false)}
    onPostCreated={(newPost) => {
      setMyPosts(prev => [newPost, ...prev]);
      setShowCreatePost(false);
    }}
  />
)}

      {/* Profile Picture Cropper */}
      {showProfileCropper && rawProfileImage && (
        <ImageCropper
          imageSrc={rawProfileImage}
          fileName={rawProfileFileName}
          onCropDone={handleProfileCropDone}
          onCancel={() => {
            setShowProfileCropper(false);
            setRawProfileImage(null);
          }}
        />
      )}

      {/* Edit Profile Modal */}
{showEditModal && (
  <EditProfileModal
    user={user}
    onClose={() => setShowEditModal(false)}
    onSaved={handleProfileSaved}
  />
)}
    </div>

    
  );
};

export default Profile;