// backend/controllers/questionController.js

const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { createNotification } = require('./notificationController');

// GET /api/questions — get all questions
const getQuestions = async (req, res) => {
  try {
    const { sort = 'latest', tag, search, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (tag) filter.tags = { $in: [tag] };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    let sortOption = {};
    if (sort === 'latest') sortOption = { createdAt: -1 };
    else if (sort === 'popular') sortOption = { upvotes: -1, views: -1 };
    else if (sort === 'unanswered') {
      filter.answerCount = 0;
      sortOption = { createdAt: -1 };
    }

    const questions = await Question.find(filter)
      .populate('author', 'name username profilePicture college isIdVerified')
      .populate('bestAnswer')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Question.countDocuments(filter);

    res.json({
      success: true,
      questions,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/questions/:id — get single question
const getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'name username profilePicture college isIdVerified')
      .populate('bestAnswer');

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Increment views
    question.views += 1;
    await question.save();

    // Get answers
    const answers = await Answer.find({ question: req.params.id })
      .populate('author', 'name username profilePicture college isIdVerified')
      .sort({ isBestAnswer: -1, upvotes: -1, createdAt: 1 });

    res.json({ success: true, question, answers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/questions — create question
const createQuestion = async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
      });
    }

    const question = await Question.create({
      author: req.user._id,
      title: title.trim(),
      content: content.trim(),
      tags: tags
        ? tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t)
        : [],
    });

    await question.populate('author', 'name username profilePicture college isIdVerified');

    res.status(201).json({ success: true, question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/questions/:id/upvote
const upvoteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const userId = req.user._id.toString();
    const isUpvoted = question.upvotes.some(id => id.toString() === userId);

    if (isUpvoted) {
      question.upvotes = question.upvotes.filter(id => id.toString() !== userId);
    } else {
      question.upvotes.push(req.user._id);
      await createNotification({
        recipient: question.author,
        sender: req.user._id,
        type: 'like',
        message: 'upvoted your question',
      });
    }

    await question.save();
    res.json({
      success: true,
      isUpvoted: !isUpvoted,
      upvotesCount: question.upvotes.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/questions/:id
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Answer.deleteMany({ question: req.params.id });
    await Question.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/questions/:id/answers — add answer
const addAnswer = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Answer cannot be empty' });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const answer = await Answer.create({
      question: req.params.id,
      author: req.user._id,
      content: content.trim(),
    });

    // Increment answer count
    question.answerCount += 1;
    await question.save();

    await answer.populate('author', 'name username profilePicture college isIdVerified');

    // Notify question author
    await createNotification({
      recipient: question.author,
      sender: req.user._id,
      type: 'comment',
      message: 'answered your question',
    });

    res.status(201).json({ success: true, answer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/questions/answers/:answerId/upvote
const upvoteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Answer not found' });
    }

    const userId = req.user._id.toString();
    const isUpvoted = answer.upvotes.some(id => id.toString() === userId);

    if (isUpvoted) {
      answer.upvotes = answer.upvotes.filter(id => id.toString() !== userId);
    } else {
      answer.upvotes.push(req.user._id);
    }

    await answer.save();
    res.json({
      success: true,
      isUpvoted: !isUpvoted,
      upvotesCount: answer.upvotes.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/questions/answers/:answerId/best
const markBestAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Answer not found' });
    }

    const question = await Question.findById(answer.question);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only question author can mark best answer' });
    }

    // Unmark previous best answer
    await Answer.updateMany(
      { question: question._id },
      { isBestAnswer: false }
    );

    // Mark new best answer
    answer.isBestAnswer = true;
    await answer.save();

    question.isSolved = true;
    question.bestAnswer = answer._id;
    await question.save();

    // Notify answer author
    await createNotification({
      recipient: answer.author,
      sender: req.user._id,
      type: 'like',
      message: 'marked your answer as the best answer! ✅',
    });

    res.json({ success: true, message: 'Best answer marked!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/questions/answers/:answerId
const deleteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Answer not found' });
    }

    if (answer.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Question.findByIdAndUpdate(answer.question, {
      $inc: { answerCount: -1 },
    });

    await Answer.findByIdAndDelete(req.params.answerId);
    res.json({ success: true, message: 'Answer deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getQuestions,
  getQuestion,
  createQuestion,
  upvoteQuestion,
  deleteQuestion,
  addAnswer,
  upvoteAnswer,
  markBestAnswer,
  deleteAnswer,
};