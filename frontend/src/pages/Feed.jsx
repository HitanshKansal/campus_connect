import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import NotificationPanel from '../components/NotificationPanel';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import { Search as SearchIcon } from 'lucide-react';

const Feed = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { fetchPosts(); }, [filter]);
  useEffect(() => { fetchUnreadCount(); }, []);

  // ✅ Chatbot — load and show only on feed page

useEffect(() => {
  // Load scripts once
  if (!document.getElementById('botpress-inject')) {
    const script1 = document.createElement('script');
    script1.src = 'https://cdn.botpress.cloud/webchat/v3.6/inject.js';
    script1.async = true;
    script1.id = 'botpress-inject';
    document.body.appendChild(script1);
  }

  if (!document.getElementById('botpress-config')) {
    const script2 = document.createElement('script');
    script2.src = 'https://files.bpcontent.cloud/2026/04/06/12/20260406121236-M0A42I37.js';
    script2.defer = true;
    script2.id = 'botpress-config';
    document.body.appendChild(script2);
  }

  const selectors = [
    '#bp-web-widget-container',
    '#bp-web-widget',
    '.bpw-widget-btn',
    '.bpw-floating-button',
    '[id^="bp-"]',
    '[class^="bpw-"]',
  ];

  const showAll = () => {
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        el.style.cssText = '';
        el.style.setProperty('display', 'block', 'important');
        el.style.setProperty('visibility', 'visible', 'important');
        el.style.setProperty('opacity', '1', 'important');
        el.style.setProperty('pointer-events', 'all', 'important');
      });
    });
  };

  const hideAll = () => {
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        el.style.cssText = 'display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;';
      });
    });
  };

  // Show immediately + watch for widget to load
  showAll();
  const observer = new MutationObserver(() => {
    showAll();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    hideAll();
  };
}, []);


  const fetchUnreadCount = async () => {
    try {
      const { data } = await API.get('/notifications/unread-count');
      setUnreadCount(data.count);
    } catch (err) {
      console.log('Notification count error');
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? `?type=${filter}` : '';
      const { data } = await API.get(`/posts${params}`);
      setPosts(data.posts);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    setShowCreatePost(false);
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await API.put(`/posts/${postId}/like`);
      setPosts(prev => prev.map(post =>
        post._id === postId
          ? {
              ...post,
              likes: data.isLiked
                ? [...post.likes, user.id]
                : post.likes.filter(id => id !== user.id),
            }
          : post
      ));
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await API.delete(`/posts/${postId}`);
      setPosts(prev => prev.filter(post => post._id !== postId));
    } catch (err) {
      console.log(err);
    }
  };

  const filterTabs = [
    { value: 'all', label: 'All', icon: '⚡' },
    { value: 'project', label: 'Projects', icon: '🚀' },
    { value: 'job', label: 'Jobs', icon: '💼' },
    { value: 'review', label: 'Reviews', icon: '⭐' },
  ];

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-gray-100">

      <Sidebar
        unreadCount={unreadCount}
        onNotificationClick={() => {
          setShowNotifications(true);
          setUnreadCount(0);
        }}
        onCreatePost={() => setShowCreatePost(true)}
      />

      <div className="flex-1 w-full sm:ml-64">

        {/* Top spacing for mobile nav */}
        <div className="h-12 sm:hidden" />

        <div className="w-full max-w-3xl mx-auto py-3 sm:py-4 px-2 sm:px-6 pb-24 sm:pb-16">

          {/* 🔍 Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                navigate(`/search?q=${searchQuery.trim()}`);
              }
            }}
            className="mb-4"
          >
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-white rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200">

              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600">
                <SearchIcon size={16} className="text-white" />
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students, posts..."
                className="flex-1 text-sm outline-none bg-transparent"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 text-sm"
                >
                  ✕
                </button>
              )}

              <button
                type="submit"
                className="px-3 sm:px-4 py-1.5 rounded-xl text-white text-xs font-bold whitespace-nowrap bg-gradient-to-r from-purple-600 to-indigo-600"
              >
                Search
              </button>
            </div>
          </form>

          {/* Create Post */}
          {showCreatePost && (
            <CreatePost
              onClose={() => setShowCreatePost(false)}
              onPostCreated={handlePostCreated}
            />
          )}

          {/* 🔥 Filter Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            {filterTabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`flex items-center gap-1 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap ${
                  filter === tab.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-600 border'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* 📄 Posts */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-4 sm:p-5 border">
                  Loading...
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-lg font-bold text-gray-700">No posts yet</h3>
              <button
                onClick={() => setShowCreatePost(true)}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-xl"
              >
                Create Post
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUserId={user.id}
                  onLike={handleLike}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}

      {/* Mobile Bottom Nav */}
      <MobileNav onCreatePost={() => setShowCreatePost(true)} />
    </div>
  );
};

export default Feed;