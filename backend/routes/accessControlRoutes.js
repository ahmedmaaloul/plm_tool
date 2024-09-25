const express = require('express');
const router = express.Router();
const AccessControl = require('../models/AccessControl');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware'); // We'll define this middleware

// Get all access control entries (Admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const accessControls = await AccessControl.find().populate('user', 'username');
    res.json({ accessControls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get access control entry by user ID (Admin or the user themselves)
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // Allow access if the requesting user is the same as the userId or has full access
    if (req.user.userId !== userId && !req.user.fullAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const accessControl = await AccessControl.findOne({ user: userId }).populate('user', 'username');
    if (!accessControl) {
      return res.status(404).json({ error: 'Access control entry not found' });
    }
    res.json({ accessControl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create or update access control entry (Admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId, hasFullAccess } = req.body;

    // Validate input
    if (typeof hasFullAccess !== 'boolean') {
      return res.status(400).json({ error: 'hasFullAccess must be a boolean' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create or update AccessControl
    let accessControl = await AccessControl.findOne({ user: userId });
    if (accessControl) {
      accessControl.hasFullAccess = hasFullAccess;
      await accessControl.save();
    } else {
      accessControl = new AccessControl({
        user: userId,
        hasFullAccess,
      });
      await accessControl.save();
    }

    // Update user's fullAccess field
    user.fullAccess = hasFullAccess;
    await user.save();

    res.json({ message: 'Access control updated', accessControl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete access control entry (Admin only)
router.delete('/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent deleting own access control
    if (req.user.userId === userId) {
      return res.status(400).json({ error: 'Cannot delete your own access control' });
    }

    const accessControl = await AccessControl.findOneAndDelete({ user: userId });
    if (!accessControl) {
      return res.status(404).json({ error: 'Access control entry not found' });
    }

    // Update user's fullAccess field
    const user = await User.findById(userId);
    if (user) {
      user.fullAccess = false;
      await user.save();
    }

    res.json({ message: 'Access control entry deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
