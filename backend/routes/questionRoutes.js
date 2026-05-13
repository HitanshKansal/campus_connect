// backend/routes/questionRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getQuestions,
  getQuestion,
  createQuestion,
  upvoteQuestion,
  deleteQuestion,
  addAnswer,
  upvoteAnswer,
  markBestAnswer,
  deleteAnswer,
} = require('../controllers/questionController');

router.get('/', protect, getQuestions);
router.post('/', protect, createQuestion);
router.get('/:id', protect, getQuestion);
router.put('/:id/upvote', protect, upvoteQuestion);
router.delete('/:id', protect, deleteQuestion);
router.post('/:id/answers', protect, addAnswer);
router.put('/answers/:answerId/upvote', protect, upvoteAnswer);
router.put('/answers/:answerId/best', protect, markBestAnswer);
router.delete('/answers/:answerId', protect, deleteAnswer);

module.exports = router;