// // backend/models/User.js

// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     username: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },
//     password: {
//       type: String,
//       required: true,
//       minlength: 6,
//     },

//     // ── Profile Info ──
//     bio: { type: String, default: '' },
//     college: { type: String, default: '' },
//     department: { type: String, default: '' },
//     session: { type: String, default: '' },
//     skills: [{ type: String }],
//     profilePicture: { type: String, default: '' },

//     // ── Email Verification ──
//     isVerified: { type: Boolean, default: false },
//     otp: { type: String },
//     otpExpiry: { type: Date },

//     // ── Connections ──
//     connections: [
//       { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
//     ],
//     connectionRequestsSent: [
//       { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
//     ],
//     connectionRequestsReceived: [
//       { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
//     ],

//     // ── Saved Posts ──
//     savedPosts: [
//       { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }
//     ],
//   },
//   { timestamps: true }
// );

// // ✅ FIXED pre-save hook — works with all bcryptjs versions
// userSchema.pre('save', async function () {
//   if (!this.isModified('password')) return;
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

// // ── Compare password ──
// userSchema.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// module.exports = mongoose.model('User', userSchema);



// backend/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },

    // ── Profile Info ──
    bio: { type: String, default: '' },

    // ✅ collegeName — set from College collection, NOT editable by user
    collegeName: { type: String, default: '' },
    collegeDomain: { type: String, default: '' },

    // Still editable fields
    department: { type: String, default: '' },
    session: { type: String, default: '' },
    skills: [{ type: String }],
    profilePicture: { type: String, default: '' },

    // ── Email Verification ──
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },

    // ── First login redirect flag ──
    isProfileComplete: { type: Boolean, default: false },

    // ── Connections ──
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    connectionRequestsSent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    connectionRequestsReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // ── Saved Posts ──
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  },
  { timestamps: true }
);

// ✅ Hash password
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);