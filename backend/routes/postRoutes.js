// backend/routes/postRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadPostMedia } = require('../config/cloudinary');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Post = require('../models/Post');

const {
  createPost,
  getAllPosts,
  getPostById,
  likePost,
  deletePost,
  getMyPosts,
  savePost,
  getSavedPosts,
} = require('../controllers/postController');

// ✅ Get posts by username
router.get('/user/:username', protect, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const posts = await Post.find({ author: user._id })
      .populate('author', 'name username profilePicture college department isIdVerified')
      .sort({ createdAt: -1 });

    const postsWithCount = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ post: post._id });
        return { ...post.toObject(), commentCount };
      })
    );

    return res.json({ success: true, posts: postsWithCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, uploadPostMedia.single('media'), createPost);
router.get('/', protect, getAllPosts);
router.get('/my-posts', protect, getMyPosts);
router.get('/saved', protect, getSavedPosts);
router.get('/:id', protect, getPostById);
router.put('/:id/like', protect, likePost);
router.put('/:id/save', protect, savePost);
router.delete('/:id', protect, deletePost);

module.exports = router;