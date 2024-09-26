const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const auditLogController = require('../controllers/auditLogController');

// Get all audit logs (Admin only)
router.get('/', authMiddleware, adminMiddleware, auditLogController.getAllAuditLogs);

// Get audit logs for a specific user (Admin or the user themselves)
router.get('/user/:userId', authMiddleware, auditLogController.getUserAuditLogs);

// Get a specific audit log entry by ID (Admin only)
router.get('/:id', authMiddleware, adminMiddleware, auditLogController.getAuditLogById);

module.exports = router;
