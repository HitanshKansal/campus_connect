// backend/controllers/postController.js

const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { createNotification } = require('./notificationController');

// @route   POST /api/posts
const createPost = async (req, res) => {
  try {
    const {
      type, title, content, techStack, projectLink, githubLink,
      companyName, jobRole, jobLocation, applyLink,
      rating, reviewCategory, tags,
    } = req.body;

    if (!type || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Type, title and content are required',
      });
    }

    let mediaUrl = '';
    let mediaType = '';
    if (req.file) {
      mediaUrl = req.file.path;
      mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    }

    const post = await Post.create({
      author: req.user._id,
      type,
      title,
      content,
      mediaUrl,
      mediaType,
      techStack: techStack ? techStack.split(',').map(t => t.trim()) : [],
      projectLink: projectLink || '',
      githubLink: githubLink || '',
      companyName: companyName || '',
      jobRole: jobRole || '',
      jobLocation: jobLocation || '',
      applyLink: applyLink || '',
      rating: rating || null,
      reviewCategory: reviewCategory || 'other',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
    });

    await post.populate('author', 'name profilePicture college department isIdVerified');

    res.status(201).json({
      success: true,
      message: 'Post created!',
      post,
    });

  } catch (error) {
    console.log('❌ Create post error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/posts
// In postController.js — replace getAllPosts function:

const getAllPosts = async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (type) filter.type = type;

    const posts = await Post.find(filter)
      .populate('author', 'name username profilePicture college department isIdVerified')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(filter);

    // ✅ Add commentCount to each post
    const postsWithCount = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ post: post._id });
        return { ...post.toObject(), commentCount };
      })
    );

    res.json({
      success: true,
      posts: postsWithCount,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/posts/:id
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name profilePicture college department');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.json({ success: true, post });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/posts/:id/like
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const userId = req.user._id.toString();
    const isLiked = post.likes.some(id => id.toString() === userId);

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(req.user._id);

      await createNotification({
        recipient: post.author,
        sender: req.user._id,
        type: 'like',
        post: post._id,
        message: `liked your post`,
      });
    }

    await post.save();

    res.json({
      success: true,
      message: isLiked ? 'Post unliked' : 'Post liked',
      likesCount: post.likes.length,
      isLiked: !isLiked,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/posts/:id
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post',
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Post deleted successfully' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/posts/my-posts
const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .populate('author', 'name username profilePicture college department isIdVerified')
      .sort({ createdAt: -1 });

    // ✅ Add commentCount
    const postsWithCount = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ post: post._id });
        return { ...post.toObject(), commentCount };
      })
    );

    res.json({ success: true, posts: postsWithCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @route PUT /api/posts/:id/save
const savePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userId = req.user._id.toString();
    const isSaved = post.saves.some(id => id.toString() === userId);

    if (isSaved) {
      post.saves = post.saves.filter(id => id.toString() !== userId);
    } else {
      post.saves.push(req.user._id);
    }

    await post.save();

    res.json({
      success: true,
      isSaved: !isSaved,
      savesCount: post.saves.length,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/posts/saved
const getSavedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ saves: req.user._id })
      .populate('author', 'name username profilePicture college department isIdVerified')
      .sort({ createdAt: -1 });

    // ✅ Add commentCount
    const postsWithCount = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ post: post._id });
        return { ...post.toObject(), commentCount };
      })
    );

    res.json({ success: true, posts: postsWithCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// exports
module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  likePost,
  deletePost,
  getMyPosts,
  savePost,
  getSavedPosts,
};