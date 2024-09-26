const AuditLog = require('../models/AuditLog');

// Get all audit logs (Admin only)
const getAllAuditLogs = async (req, res) => {
  try {
    const auditLogs = await AuditLog.find()
      .populate('user', 'username')
      .sort({ timestamp: -1 });
    res.json({ auditLogs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get audit logs for a specific user (Admin or the user themselves)
const getUserAuditLogs = async (req, res) => {
  try {
    const { userId } = req.params;

    // Allow access if the requesting user is the same as the userId or has full access
    if (req.user.userId !== userId && !req.user.fullAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const auditLogs = await AuditLog.find({ user: userId })
      .populate('user', 'username')
      .sort({ timestamp: -1 });

    res.json({ auditLogs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a specific audit log entry by ID (Admin only)
const getAuditLogById = async (req, res) => {
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
};

module.exports = {
  getAllAuditLogs,
  getUserAuditLogs,
  getAuditLogById,
};
