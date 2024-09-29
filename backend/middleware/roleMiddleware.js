// middleware/roleMiddleware.js

const Role = require('../models/Role');
const Project = require('../models/Project');

const roleMiddleware = (action) => {
  return async (req, res, next) => {
    try {
      // Check if the user has fullAccess
      if (req.user.fullAccess) return next();

      // Get projectId or projectIds from request
      const projectId = req.params.projectId || req.body.projectId || req.query.projectId;
      const projectIds = req.params.projectIds || req.body.projectIds || req.query.projectIds;

      if (projectId) {
        // Single projectId
        const hasAccess = await checkUserAccessToProject(req.user, projectId, action);
        if (!hasAccess) {
          return res.status(403).json({ error: 'Access denied' });
        }
      } else if (projectIds && Array.isArray(projectIds) && projectIds.length > 0) {
        // Multiple projectIds
        let hasAccess = false;
        for (const pid of projectIds) {
          if (await checkUserAccessToProject(req.user, pid, action)) {
            hasAccess = true;
            break;
          }
        }
        if (!hasAccess) {
          return res.status(403).json({ error: 'Access denied' });
        }
      } else {
        // No projectId or projectIds provided
        return res.status(400).json({ error: 'Project ID is required' });
      }

      // User has required access
      next();
    } catch (err) {
      console.error('Error in roleMiddleware:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };
};

async function checkUserAccessToProject(user, projectId, action) {
  try {
    const project = await Project.findById(projectId);

    if (!project) {
      // Project not found
      return false;
    }

    // Check if the user is the project creator
    if (project.creator.toString() === user.userId) {
      return true;
    }

    // Get required roles for the action from the project
    const requiredRoles = project.requiredRoles.get(action) || [];

    // Get user's roles in the project
    const userRoles = await Role.find({ user: user.userId, project: projectId });
    const userRoleNames = userRoles.map((role) => role.name);

    // Check if the user has any of the required roles
    const hasRequiredRole = requiredRoles.some((role) => userRoleNames.includes(role));

    return hasRequiredRole;
  } catch (err) {
    console.error('Error in checkUserAccessToProject:', err);
    return false;
  }
}

module.exports = roleMiddleware;
