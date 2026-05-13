// frontend/src/components/MobileNav.jsx
// Complete updated file:

import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Plus, MessageCircle, HelpCircle } from 'lucide-react';

const MobileNav = ({ onCreatePost }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { icon: <Home size={20} />, label: 'Feed',   route: '/feed' },
    { icon: <Search size={20} />, label: 'Search', route: '/search' },
    { icon: null, label: 'Create', route: null }, // center create button
    { icon: <MessageCircle size={20} />, label: 'Chat',   route: '/chat' },
    { icon: <HelpCircle size={20} />, label: 'Q&A',    route: '/questions' },
  ];

  return (
    <div
      className="sm:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center"
      style={{
        background: 'white',
        borderTop: '1px solid #e5e7eb',
        height: '60px',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {navItems.map((item, idx) => {
        // Center create button
        if (item.route === null) {
          return (
            <div key={idx} className="flex-1 flex justify-center items-center">
              <button
                onClick={onCreatePost}
                className="flex items-center justify-center w-12 h-12 rounded-2xl text-white shadow-lg transition-transform active:scale-95"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
              >
                <Plus size={24} />
              </button>
            </div>
          );
        }

        const isActive = path === item.route ||
          (item.route === '/feed' && path === '/') ;

        return (
          <button
            key={idx}
            onClick={() => navigate(item.route)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1 transition-all"
            style={{ color: isActive ? '#7c3aed' : '#9ca3af' }}
          >
            <div
              className="flex items-center justify-center w-8 h-8 rounded-xl transition-all"
              style={{ background: isActive ? '#f5f3ff' : 'transparent' }}
            >
              {item.icon}
            </div>
            <span
              className="font-semibold"
              style={{ fontSize: '10px', letterSpacing: '0.01em' }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default MobileNav;