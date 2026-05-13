// backend/routes/collegeRoutes.js

const express = require('express');
const router = express.Router();
const College = require('../models/College');
const { protect } = require('../middleware/authMiddleware');

// GET all colleges (public — for frontend dropdowns)
router.get('/', async (req, res) => {
  try {
    const colleges = await College.find({ isActive: true })
      .select('name domain shortName city state')
      .sort({ name: 1 });
    res.json({ success: true, colleges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET college by domain
router.get('/domain/:domain', async (req, res) => {
  try {
    const college = await College.findOne({
      domain: req.params.domain.toLowerCase(),
      isActive: true,
    });
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }
    res.json({ success: true, college });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST add new college (protected)
router.post('/', protect, async (req, res) => {
  try {
    const { name, domain, shortName, city, state } = req.body;
    if (!name || !domain) {
      return res.status(400).json({ success: false, message: 'Name and domain are required' });
    }
    const exists = await College.findOne({ domain: domain.toLowerCase() });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Domain already registered' });
    }
    const college = await College.create({ name, domain: domain.toLowerCase(), shortName, city, state });
    res.status(201).json({ success: true, college });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;