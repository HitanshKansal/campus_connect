// frontend/src/components/chat/NewChatModal.jsx

import { useState } from 'react';
import API from '../../api/axios';

const NewChatModal = ({ onClose, onChatCreated, currentUserId }) => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [isGroup, setIsGroup] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearch(q);

    if (!q.trim()) {
      setUsers([]);
      return;
    }

    setSearching(true);
    try {
      const { data } = await API.get(`/chats/users/search?q=${q}`);
      setUsers(data.users);
    } catch (err) {
      console.log('Search error:', err.message);
    } finally {
      setSearching(false);
    }
  };

  const toggleUser = (user) => {
    const exists = selectedUsers.find(u => u._id === user._id);
    if (exists) {
      setSelectedUsers(prev => prev.filter(u => u._id !== user._id));
    } else {
      setSelectedUsers(prev => [...prev, user]);
    }
  };

  const handleCreate = async () => {
    if (selectedUsers.length === 0) return;
    setCreating(true);

    try {
      let data;

      if (isGroup || selectedUsers.length > 1) {
        if (!groupName.trim()) {
          alert('Please enter a group name');
          return;
        }
        const res = await API.post('/chats/group', {
          name: groupName,
          memberIds: selectedUsers.map(u => u._id),
        });
        data = res.data;
      } else {
        const res = await API.post('/chats/personal', {
          userId: selectedUsers[0]._id,
        });
        data = res.data;
      }

      onChatCreated(data.chat);
    } catch (err) {
      console.log('Create chat error:', err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-lg font-bold text-gray-800">New Message</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            ✕
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">

          {/* Group Toggle */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setIsGroup(!isGroup)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                isGroup ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              👥 Create Group
            </button>
            {selectedUsers.length > 0 && (
              <span className="text-xs text-gray-500">
                {selectedUsers.length} selected
              </span>
            )}
          </div>

          {/* Group Name Input */}
          {(isGroup || selectedUsers.length > 1) && (
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-4">
              {selectedUsers.map(user => (
                <div key={user._id}
                  className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                  <span>{user.name}</span>
                  <button onClick={() => toggleUser(user)} className="ml-1 hover:text-indigo-900">✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Search Input */}
          <div className="relative mb-4">
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search students by name or college..."
              className="w-full px-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {searching && (
              <span className="absolute right-3 top-2.5 text-gray-400 text-sm">...</span>
            )}
          </div>

          {/* Search Results */}
          <div className="space-y-2">
            {users.map(user => {
              const isSelected = selectedUsers.find(u => u._id === user._id);
              return (
                <div
                  key={user._id}
                  onClick={() => toggleUser(user)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
                    isSelected ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <img
                    src={user.profilePicture ||
                      `https://ui-avatars.com/api/?name=${user.name}&background=4F46E5&color=fff&size=40`}
                    className="w-10 h-10 rounded-full object-cover"
                    alt={user.name}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">
                      {user.name}
                      {user.isIdVerified && <span className="ml-1 text-xs">🪪</span>}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.college || 'Student'} • {user.department || ''}
                    </p>
                  </div>
                  {isSelected && <span className="text-indigo-600 text-lg">✓</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Create Button */}
        {selectedUsers.length > 0 && (
          <div className="p-4 border-t">
            <button
              onClick={handleCreate}
              disabled={creating}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {creating ? 'Creating...' : selectedUsers.length > 1 || isGroup ? '👥 Create Group' : '💬 Start Chat'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewChatModal;