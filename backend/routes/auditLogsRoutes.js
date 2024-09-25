// routes/auditLogRoutes.js

const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware'); // Middleware to check for fullAccess

// Get all audit logs (Admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const auditLogs = await AuditLog.find()
      .populate('user', 'username')
      .sort({ timestamp: -1 }); // Optional: Sort by timestamp descending
    res.json({ auditLogs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get audit logs for a specific user (Admin or the user themselves)
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // Allow access if the requesting user is the same as the userId or has full access
    if (req.user.userId !== userId && !req.user.fullAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const auditLogs = await AuditLog.find({ user: userId })
      .populate('user', 'username')
      .sort({ timestamp: -1 }); // Optional: Sort by timestamp descending

    res.json({ auditLogs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific audit log entry by ID (Admin only)
router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const auditLog = await AuditLog.findById(req.params.id).populate('user', 'username');
    if (!auditLog) {
      return res.status(404).json({ error: 'Audit log entry not found' });
    }
    res.json({ auditLog });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
