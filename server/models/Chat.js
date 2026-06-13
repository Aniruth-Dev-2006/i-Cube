const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['user', 'bot'], required: true },
  content: { type: String, required: true },
  confidence: { type: Number }
});

const chatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  messages: [messageSchema],
}, {
  timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema);
