// backend/models/Post.js

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['project', 'job', 'review'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },

    // Project fields
    techStack: [{ type: String }],
    projectLink: { type: String, default: '' },
    githubLink: { type: String, default: '' },

    // Job fields
    companyName: { type: String, default: '' },
    jobRole: { type: String, default: '' },
    jobLocation: { type: String, default: '' },
    applyLink: { type: String, default: '' },

    // Review fields
    rating: { type: Number, min: 1, max: 5 },
    reviewCategory: {
      type: String,
      enum: ['college', 'course', 'teacher', 'other'],
      default: 'other',
    },

    // Media
    mediaUrl: { type: String, default: '' },
    mediaType: { type: String, enum: ['image', 'video', ''], default: '' },

    // Engagement
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    saves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tags: [{ type: String }],

    // Repost
    isRepost: { type: Boolean, default: false },
    repostedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    originalPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    repostCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);