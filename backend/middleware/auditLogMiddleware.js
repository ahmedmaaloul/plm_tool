// middleware/auditLogMiddleware.js

const AuditLog = require('../models/AuditLog');

const auditLogMiddleware = (actionDescription) => {
  return async (req, res, next) => {
    await next();

    // After the route handler completes, create an audit log
    try {
      const userId = req.user ? req.user.userId : null;
      const auditLog = new AuditLog({
        user: userId,
        action: actionDescription,
      });
      await auditLog.save();
    } catch (err) {
      console.error('Error creating audit log:', err);
      // You might choose to handle this error differently
    }
  };
};

module.exports = auditLogMiddleware;
