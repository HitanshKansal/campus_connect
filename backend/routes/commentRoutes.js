// backend/routes/commentRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getComments, addComment, addReply,
  likeComment, deleteComment,
} = require('../controllers/commentController');

router.get('/:postId', protect, getComments);
router.post('/:postId', protect, addComment);
router.post('/:commentId/reply', protect, addReply);
router.put('/:commentId/like', protect, likeComment);
router.delete('/:commentId', protect, deleteComment);

module.exports = router;