const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const auditLogMiddleware = require('../middleware/auditLogMiddleware');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, password, fullAccess } = req.body;

    // Check if the username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ error: 'Username already exists' });

    // Create a new user
    const user = new User({
      username,
      passwordHash: password, // The password hashing is handled in the model's pre-save hook
      fullAccess: fullAccess || false,
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully', userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });
    if (!user)
      return res.status(400).json({ error: 'Invalid credentials' });

    // Use the checkPassword method from the User model
    const isMatch = await user.checkPassword(password);
    if (!isMatch)
      return res.status(400).json({ error: 'Invalid credentials' });

    // Create JWT payload
    const payload = {
      userId: user._id,
      fullAccess: user.fullAccess,
    };

    // Sign token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        fullAccess: user.fullAccess,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user)
      return res.status(404).json({ error: 'User not found' });

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findById(req.user.userId);
    if (!user)
      return res.status(404).json({ error: 'User not found' });

    // Track changes
    let changes = [];

    // Update username if provided
    if (username && username !== user.username) {
      // Check if the new username is already taken
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      changes.push(`Username changed from ${user.username} to ${username}`);
      user.username = username;
    }

    // Update password if provided
    if (password) {
      changes.push('Password updated');
      user.passwordHash = password; // The password hashing is handled in the model's pre-save hook
    }

    // Save changes if any
    if (changes.length > 0) {
      await user.save();

      // Create an audit log entry after successful update
      const auditLog = new AuditLog({
        user: req.user.userId,
        action: `Update Profile: ${changes.join('; ')}`,
      });
      await auditLog.save();

      res.json({ message: 'Profile updated successfully' });
    } else {
      res.status(400).json({ error: 'No changes provided' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user account
router.delete('/delete', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    await User.findByIdAndDelete(userId);

    // Create an audit log entry after successful deletion
    const auditLog = new AuditLog({
      user: userId,
      action: 'Deleted own account',
    });
    await auditLog.save();

    res.json({ message: 'User account deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Get all users (Admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Check if the user has full access
    if (!req.user.fullAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const users = await User.find().select('-passwordHash');
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
