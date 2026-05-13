// backend/models/Chat.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    description: { type: String, default: '' },
    isGroup: { type: Boolean, default: false },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    groupImage: { type: String, default: '' },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chat', chatSchema);