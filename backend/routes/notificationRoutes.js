// backend/routes/notificationRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getNotifications,
  markAllRead,
  markOneRead,
  getUnreadCount,
} = require('../controllers/notificationController');

router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/mark-all-read', protect, markAllRead);
router.put('/:id/read', protect, markOneRead);

module.exports = router;