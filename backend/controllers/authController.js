// // backend/controllers/authController.js

// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const sendEmail = require('../utils/sendEmail');

// // ── Allowed college email domains ──
// const ALLOWED_DOMAINS = [
//   'college.edu',
//   'university.ac.in',
//   'gl.ac.in',
//   'glbitm.ac.in',
//   'aktu.ac.in',
//   'du.ac.in',
//   'iitk.ac.in',
//   'iitd.ac.in',
//   'bits-pilani.ac.in',
//   'vit.ac.in',
//   'manipal.edu',
//   'gmail.com', // ← remove this before final submission
//   // Add more college domains here
// ];

// const isAllowedDomain = (email) => {
//   const domain = email.split('@')[1]?.toLowerCase();
//   return ALLOWED_DOMAINS.some(
//     allowed => domain === allowed || domain?.endsWith('.' + allowed)
//   );
// };

// const generateToken = (userId) => {
//   return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
// };

// const generateOTP = () => {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// };

// // ─────────────────────────────────────────
// // @route   POST /api/auth/register
// // ─────────────────────────────────────────
// const registerUser = async (req, res) => {
//   try {
//     console.log('Register called with:', req.body);
//     const { name, username, email, password } = req.body;

//     // Validate fields
//     if (!name || !username || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please fill all fields',
//       });
//     }

//     // Domain restriction
//     if (!isAllowedDomain(email)) {
//       const domain = email.split('@')[1];
//       return res.status(400).json({
//         success: false,
//         message: `Email domain "@${domain}" is not allowed. Please use your official college email address.`,
//         errorType: 'INVALID_DOMAIN',
//       });
//     }

//     // Validate username format
//     const usernameRegex = /^[a-z0-9_]+$/;
//     if (!usernameRegex.test(username.toLowerCase())) {
//       return res.status(400).json({
//         success: false,
//         message: 'Username can only contain letters, numbers and underscores',
//       });
//     }

//     if (username.length < 3 || username.length > 20) {
//       return res.status(400).json({
//         success: false,
//         message: 'Username must be between 3 and 20 characters',
//       });
//     }

//     // Check email exists
//     const emailExists = await User.findOne({ email: email.toLowerCase() });
//     if (emailExists) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email already registered',
//       });
//     }

//     // Check username exists
//     const usernameExists = await User.findOne({
//       username: username.toLowerCase(),
//     });
//     if (usernameExists) {
//       return res.status(400).json({
//         success: false,
//         message: 'Username already taken',
//       });
//     }

//     const otp = generateOTP();
//     const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

//     const user = await User.create({
//       name,
//       username: username.toLowerCase(),
//       email: email.toLowerCase(),
//       password,
//       otp,
//       otpExpiry,
//     });

//     console.log('✅ User created:', user._id);

//     await sendEmail({
//       to: email,
//       subject: 'Campus Connect - Verify Your Email',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
//           <h2 style="color: #7c3aed;">Campus Connect 🎓</h2>
//           <p>Hi <strong>${name}</strong> (@${username}),</p>
//           <p>Your email verification OTP is:</p>
//           <h1 style="letter-spacing: 8px; color: #7c3aed; font-size: 36px;">${otp}</h1>
//           <p>This OTP is valid for <strong>10 minutes</strong>.</p>
//           <p>If you didn't register, please ignore this email.</p>
//         </div>
//       `,
//     });

//     console.log('✅ Email sent');

//     return res.status(201).json({
//       success: true,
//       message: 'Registration successful! Please check your email for the OTP.',
//       userId: user._id,
//     });

//   } catch (error) {
//     console.log('❌ Register error:', error.message);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ─────────────────────────────────────────
// // @route   POST /api/auth/verify-otp
// // ─────────────────────────────────────────
// const verifyOTP = async (req, res) => {
//   try {
//     const { userId, otp } = req.body;

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     if (user.isVerified) {
//       return res.status(400).json({ success: false, message: 'Email already verified' });
//     }

//     if (user.otpExpiry < new Date()) {
//       return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
//     }

//     if (user.otp !== otp) {
//       return res.status(400).json({ success: false, message: 'Invalid OTP' });
//     }

//     user.isVerified = true;
//     user.otp = undefined;
//     user.otpExpiry = undefined;
//     await user.save();

//     return res.json({
//       success: true,
//       message: 'Email verified successfully!',
//       token: generateToken(user._id),
//       user: {
//         id: user._id,
//         name: user.name,
//         username: user.username,
//         email: user.email,
//         isVerified: user.isVerified,
//       },
//     });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ─────────────────────────────────────────
// // @route   POST /api/auth/resend-otp
// // ─────────────────────────────────────────
// const resendOTP = async (req, res) => {
//   try {
//     const { userId } = req.body;

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     if (user.isVerified) {
//       return res.status(400).json({ success: false, message: 'Email already verified' });
//     }

//     const otp = generateOTP();
//     user.otp = otp;
//     user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
//     await user.save();

//     await sendEmail({
//       to: user.email,
//       subject: 'Campus Connect - New OTP',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
//           <h2 style="color: #7c3aed;">Campus Connect 🎓</h2>
//           <p>Your new OTP is:</p>
//           <h1 style="letter-spacing: 8px; color: #7c3aed; font-size: 36px;">${otp}</h1>
//           <p>This OTP is valid for <strong>10 minutes</strong>.</p>
//         </div>
//       `,
//     });

//     return res.json({ success: true, message: 'New OTP sent to your email.' });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ─────────────────────────────────────────
// // @route   POST /api/auth/login
// // ─────────────────────────────────────────
// const loginUser = async (req, res) => {
//   try {
//     const { emailOrUsername, password } = req.body;

//     if (!emailOrUsername || !password) {
//       return res.status(400).json({ success: false, message: 'Please fill all fields' });
//     }

//     // Find by email OR username
//     const user = await User.findOne({
//       $or: [
//         { email: emailOrUsername.toLowerCase() },
//         { username: emailOrUsername.toLowerCase() },
//       ],
//     });

//     if (!user) {
//       return res.status(401).json({ success: false, message: 'Invalid credentials' });
//     }

//     if (!user.isVerified) {
//       return res.status(401).json({
//         success: false,
//         message: 'Please verify your email before logging in',
//       });
//     }

//     const isMatch = await user.matchPassword(password);
//     if (!isMatch) {
//       return res.status(401).json({ success: false, message: 'Invalid credentials' });
//     }

//     return res.json({
//       success: true,
//       token: generateToken(user._id),
//       user: {
//         id: user._id,
//         name: user.name,
//         username: user.username,
//         email: user.email,
//         isVerified: user.isVerified,
//         profilePicture: user.profilePicture,
//         college: user.college,
//         department: user.department,
//       },
//     });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ─────────────────────────────────────────
// // @route   POST /api/auth/forgot-password
// // ─────────────────────────────────────────
// const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ success: false, message: 'Email is required' });
//     }

//     const user = await User.findOne({ email: email.toLowerCase() });
//     if (!user) {
//       // Don't reveal if email exists (security)
//       return res.json({
//         success: true,
//         message: 'If this email is registered, you will receive an OTP shortly.',
//       });
//     }

//     const otp = generateOTP();
//     const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

//     user.otp = otp;
//     user.otpExpiry = otpExpiry;
//     await user.save();

//     await sendEmail({
//       to: email,
//       subject: 'Campus Connect - Password Reset OTP',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
//           <h2 style="color: #7c3aed;">Campus Connect 🎓</h2>
//           <p>You requested a password reset.</p>
//           <p>Your OTP is:</p>
//           <h1 style="letter-spacing: 8px; color: #7c3aed; font-size: 36px;">${otp}</h1>
//           <p>This OTP is valid for <strong>5 minutes</strong>.</p>
//           <p>If you didn't request this, please ignore this email.</p>
//         </div>
//       `,
//     });

//     return res.json({
//       success: true,
//       message: 'OTP sent to your email address.',
//       userId: user._id,
//     });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ─────────────────────────────────────────
// // @route   POST /api/auth/verify-reset-otp
// // ─────────────────────────────────────────
// const verifyResetOTP = async (req, res) => {
//   try {
//     const { userId, otp } = req.body;

//     if (!userId || !otp) {
//       return res.status(400).json({
//         success: false,
//         message: 'User ID and OTP are required',
//       });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     if (!user.otp || user.otpExpiry < new Date()) {
//       return res.status(400).json({
//         success: false,
//         message: 'OTP has expired. Please request a new one.',
//       });
//     }

//     if (user.otp !== otp) {
//       return res.status(400).json({ success: false, message: 'Invalid OTP' });
//     }

//     user.otp = undefined;
//     user.otpExpiry = undefined;
//     await user.save();

//     return res.json({
//       success: true,
//       message: 'OTP verified successfully!',
//       userId: user._id,
//     });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ─────────────────────────────────────────
// // @route   POST /api/auth/reset-password
// // ─────────────────────────────────────────
// const resetPassword = async (req, res) => {
//   try {
//     const { userId, newPassword } = req.body;

//     if (!userId || !newPassword) {
//       return res.status(400).json({
//         success: false,
//         message: 'All fields are required',
//       });
//     }

//     if (newPassword.length < 6) {
//       return res.status(400).json({
//         success: false,
//         message: 'Password must be at least 6 characters',
//       });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     user.password = newPassword; // pre-save hook will hash it
//     await user.save();

//     return res.json({
//       success: true,
//       message: 'Password reset successfully! Please login with your new password.',
//     });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// module.exports = {
//   registerUser,
//   verifyOTP,
//   resendOTP,
//   loginUser,
//   forgotPassword,
//   verifyResetOTP,
//   resetPassword,
// };


// backend/controllers/authController.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const College = require('../models/College');
const sendEmail = require('../utils/sendEmail');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ─────────────────────────────────────────
// @route   POST /api/auth/register
// ─────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    console.log('Register called with:', req.body);
    const { name, username, email, password } = req.body;

    // Validate fields
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all fields',
      });
    }

    // ✅ Extract domain and check against College collection
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address',
      });
    }

    const college = await College.findOne({ domain, isActive: true });
    if (!college) {
      return res.status(400).json({
        success: false,
        message: 'Only registered college emails are allowed. Please use your official college email.',
        errorType: 'INVALID_DOMAIN',
      });
    }

    // Validate username format
    const usernameRegex = /^[a-z0-9_]+$/;
    if (!usernameRegex.test(username.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Username can only contain letters, numbers and underscores',
      });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({
        success: false,
        message: 'Username must be between 3 and 20 characters',
      });
    }

    // Check email exists
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Check username exists
    const usernameExists = await User.findOne({ username: username.toLowerCase() });
    if (usernameExists) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // ✅ Auto-fill college name and domain from DB
    const user = await User.create({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      otp,
      otpExpiry,
      collegeName: college.name,       // ✅ locked from College collection
      collegeDomain: college.domain,   // ✅ store domain too
    });

    console.log('✅ User created:', user._id, '| College:', college.name);

    await sendEmail({
      to: email,
      subject: 'Campus Connect - Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
          <h2 style="color: #7c3aed;">Campus Connect 🎓</h2>
          <p>Hi <strong>${name}</strong> (@${username}),</p>
          <p>Welcome from <strong>${college.name}</strong>!</p>
          <p>Your email verification OTP is:</p>
          <h1 style="letter-spacing: 8px; color: #7c3aed; font-size: 36px;">${otp}</h1>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <p>If you didn't register, please ignore this email.</p>
        </div>
      `,
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for the OTP.',
      userId: user._id,
      collegeName: college.name,
    });

  } catch (error) {
    console.log('❌ Register error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────
// @route   POST /api/auth/verify-otp
// ─────────────────────────────────────────
const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Email already verified' });
    if (user.otpExpiry < new Date()) return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    if (user.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return res.json({
      success: true,
      message: 'Email verified successfully!',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        collegeName: user.collegeName,
        isVerified: user.isVerified,
        isProfileComplete: user.isProfileComplete,
      },
      // ✅ Tell frontend to redirect to profile setup
      redirectTo: '/setup-profile',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────
// @route   POST /api/auth/resend-otp
// ─────────────────────────────────────────
const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Email already verified' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Campus Connect - New OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
          <h2 style="color: #7c3aed;">Campus Connect 🎓</h2>
          <p>Your new OTP is:</p>
          <h1 style="letter-spacing: 8px; color: #7c3aed; font-size: 36px;">${otp}</h1>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        </div>
      `,
    });

    return res.json({ success: true, message: 'New OTP sent to your email.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────
// @route   POST /api/auth/login
// ─────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ success: false, message: 'Please fill all fields' });
    }

    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername.toLowerCase() },
      ],
    });

    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!user.isVerified) return res.status(401).json({ success: false, message: 'Please verify your email before logging in' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    return res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        collegeName: user.collegeName,
        collegeDomain: user.collegeDomain,
        isVerified: user.isVerified,
        isProfileComplete: user.isProfileComplete,
        profilePicture: user.profilePicture,
        department: user.department,
      },
      // ✅ Redirect new users to profile setup
      redirectTo: user.isProfileComplete ? '/feed' : '/setup-profile',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────
// @route   POST /api/auth/forgot-password
// ─────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({ success: true, message: 'If this email is registered, you will receive an OTP shortly.' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendEmail({
      to: email,
      subject: 'Campus Connect - Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
          <h2 style="color: #7c3aed;">Campus Connect 🎓</h2>
          <p>Your password reset OTP is:</p>
          <h1 style="letter-spacing: 8px; color: #7c3aed; font-size: 36px;">${otp}</h1>
          <p>This OTP is valid for <strong>5 minutes</strong>.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    return res.json({ success: true, message: 'OTP sent to your email address.', userId: user._id });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────
// @route   POST /api/auth/verify-reset-otp
// ─────────────────────────────────────────
const verifyResetOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) return res.status(400).json({ success: false, message: 'User ID and OTP are required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!user.otp || user.otpExpiry < new Date()) return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    if (user.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return res.json({ success: true, message: 'OTP verified successfully!', userId: user._id });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────
// @route   POST /api/auth/reset-password
// ─────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) return res.status(400).json({ success: false, message: 'All fields are required' });
    if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.password = newPassword;
    await user.save();

    return res.json({ success: true, message: 'Password reset successfully! Please login with your new password.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
};