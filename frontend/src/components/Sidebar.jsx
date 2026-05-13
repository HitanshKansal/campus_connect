// frontend/src/components/Sidebar.jsx

import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Search, MessageCircle, Bell,
  Lightbulb, LogOut, PlusSquare
} from 'lucide-react';

const Sidebar = ({ unreadCount = 0, onNotificationClick, onCreatePost }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const navItems = [
    { icon: Home, label: 'Home', path: '/feed' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: PlusSquare, label: 'Create', action: onCreatePost},
    { icon: MessageCircle, label: 'Messages', path: '/chat' },
    { icon: Lightbulb, label: 'Q&A', path: '/questions' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden sm:flex flex-col fixed left-0 top-0 h-screen w-64 z-50 py-6 px-4"
        style={{
          background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
          borderRight: '1px solid rgba(139,92,246,0.2)',
        }}
      >
        {/* Logo */}
        <div
  className="flex items-center gap-3 px-2 mb-10 cursor-pointer group"
  onClick={() => navigate('/feed')}
>
  <div
    className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform"
    style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
  >
    <img src="/logo.svg" alt="logo" className="w-6 h-6" />
  </div>
  <div className="leading-tight">
    <span className="text-white font-black text-xl tracking-tight block">Campus</span>
    <span className="font-black text-xl tracking-tight block" style={{ color: '#a78bfa' }}>Connect</span>
  </div>
</div>

        {/* Nav Items */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.path ? isActive(item.path) : false;

            return (
              <button
                key={item.label}
                onClick={item.action || (() => navigate(item.path))}
                className="flex items-center gap-3 px-3 py-3 rounded-2xl transition-all text-left"
                style={{
                  background: active ? 'rgba(139,92,246,0.25)' : 'transparent',
                  color: active ? '#c4b5fd' : '#9ca3af',
                  border: active ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.color = '#e2e8f0';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#9ca3af';
                  }
                }}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span className="font-semibold text-sm">{item.label}</span>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#a78bfa' }} />
                )}
              </button>
            );
          })}

          {/* Notifications */}
          <button
            onClick={onNotificationClick}
            className="flex items-center gap-3 px-3 py-3 rounded-2xl transition-all"
            style={{ color: '#9ca3af' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.color = '#e2e8f0';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#9ca3af';
            }}
          >
            <div className="relative">
              <Bell size={20} strokeWidth={1.8} />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold"
                  style={{ background: '#ef4444', fontSize: '10px' }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <span className="font-semibold text-sm">Notifications</span>
          </button>
        </nav>

        {/* Divider */}
        <div className="h-px my-4" style={{ background: 'rgba(139,92,246,0.2)' }} />

        {/* Profile Card */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 px-3 py-3 rounded-2xl transition-all mb-2 w-full text-left"
          style={{
            background: isActive('/profile') ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(139,92,246,0.15)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(139,92,246,0.2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = isActive('/profile')
              ? 'rgba(139,92,246,0.25)'
              : 'rgba(255,255,255,0.04)';
          }}
        >
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.name}
              className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">{user?.name || 'Student'}</p>
            <p className="text-xs truncate" style={{ color: '#a78bfa' }}>
              @{user?.username || 'user'}
            </p>
          </div>
        </button>

        {/* Logout */}
        <button
          onClick={() => { localStorage.clear(); navigate('/login'); }}
          className="flex items-center gap-3 px-3 py-3 rounded-2xl transition-all w-full text-left"
          style={{ color: '#6b7280' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
            e.currentTarget.style.color = '#f87171';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          <LogOut size={18} />
          <span className="font-semibold text-sm">Logout</span>
        </button>
      </aside>

      {/* ── Mobile Top Bar ── */}
      
<div
  className="sm:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4"
  style={{
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
    borderBottom: '1px solid rgba(139,92,246,0.2)',
    width: '100%',       
    maxWidth: '100vw',   
    boxSizing: 'border-box',
  }}
>
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/feed')}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            <span className="text-white font-black text-xs">CC</span>
          </div>
          <div>
            <span className="text-white font-black text-base tracking-tight">Campus</span>
            <span className="font-black text-base tracking-tight ml-1" style={{ color: '#a78bfa' }}>
              Connect
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNotificationClick}
            className="relative w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#a78bfa' }}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0)?.toUpperCase() || 'U'
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;