// backend/models/Message.js

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, default: '' },
    mediaUrl: { type: String, default: '' },
    mediaType: { type: String, enum: ['image', 'video', 'pdf', ''], default: '' },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },

    // ✅ NEW FIELDS
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date, default: null },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // delete for me
    deletedForEveryone: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);