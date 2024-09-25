// middleware/roleMiddleware.js

const Role = require('../models/Role');
const Project = require('../models/Project');

const roleMiddleware = (action) => {
  return async (req, res, next) => {
    try {
      if (req.user.fullAccess) return next();

      const projectId = req.params.projectId || req.body.projectId || req.query.projectId;

      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
      }

      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Check if the user is the project creator
      if (project.creator.toString() === req.user.userId) {
        return next();
      }

      // Get required roles for the action from the project
      const requiredRoles = project.requiredRoles.get(action) || [];

      // Get user's roles in the project
      const userRoles = await Role.find({ user: req.user.userId, project: projectId });
      const userRoleNames = userRoles.map((role) => role.name);

      // Check if the user has any of the required roles
      const hasRequiredRole = requiredRoles.some((role) => userRoleNames.includes(role));
      if (!hasRequiredRole) {
        return res.status(403).json({ error: 'Access denied' });
      }

      next();
    } catch (err) {
      console.error('Error in roleMiddleware:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };
};

module.exports = roleMiddleware;
