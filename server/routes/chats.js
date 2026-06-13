const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { protect } = require('../middleware/auth');

// @route   GET /api/chats
// @desc    Get all chats for a user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/chats
// @desc    Create or update a chat
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { _id, title, messages } = req.body;

    if (_id) {
      // Update existing chat
      const chat = await Chat.findOneAndUpdate(
        { _id, user: req.user._id },
        { title, messages, updatedAt: Date.now() },
        { new: true }
      );
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
      return res.json(chat);
    } else {
      // Create new chat
      const newChat = new Chat({
        user: req.user._id,
        title: title || 'New Chat',
        messages: messages || []
      });
      const chat = await newChat.save();
      return res.status(201).json(chat);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/chats/:id
// @desc    Delete a chat
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json({ message: 'Chat deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
