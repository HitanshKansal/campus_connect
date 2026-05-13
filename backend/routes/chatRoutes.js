// backend/routes/chatRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadPostMedia } = require('../config/cloudinary');
const {
  getMyChats,
  createPersonalChat,
  createGroupChat,
  getMessages,
  sendMessage,
  searchUsers,
  leaveGroup,
  deleteGroup,
  makeAdmin,
  removeAdmin,
  getChatInfo,
  deleteChat,
  deleteMessage,
  editMessage,
  addMembersToGroup,
} = require('../controllers/chatController');

router.get('/', protect, getMyChats);
router.get('/users/search', protect, searchUsers);
router.post('/personal', protect, createPersonalChat);
router.post('/group', protect, createGroupChat);
router.get('/:chatId/messages', protect, getMessages);
router.post('/:chatId/messages', protect, uploadPostMedia.single('media'), sendMessage);
router.get('/:chatId/info', protect, getChatInfo);
router.post('/:chatId/leave', protect, leaveGroup);
router.delete('/:chatId', protect, deleteGroup);
router.post('/:chatId/make-admin', protect, makeAdmin);
router.post('/:chatId/remove-admin', protect, removeAdmin);

// ✅ NEW ROUTES
router.delete('/:chatId/delete-chat', protect, deleteChat);
router.delete('/messages/:messageId', protect, deleteMessage);
router.put('/messages/:messageId', protect, editMessage);
router.post('/:chatId/add-members', protect, addMembersToGroup);

module.exports = router;