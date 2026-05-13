// Replace entire searchRoutes.js with this:

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Post = require('../models/Post');
const Question = require('../models/Question');

router.get('/', protect, async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;

    if (!q || q.trim().length < 1) {
      return res.json({ success: true, users: [], posts: [], questions: [] });
    }

    const query = q.trim().replace(/^@/, ''); // Remove @ if user types @username
    const searchRegex = { $regex: `^${query}`, $options: 'i' }; // starts with query

    let users = [], posts = [], questions = [];

    // ✅ Search Users by USERNAME ONLY
    if (type === 'all' || type === 'users') {
      users = await User.find({
        _id: { $ne: req.user._id },
        username: searchRegex, // username only
      })
        .select('name username profilePicture college department isIdVerified')
        .limit(10);
    }

    // Search Posts
    if (type === 'all' || type === 'posts') {
      const postRegex = { $regex: q.trim(), $options: 'i' };
      posts = await Post.find({
        $or: [
          { title: postRegex },
          { content: postRegex },
          { tags: { $in: [new RegExp(q.trim(), 'i')] } },
        ],
      })
        .populate('author', 'name username profilePicture isIdVerified')
        .select('title content type mediaUrl mediaType tags author createdAt likes')
        .sort({ createdAt: -1 })
        .limit(8);
    }

    // Search Questions
    if (type === 'all' || type === 'questions') {
      const qRegex = { $regex: q.trim(), $options: 'i' };
      questions = await Question.find({
        $or: [
          { title: qRegex },
          { content: qRegex },
          { tags: { $in: [new RegExp(q.trim(), 'i')] } },
        ],
      })
        .populate('author', 'name username profilePicture')
        .select('title content tags upvotes answerCount isSolved author createdAt')
        .sort({ createdAt: -1 })
        .limit(6);
    }

    res.json({ success: true, users, posts, questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;