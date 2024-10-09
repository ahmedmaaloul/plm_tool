// middleware/roleMiddleware.js

const Role = require('../models/Role');

const roleMiddleware = (requiredAccessRight) => {
  return async (req, res, next) => {
    try {
      // Check if user has full access (admin)
      if (req.user.fullAccess) {
        return next();
      }

      // Get all roles assigned to the user
      const userRoles = await Role.find({ user: req.user.userId });

      // Check if any of the roles have the required access right
      const hasAccess = userRoles.some((role) =>
        role.accessRights.includes(requiredAccessRight)
      );

      if (hasAccess) {
        return next();
      } else {
        return res.status(403).json({ error: 'Access denied' });
      }
    } catch (err) {
      console.error('Error in roleMiddleware:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };
};

module.exports = roleMiddleware;
