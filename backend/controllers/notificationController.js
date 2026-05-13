// backend/controllers/notificationController.js

const Notification = require('../models/Notification');

// Get all notifications for current user
// const getNotifications = async (req, res) => {
//   try {
//     const notifications = await Notification.find({ recipient: req.user._id })
//       .populate('sender', 'name username profilePicture')
//       .populate('post', 'title type')
//       .sort({ createdAt: -1 })
//       .limit(50);

//     res.json({ success: true, notifications });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// In controllers/notificationController.js — update getNotifications:

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name username profilePicture')
      .populate('post', 'title type _id') // ✅ include title and id
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark all as read
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark single as read
const markOneRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper to create notification (used in other controllers)
const createNotification = async ({
  recipient, sender, type, post, comment, message
}) => {
  try {
    if (recipient.toString() === sender.toString()) return;
    await Notification.create({ recipient, sender, type, post, comment, message });
  } catch (error) {
    console.log('Notification error:', error.message);
  }
};

module.exports = {
  getNotifications,
  markAllRead,
  markOneRead,
  getUnreadCount,
  createNotification,
};