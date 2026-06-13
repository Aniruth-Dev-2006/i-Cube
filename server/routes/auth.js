const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const upload = require('../config/multer');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');

// Generate JWT function
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const user = await User.create({
      email,
      password,
      name
    });
    
    res.status(201).json({
      message: 'User created successfully',
      token: generateToken(user._id),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    res.json({
      message: 'Login successful',
      token: generateToken(user._id),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    // Generate JWT
    const token = generateToken(req.user._id);
    
    // Redirect with token
    res.redirect(`${process.env.CLIENT_URL}/chat?token=${token}`);
  }
);

// Logout route
router.post('/logout', (req, res) => {
  // Client handles token deletion, just send success
  res.json({ message: 'Logout successful' });
});

// Get current user route
router.get('/user', protect, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture
    }
  });
});

// Update profile route
router.put('/profile', protect, upload.single('picture'), async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user._id;

    if (email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const updateData = { name, email };
    
    if (req.file) {
      updateData.picture = `/uploads/profiles/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        picture: updatedUser.picture
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
