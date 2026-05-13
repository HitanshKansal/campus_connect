// frontend/src/components/chat/GroupInfoPanel.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  X, Crown, Shield, LogOut, Trash2,
  UserX, Users, Calendar, Info, UserPlus, Check
} from 'lucide-react';

const GroupInfoPanel = ({ chat, currentUser, onClose, onGroupLeft, onGroupDeleted }) => {
  const navigate = useNavigate();
  const [groupInfo, setGroupInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('members');
  const [actionLoading, setActionLoading] = useState('');

  // Add members states
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [addingMembers, setAddingMembers] = useState(false);

  const isAdmin = groupInfo?.admins?.some(
    a => a._id === currentUser.id || a._id?.toString() === currentUser.id
  );

  useEffect(() => {
    fetchGroupInfo();
  }, [chat._id]);

  const fetchGroupInfo = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/chats/${chat._id}/info`);
      setGroupInfo(data.chat);
    } catch (err) {
      console.log('Error fetching group info:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;
    setActionLoading('leave');
    try {
      await API.post(`/chats/${chat._id}/leave`);
      onGroupLeft(chat._id);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to leave group');
    } finally {
      setActionLoading('');
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm('Delete this group permanently? This cannot be undone.')) return;
    setActionLoading('delete');
    try {
      await API.delete(`/chats/${chat._id}`);
      onGroupDeleted(chat._id);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete group');
    } finally {
      setActionLoading('');
    }
  };

  const handleMakeAdmin = async (userId, userName) => {
    if (!window.confirm(`Make ${userName} an admin?`)) return;
    setActionLoading(userId);
    try {
      await API.post(`/chats/${chat._id}/make-admin`, { userId });
      await fetchGroupInfo();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setActionLoading('');
    }
  };

  const handleRemoveAdmin = async (userId, userName) => {
    if (!window.confirm(`Remove admin role from ${userName}?`)) return;
    setActionLoading(userId);
    try {
      await API.post(`/chats/${chat._id}/remove-admin`, { userId });
      await fetchGroupInfo();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setActionLoading('');
    }
  };

  const handleSearchConnections = async (q) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    try {
      const { data } = await API.get(`/chats/users/search?q=${q}`);
      const filtered = data.users.filter(u =>
        !groupInfo?.members?.some(m => m._id === u._id)
      );
      setSearchResults(filtered);
    } catch (err) {
      console.log('Search error');
    }
  };

  const handleAddMembers = async () => {
    if (selectedToAdd.length === 0) return;
    setAddingMembers(true);
    try {
      await API.post(`/chats/${chat._id}/add-members`, {
        memberIds: selectedToAdd.map(u => u._id),
      });
      await fetchGroupInfo();
      setShowAddMembers(false);
      setSelectedToAdd([]);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add members');
    } finally {
      setAddingMembers(false);
    }
  };

  const toggleSelectUser = (user) => {
    setSelectedToAdd(prev =>
      prev.some(u => u._id === user._id)
        ? prev.filter(u => u._id !== user._id)
        : [...prev, user]
    );
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-400">Loading group info...</p>
        </div>
      </div>
    );
  }

  const admins = groupInfo?.admins || [];
  const members = groupInfo?.members || [];

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid #f3f4f6' }}
      >
        <h3 className="font-black text-gray-900 text-base">Group Info</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
          style={{ background: '#f9fafb', color: '#6b7280' }}
          onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
          onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Group Avatar + Name ── */}
      <div
        className="px-4 py-5 text-center flex-shrink-0"
        style={{ borderBottom: '1px solid #f3f4f6' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white mx-auto mb-3 shadow-md"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
        >
          {groupInfo?.name?.charAt(0)?.toUpperCase()}
        </div>
        <h2 className="font-black text-gray-900 text-lg">{groupInfo?.name}</h2>
        <p className="text-sm mt-0.5" style={{ color: '#9ca3af' }}>
          {members.length} member{members.length !== 1 ? 's' : ''}
        </p>
        {isAdmin && (
          <span
            className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: '#fef9c3', color: '#a16207' }}
          >
            <Crown size={11} /> You are an admin
          </span>
        )}
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex flex-shrink-0" style={{ borderBottom: '1px solid #f3f4f6' }}>
        {[
          { key: 'members', label: 'Members', icon: <Users size={13} /> },
          { key: 'admins',  label: 'Admins',  icon: <Crown size={13} /> },
          { key: 'info',    label: 'Info',    icon: <Info size={13} /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveSection(tab.key); setShowAddMembers(false); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold transition-all"
            style={activeSection === tab.key ? {
              color: '#7c3aed',
              borderBottom: '2px solid #7c3aed',
            } : {
              color: '#9ca3af',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto">

        {/* ── MEMBERS TAB ── */}
        {activeSection === 'members' && (
          <div>
            {/* Members List */}
            {members.map(member => {
              const memberIsAdmin = admins.some(a => a._id === member._id);
              const isMe = member._id === currentUser.id;

              return (
                <div
                  key={member._id}
                  className="flex items-center gap-3 px-4 py-3 transition-all"
                  style={{ borderBottom: '1px solid #f9fafb' }}
                >
                  <img
                    src={member.profilePicture ||
                      `https://ui-avatars.com/api/?name=${member.name}&background=7c3aed&color=fff&size=40`}
                    className="w-10 h-10 rounded-xl object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    alt={member.name}
                    onClick={() => { navigate(`/profile/${member.username}`); onClose(); }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => { navigate(`/profile/${member.username}`); onClose(); }}
                        className="font-bold text-sm text-gray-900 hover:text-violet-600 transition-colors text-left"
                      >
                        {member.name}
                        {isMe && (
                          <span className="text-xs text-gray-400 font-normal ml-1">(You)</span>
                        )}
                      </button>
                      {memberIsAdmin && (
                        <span
                          className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-bold"
                          style={{ background: '#fef9c3', color: '#a16207' }}
                        >
                          <Crown size={9} /> Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">@{member.username}</p>
                    {member.college && (
                      <p className="text-xs text-gray-400 truncate">{member.college}</p>
                    )}
                  </div>

                  {/* Admin actions */}
                  {isAdmin && !isMe && (
                    <div className="flex-shrink-0">
                      {!memberIsAdmin ? (
                        <button
                          onClick={() => handleMakeAdmin(member._id, member.name)}
                          disabled={actionLoading === member._id}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                          style={{ background: '#f5f3ff', color: '#7c3aed' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#ede9fe'}
                          onMouseLeave={e => e.currentTarget.style.background = '#f5f3ff'}
                        >
                          <Shield size={12} />
                          <span className="hidden sm:inline">Make Admin</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRemoveAdmin(member._id, member.name)}
                          disabled={actionLoading === member._id}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                          style={{ background: '#fef2f2', color: '#ef4444' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
                        >
                          <UserX size={12} />
                          <span className="hidden sm:inline">Remove Admin</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* ── Add Members Section (admin only) ── */}
            {isAdmin && (
              <div className="px-4 py-3" style={{ borderTop: '1px solid #f3f4f6' }}>
                {!showAddMembers ? (
                  <button
                    onClick={() => setShowAddMembers(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold transition-all"
                    style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ede9fe' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#ede9fe'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f5f3ff'}
                  >
                    <UserPlus size={15} />
                    Add Members
                  </button>
                ) : (
                  <div className="space-y-3">

                    {/* Search input */}
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => handleSearchConnections(e.target.value)}
                        placeholder="Search your connections..."
                        autoFocus
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                        style={{ background: '#f9fafb', border: '2px solid #e5e7eb', color: '#374151' }}
                        onFocus={e => e.target.style.borderColor = '#a78bfa'}
                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                      />
                      {searchQuery && (
                        <button
                          onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                          className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Selected users chips */}
                    {selectedToAdd.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedToAdd.map(u => (
                          <span
                            key={u._id}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                            style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ede9fe' }}
                          >
                            {u.name.split(' ')[0]}
                            <button
                              onClick={() => toggleSelectUser(u)}
                              className="hover:text-red-500 transition-colors"
                            >
                              <X size={10} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Search results */}
                    {searchResults.length > 0 && (
                      <div
                        className="rounded-xl overflow-hidden"
                        style={{ border: '1px solid #e5e7eb', maxHeight: '200px', overflowY: 'auto' }}
                      >
                        {searchResults.map(user => {
                          const isSelected = selectedToAdd.some(u => u._id === user._id);
                          return (
                            <div
                              key={user._id}
                              onClick={() => toggleSelectUser(user)}
                              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all"
                              style={{
                                background: isSelected ? '#f5f3ff' : 'white',
                                borderBottom: '1px solid #f9fafb',
                              }}
                              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#fafafa'; }}
                              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'white'; }}
                            >
                              <img
                                src={user.profilePicture ||
                                  `https://ui-avatars.com/api/?name=${user.name}&background=7c3aed&color=fff&size=32`}
                                className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                                alt={user.name}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                                <p className="text-xs text-gray-400 truncate">@{user.username}</p>
                              </div>
                              <div
                                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                                style={{
                                  background: isSelected ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : '#f3f4f6',
                                }}
                              >
                                {isSelected && <Check size={11} className="text-white" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* No results */}
                    {searchQuery && searchResults.length === 0 && (
                      <p className="text-xs text-center py-3" style={{ color: '#9ca3af' }}>
                        No connections found matching "{searchQuery}"
                      </p>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowAddMembers(false);
                          setSelectedToAdd([]);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                        style={{ background: '#f3f4f6', color: '#6b7280' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
                        onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddMembers}
                        disabled={selectedToAdd.length === 0 || addingMembers}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                        style={{
                          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                          opacity: selectedToAdd.length === 0 || addingMembers ? 0.5 : 1,
                        }}
                      >
                        {addingMembers
                          ? 'Adding...'
                          : selectedToAdd.length > 0
                            ? `Add (${selectedToAdd.length})`
                            : 'Add'
                        }
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── ADMINS TAB ── */}
        {activeSection === 'admins' && (
          <div className="py-2">
            {admins.length === 0 ? (
              <div className="text-center py-10">
                <Crown size={32} className="mx-auto mb-2" style={{ color: '#e5e7eb' }} />
                <p className="text-sm" style={{ color: '#9ca3af' }}>No admins found</p>
              </div>
            ) : (
              admins.map(admin => {
                const isMe = admin._id === currentUser.id;
                return (
                  <div
                    key={admin._id}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ borderBottom: '1px solid #f9fafb' }}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={admin.profilePicture ||
                          `https://ui-avatars.com/api/?name=${admin.name}&background=7c3aed&color=fff&size=40`}
                        className="w-10 h-10 rounded-xl object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        alt={admin.name}
                        onClick={() => { navigate(`/profile/${admin.username}`); onClose(); }}
                      />
                      <div
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: '#f59e0b' }}
                      >
                        <Crown size={10} className="text-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => { navigate(`/profile/${admin.username}`); onClose(); }}
                        className="font-bold text-sm text-gray-900 hover:text-violet-600 transition-colors block text-left"
                      >
                        {admin.name}
                        {isMe && (
                          <span className="text-xs text-gray-400 font-normal ml-1">(You)</span>
                        )}
                      </button>
                      <p className="text-xs text-gray-400">@{admin.username}</p>
                    </div>

                    <span
                      className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold"
                      style={{ background: '#fef9c3', color: '#a16207' }}
                    >
                      Admin
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── INFO TAB ── */}
        {activeSection === 'info' && (
          <div className="py-4 px-4 space-y-3">
            <div
              className="rounded-2xl p-4 space-y-4"
              style={{ background: '#f9fafb', border: '1px solid #f3f4f6' }}
            >
              {[
                { label: 'Group Name', value: groupInfo?.name },
                { label: 'Total Members', value: `${members.length} member${members.length !== 1 ? 's' : ''}` },
                { label: 'Total Admins', value: `${admins.length} admin${admins.length !== 1 ? 's' : ''}` },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">
                    {item.label}
                  </p>
                  <p className="font-semibold text-gray-800 text-sm">{item.value}</p>
                </div>
              ))}

              {/* Created by */}
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                  Created By
                </p>
                <div className="flex items-center gap-2">
                  <img
                    src={groupInfo?.createdBy?.profilePicture ||
                      `https://ui-avatars.com/api/?name=${groupInfo?.createdBy?.name}&background=7c3aed&color=fff&size=32`}
                    className="w-8 h-8 rounded-lg object-cover cursor-pointer"
                    alt={groupInfo?.createdBy?.name}
                    onClick={() => { navigate(`/profile/${groupInfo?.createdBy?.username}`); onClose(); }}
                  />
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{groupInfo?.createdBy?.name}</p>
                    <p className="text-xs text-gray-400">@{groupInfo?.createdBy?.username}</p>
                  </div>
                </div>
              </div>

              {/* Created on */}
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">
                  Created On
                </p>
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} style={{ color: '#9ca3af' }} />
                  <p className="font-semibold text-gray-700 text-sm">
                    {formatDate(groupInfo?.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Actions ── */}
      <div
        className="flex-shrink-0 p-4 space-y-2"
        style={{ borderTop: '1px solid #f3f4f6' }}
      >
        {/* Leave Group */}
        <button
          onClick={handleLeaveGroup}
          disabled={actionLoading === 'leave'}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all"
          style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa' }}
          onMouseEnter={e => e.currentTarget.style.background = '#ffedd5'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff7ed'}
        >
          <LogOut size={16} />
          {actionLoading === 'leave' ? 'Leaving...' : 'Leave Group'}
        </button>

        {/* Delete Group — admin only */}
        {isAdmin && (
          <button
            onClick={handleDeleteGroup}
            disabled={actionLoading === 'delete'}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all"
            style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}
            onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
            onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
          >
            <Trash2 size={16} />
            {actionLoading === 'delete' ? 'Deleting...' : 'Delete Group'}
          </button>
        )}
      </div>
    </div>
  );
};

export default GroupInfoPanel;