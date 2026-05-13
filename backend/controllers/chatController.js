// backend/controllers/chatController.js

const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

// @route GET /api/chats
// Get all chats for current user
const getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      members: req.user._id, // ✅ only chats where user is a member
    })
      .populate('members', 'name username profilePicture college isIdVerified')
      .populate({
        path: 'lastMessage',
        select: 'content mediaType deletedForEveryone sender createdAt',
      })
      .sort({ updatedAt: -1 });

    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/chats/personal
// Create or get personal chat
const createPersonalChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID required' });
    }

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      isGroup: false,
      members: { $all: [req.user._id, userId] },
    })
      .populate('members', 'name profilePicture college isIdVerified')
      .populate('lastMessage');

    if (existingChat) {
      return res.json({ success: true, chat: existingChat });
    }

    // Create new personal chat
    const chat = await Chat.create({
      isGroup: false,
      members: [req.user._id, userId],
    });

    await chat.populate('members', 'name profilePicture college isIdVerified');

    res.status(201).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/chats/group
// Create group chat
const createGroupChat = async (req, res) => {
  try {
    const { name, memberIds } = req.body;

    if (!name || !memberIds || memberIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Group name and at least 2 members required',
      });
    }

    const members = [...new Set([...memberIds, req.user._id.toString()])];

    const chat = await Chat.create({
      name,
      isGroup: true,
      members,
      admins: [req.user._id],
      createdBy: req.user._id,
    });

    await chat.populate('members', 'name profilePicture college isIdVerified');

    res.status(201).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/chats/:chatId/messages
// Get messages for a chat

const getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const isMember = chat.members.some(m => m.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ success: false, message: 'Not a member' });

    const messages = await Message.find({
      chat: req.params.chatId,
      deletedFor: { $ne: req.user._id }, // ✅ filter messages deleted for this user
    })
      .populate('sender', 'name username profilePicture')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    await Message.updateMany(
      { chat: req.params.chatId, readBy: { $ne: req.user._id } },
      { $push: { readBy: req.user._id } }
    );

    res.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @route POST /api/chats/:chatId/messages
// Send a message
const sendMessage = async (req, res) => {
  try {
    const { content, replyTo } = req.body;

    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    if (!chat.members.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not a member' });
    }

    let mediaUrl = '';
    let mediaType = '';

    if (req.file) {
      mediaUrl = req.file.path;
      const mime = req.file.mimetype;
      if (mime.startsWith('image/')) mediaType = 'image';
      else if (mime.startsWith('video/')) mediaType = 'video';
      else if (mime === 'application/pdf') mediaType = 'pdf';
    }

    if (!content && !mediaUrl) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    const message = await Message.create({
      chat: req.params.chatId,
      sender: req.user._id,
      content: content || '',
      mediaUrl,
      mediaType,
      readBy: [req.user._id],
      replyTo: replyTo || null,
    });

    await message.populate('sender', 'name profilePicture');
    if (replyTo) await message.populate('replyTo');

    // Update last message
    await Chat.findByIdAndUpdate(req.params.chatId, {
      lastMessage: message._id,
      updatedAt: new Date(),
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/chats/users/search
// Search users to start chat
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, users: [] });

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { college: { $regex: q, $options: 'i' } },
      ],
    })
      .select('name profilePicture college department isIdVerified')
      .limit(10);

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get chat info with members + admins
const getChatInfo = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('members', 'name username profilePicture college department isIdVerified')
      .populate('admins', 'name username profilePicture')
      .populate('createdBy', 'name username profilePicture');

    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const isMember = chat.members.some(m => m._id.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ success: false, message: 'Not a member' });

    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Leave group
const leaveGroup = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    if (!chat.isGroup) return res.status(400).json({ success: false, message: 'Not a group chat' });

    const userId = req.user._id.toString();
    const isMember = chat.members.some(m => m.toString() === userId);
    if (!isMember) return res.status(400).json({ success: false, message: 'Not a member' });

    // Remove from members and admins
    chat.members = chat.members.filter(m => m.toString() !== userId);
    chat.admins = chat.admins.filter(a => a.toString() !== userId);

    // If no members left — delete the group
    if (chat.members.length === 0) {
      await Chat.findByIdAndDelete(req.params.chatId);
      return res.json({ success: true, message: 'Group deleted as no members remain', deleted: true });
    }

    // If no admins left — make first member admin
    if (chat.admins.length === 0 && chat.members.length > 0) {
      chat.admins.push(chat.members[0]);
    }

    await chat.save();
    res.json({ success: true, message: 'Left the group successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete group — admin only
const deleteGroup = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    if (!chat.isGroup) return res.status(400).json({ success: false, message: 'Not a group chat' });

    const isAdmin = chat.admins.some(a => a.toString() === req.user._id.toString());
    if (!isAdmin) return res.status(403).json({ success: false, message: 'Only admins can delete the group' });

    // Delete all messages
    await Message.deleteMany({ chat: req.params.chatId });
    await Chat.findByIdAndDelete(req.params.chatId);

    res.json({ success: true, message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Make someone admin — admin only
const makeAdmin = async (req, res) => {
  try {
    const { userId } = req.body;
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const isAdmin = chat.admins.some(a => a.toString() === req.user._id.toString());
    if (!isAdmin) return res.status(403).json({ success: false, message: 'Only admins can do this' });

    const isMember = chat.members.some(m => m.toString() === userId);
    if (!isMember) return res.status(400).json({ success: false, message: 'User is not a member' });

    const alreadyAdmin = chat.admins.some(a => a.toString() === userId);
    if (alreadyAdmin) return res.status(400).json({ success: false, message: 'Already an admin' });

    chat.admins.push(userId);
    await chat.save();

    res.json({ success: true, message: 'User promoted to admin' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove admin role — admin only
const removeAdmin = async (req, res) => {
  try {
    const { userId } = req.body;
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const isAdmin = chat.admins.some(a => a.toString() === req.user._id.toString());
    if (!isAdmin) return res.status(403).json({ success: false, message: 'Only admins can do this' });

    // Cannot remove yourself as admin if you are the only admin
    if (userId === req.user._id.toString() && chat.admins.length === 1) {
      return res.status(400).json({ success: false, message: 'Cannot remove the only admin' });
    }

    chat.admins = chat.admins.filter(a => a.toString() !== userId);
    await chat.save();

    res.json({ success: true, message: 'Admin role removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete entire chat (for me only)
// In chatController.js — replace deleteChat function:

const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const userId = req.user._id.toString();
    const isMember = chat.members.some(m => m.toString() === userId);
    if (!isMember) return res.status(403).json({ success: false, message: 'Not authorized' });

    if (chat.isGroup) {
      // For group — just mark messages as deleted for this user
      await Message.updateMany(
        { chat: req.params.chatId },
        { $addToSet: { deletedFor: req.user._id } }
      );
    } else {
      // For personal chat — remove user from members so it disappears completely
      chat.members = chat.members.filter(m => m.toString() !== userId);
      if (chat.members.length === 0) {
        // Both left — delete everything
        await Message.deleteMany({ chat: req.params.chatId });
        await Chat.findByIdAndDelete(req.params.chatId);
        return res.json({ success: true, message: 'Chat deleted', fullyDeleted: true });
      }
      await chat.save();
    }

    res.json({ success: true, message: 'Chat deleted for you' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a message (for me OR for everyone)
// Replace deleteMessage in chatController.js:

const deleteMessage = async (req, res) => {
  try {
    const { deleteForEveryone } = req.body;
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    const isSender = message.sender.toString() === req.user._id.toString();

    if (deleteForEveryone === true) {
      if (!isSender) {
        return res.status(403).json({
          success: false,
          message: 'Only sender can delete for everyone',
        });
      }
      message.deletedForEveryone = true;
      message.content = 'This message was deleted';
      message.mediaUrl = '';
      message.mediaType = '';
    } else {
      if (!message.deletedFor.includes(req.user._id)) {
        message.deletedFor.push(req.user._id);
      }
    }

    await message.save();

    res.json({
      success: true,
      messageId: message._id,
      deletedForEveryone: deleteForEveryone === true,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Edit a message
const editMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Content cannot be empty' });
    }

    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only sender can edit message' });
    }

    if (message.deletedForEveryone) {
      return res.status(400).json({ success: false, message: 'Cannot edit deleted message' });
    }

    message.content = content.trim();
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    await message.populate('sender', 'name profilePicture');

    res.json({ success: true, message: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add members to group — admin only, only connected users
const addMembersToGroup = async (req, res) => {
  try {
    const { memberIds } = req.body;
    const chat = await Chat.findById(req.params.chatId)
      .populate('members', 'name username');

    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    if (!chat.isGroup) return res.status(400).json({ success: false, message: 'Not a group' });

    const isAdmin = chat.admins.some(a => a.toString() === req.user._id.toString());
    if (!isAdmin) return res.status(403).json({ success: false, message: 'Only admins can add members' });

    // Verify all users are connected with admin
    const currentUser = await User.findById(req.user._id);
    const validMembers = memberIds.filter(id =>
      currentUser.connections.some(c => c.toString() === id)
    );

    if (validMembers.length === 0) {
      return res.status(400).json({ success: false, message: 'You can only add your connections' });
    }

    // Add only non-existing members
    const newMembers = validMembers.filter(id =>
      !chat.members.some(m => m._id?.toString() === id || m.toString() === id)
    );

    if (newMembers.length === 0) {
      return res.status(400).json({ success: false, message: 'All selected users are already members' });
    }

    chat.members.push(...newMembers);
    await chat.save();

    await chat.populate('members', 'name username profilePicture college isIdVerified');
    res.json({ success: true, message: `${newMembers.length} member(s) added`, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyChats,
  createPersonalChat,
  createGroupChat,
  getMessages,
  sendMessage,
  searchUsers,
  getChatInfo,
  leaveGroup,
  deleteGroup,
  makeAdmin,
  removeAdmin,
  deleteChat,
  deleteMessage,
  editMessage,
  addMembersToGroup,
};