// backend/controllers/commentController.js

const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { createNotification } = require('./notificationController');

// @route GET /api/comments/:postId
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'name username profilePicture college isIdVerified')
      .populate('replies.author', 'name username profilePicture college isIdVerified')
      .sort({ createdAt: -1 });

    res.json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/comments/:postId
const addComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Comment cannot be empty' });
    }

    // Find post first
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Create comment
    const comment = await Comment.create({
      post: req.params.postId,
      author: req.user._id,
      content: content.trim(),
    });

    await comment.populate('author', 'name username profilePicture college isIdVerified');

    // Send notification to post author
    await createNotification({
      recipient: post.author,
      sender: req.user._id,
      type: 'comment',
      post: post._id,
      comment: comment._id,
      message: 'commented on your post',
    });

    res.status(201).json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/comments/:commentId/reply
const addReply = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Reply cannot be empty' });
    }

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const reply = {
      author: req.user._id,
      content: content.trim(),
      likes: [],
    };

    comment.replies.push(reply);
    await comment.save();
    await comment.populate('replies.author', 'name username profilePicture college isIdVerified');

    // Notify comment author
    await createNotification({
      recipient: comment.author,
      sender: req.user._id,
      type: 'reply',
      comment: comment._id,
      message: 'replied to your comment',
    });

    const newReply = comment.replies[comment.replies.length - 1];
    res.status(201).json({ success: true, reply: newReply });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/comments/:commentId/like
const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const userId = req.user._id.toString();
    const isLiked = comment.likes.some(id => id.toString() === userId);

    if (isLiked) {
      comment.likes = comment.likes.filter(id => id.toString() !== userId);
    } else {
      comment.likes.push(req.user._id);
    }

    await comment.save();
    res.json({ success: true, isLiked: !isLiked, likesCount: comment.likes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/comments/:commentId
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Comment.findByIdAndDelete(req.params.commentId);
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getComments,
  addComment,
  addReply,
  likeComment,
  deleteComment,
};