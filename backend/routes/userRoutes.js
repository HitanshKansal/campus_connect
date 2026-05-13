// backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadProfilePicture, uploadIdCard } = require('../config/cloudinary');
const { createNotification } = require('../controllers/notificationController');
const User = require('../models/User');

// GET /api/users/profile — own profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -otp -otpExpiry')
      .populate('connections', 'name username profilePicture college isIdVerified');

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/:username — public profile
router.get('/:username', protect, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -otp -otpExpiry -connectionRequestsReceived -connectionRequestsSent -connections');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const currentUser = await User.findById(req.user._id);
    const isConnected = currentUser.connections.includes(user._id);
    const requestSent = currentUser.connectionRequestsSent.includes(user._id);
    const requestReceived = currentUser.connectionRequestsReceived.includes(user._id);

    res.json({
      success: true,
      user,
      connectionStatus: { isConnected, requestSent, requestReceived },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/users/profile — update own profile
// router.put('/profile', protect, async (req, res) => {
//   try {
//     // ✅ FIXED — session added to destructuring
//     const { bio, skills, name, college, department, username, session } = req.body;
//     const user = req.user;

//     if (name) user.name = name;
//     if (college !== undefined) user.college = college;
//     if (department !== undefined) user.department = department;
//     if (session !== undefined) user.session = session; // ✅ FIXED

//     if (bio !== undefined) user.bio = bio;
//     if (skills !== undefined) {
//       user.skills = typeof skills === 'string'
//         ? skills.split(',').map(s => s.trim()).filter(s => s)
//         : skills;
//     }

//     if (username && username !== user.username) {
//       const usernameRegex = /^[a-z0-9_]+$/;
//       if (!usernameRegex.test(username.toLowerCase())) {
//         return res.status(400).json({
//           success: false,
//           message: 'Username can only contain letters, numbers and underscores',
//         });
//       }
//       const exists = await User.findOne({
//         username: username.toLowerCase(),
//         _id: { $ne: user._id },
//       });
//       if (exists) {
//         return res.status(400).json({ success: false, message: 'Username already taken' });
//       }
//       user.username = username.toLowerCase();
//     }

//     await user.save();

//     res.json({
//       success: true,
//       message: 'Profile updated!',
//       user: {
//         id: user._id,
//         name: user.name,
//         username: user.username,
//         email: user.email,
//         college: user.college,
//         department: user.department,
//         bio: user.bio,
//         skills: user.skills,
//         session: user.session, // ✅ FIXED — return session
//         profilePicture: user.profilePicture,
//         isIdVerified: user.isIdVerified,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// In PUT /profile route — replace with this:
router.put('/profile', protect, async (req, res) => {
  try {
    const { bio, skills, name, username, department, session } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (department !== undefined) user.department = department;
    if (session !== undefined) user.session = session;
    if (bio !== undefined) user.bio = bio;

    // ✅ collegeName is NOT editable — comes from College DB only
    // Do NOT update college from user input

    if (skills !== undefined) {
      user.skills = typeof skills === 'string'
        ? skills.split(',').map(s => s.trim()).filter(s => s)
        : skills;
    }

    if (username && username !== user.username) {
      const usernameRegex = /^[a-z0-9_]+$/;
      if (!usernameRegex.test(username.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'Username can only contain letters, numbers and underscores' });
      }
      const exists = await User.findOne({ username: username.toLowerCase(), _id: { $ne: user._id } });
      if (exists) return res.status(400).json({ success: false, message: 'Username already taken' });
      user.username = username.toLowerCase();
    }

    // ✅ Mark profile as complete when user saves
    user.isProfileComplete = true;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated!',
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        collegeName: user.collegeName,      // ✅ from College DB
        collegeDomain: user.collegeDomain,
        department: user.department,
        bio: user.bio,
        skills: user.skills,
        session: user.session,
        profilePicture: user.profilePicture,
        isProfileComplete: user.isProfileComplete,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/users/upload-profile-picture
router.post('/upload-profile-picture', protect, uploadProfilePicture.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const user = req.user;
    user.profilePicture = req.file.path;
    await user.save();
    res.json({ success: true, message: 'Profile picture updated!', profilePicture: req.file.path });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



// POST /api/users/:username/connect
router.post('/:username/connect', protect, async (req, res) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username });
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    const currentUser = await User.findById(req.user._id);

    if (targetUser._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot connect with yourself' });
    }

    if (currentUser.connections.includes(targetUser._id)) {
      return res.status(400).json({ success: false, message: 'Already connected' });
    }

    if (currentUser.connectionRequestsSent.includes(targetUser._id)) {
      currentUser.connectionRequestsSent = currentUser.connectionRequestsSent
        .filter(id => id.toString() !== targetUser._id.toString());
      targetUser.connectionRequestsReceived = targetUser.connectionRequestsReceived
        .filter(id => id.toString() !== currentUser._id.toString());

      await currentUser.save();
      await targetUser.save();

      return res.json({ success: true, message: 'Connection request cancelled', status: 'none' });
    }

    currentUser.connectionRequestsSent.push(targetUser._id);
    targetUser.connectionRequestsReceived.push(currentUser._id);

    await currentUser.save();
    await targetUser.save();

    await createNotification({
      recipient: targetUser._id,
      sender: currentUser._id,
      type: 'connection_request',
      message: `${currentUser.name} sent you a connection request`,
    });

    res.json({ success: true, message: 'Connection request sent!', status: 'pending' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/users/:username/accept-connection
router.post('/:username/accept-connection', protect, async (req, res) => {
  try {
    const senderUser = await User.findOne({ username: req.params.username });
    if (!senderUser) return res.status(404).json({ success: false, message: 'User not found' });

    const currentUser = await User.findById(req.user._id);

    if (!currentUser.connectionRequestsReceived.includes(senderUser._id)) {
      return res.status(400).json({ success: false, message: 'No connection request found' });
    }

    currentUser.connections.push(senderUser._id);
    senderUser.connections.push(currentUser._id);

    currentUser.connectionRequestsReceived = currentUser.connectionRequestsReceived
      .filter(id => id.toString() !== senderUser._id.toString());
    senderUser.connectionRequestsSent = senderUser.connectionRequestsSent
      .filter(id => id.toString() !== currentUser._id.toString());

    await currentUser.save();
    await senderUser.save();

    await createNotification({
      recipient: senderUser._id,
      sender: currentUser._id,
      type: 'connection_accept',
      message: `${currentUser.name} accepted your connection request`,
    });

    res.json({ success: true, message: 'Connection accepted!', status: 'connected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/users/:username/reject-connection
router.post('/:username/reject-connection', protect, async (req, res) => {
  try {
    const senderUser = await User.findOne({ username: req.params.username });
    if (!senderUser) return res.status(404).json({ success: false, message: 'User not found' });

    const currentUser = await User.findById(req.user._id);

    currentUser.connectionRequestsReceived = currentUser.connectionRequestsReceived
      .filter(id => id.toString() !== senderUser._id.toString());
    senderUser.connectionRequestsSent = senderUser.connectionRequestsSent
      .filter(id => id.toString() !== currentUser._id.toString());

    await currentUser.save();
    await senderUser.save();

    res.json({ success: true, message: 'Connection request rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/connections/list
router.get('/connections/list', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('connections', 'name username profilePicture college department isIdVerified');
    res.json({ success: true, connections: user.connections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/connections/requests
router.get('/connections/requests', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('connectionRequestsReceived', 'name username profilePicture college isIdVerified');
    res.json({ success: true, requests: user.connectionRequestsReceived });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/search/users
router.get('/search/users', protect, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, users: [] });

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
        { college: { $regex: q, $options: 'i' } },
      ],
    })
      .select('name username profilePicture college department isIdVerified')
      .limit(10);

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;