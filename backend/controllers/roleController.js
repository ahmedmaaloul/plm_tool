const Role = require('../models/Role');
const Project = require('../models/Project');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');



// Assign a role to a user
const assignRole = async (req, res) => {
  try {
    const { userId, projectId, roleName } = req.body;

    if (!userId || !projectId || !roleName) {
      return res.status(400).json({ error: 'userId, projectId, and roleName are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Only the project creator or users with full access can assign roles
    if (project.creator.toString() !== req.user.userId && !req.user.fullAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the existing role in the project
    const role = await Role.findOne({ name: roleName, project: projectId });
    if (!role) {
      return res.status(404).json({ error: 'Role not found in the project' });
    }

    // Check if the role is already assigned to a user
    if (role.user) {
      return res.status(400).json({ error: 'Role is already assigned to a user' });
    }

    // Assign the userId to the role's user property
    role.user = userId;
    await role.save();

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Assigned role '${roleName}' to user '${user.username}' in project '${project.title}'`,
    });
    await auditLog.save();

    res.status(200).json({ message: 'Role assigned successfully', role });
  } catch (err) {
    console.error('Error assigning role:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Remove a role from a user
const removeRole = async (req, res) => {
  try {
    const { userId, projectId, roleName } = req.body;

    if (!userId || !projectId || !roleName) {
      return res.status(400).json({ error: 'userId, projectId, and roleName are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Only the project creator or users with full access can remove roles
    if (project.creator.toString() !== req.user.userId && !req.user.fullAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const role = await Role.findOneAndDelete({ user: userId, project: projectId, name: roleName });
    if (!role) {
      return res.status(404).json({ error: 'Role not found for the user in this project' });
    }

    // Remove the role from the project's roles array
    project.roles.pull(role._id);
    await project.save();

    const user = await User.findById(userId);

    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Removed role '${roleName}' from user '${user.username}' in project '${project.title}'`,
    });
    await auditLog.save();

    res.json({ message: 'Role removed successfully' });
  } catch (err) {
    console.error('Error removing role:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// controllers/roleController.js

// Get all roles for a project
const getProjectRoles = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ error: 'No projectId provided' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const roles = await Role.find({ project: projectId })
      .populate('user', 'username')
      .select('name user accessRights');

    res.json({ roles });
  } catch (err) {
    console.error('Error fetching roles:', err);
    res.status(500).json({ error: 'Server error' });
  }
};



// controllers/roleController.js

// Get all roles for a user in a project
const getUserRolesInProject = async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const roles = await Role.find({ project: projectId, user: userId }).select('name accessRights');

    res.json({ roles });
  } catch (err) {
    console.error('Error fetching user roles:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


// controllers/roleController.js

// Create a new role for a project
const createRole = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { roleName, accessRights } = req.body;

    if (!roleName) {
      return res.status(400).json({ error: 'Role name is required' });
    }

    if (!Array.isArray(accessRights) || accessRights.length === 0) {
      return res.status(400).json({ error: 'Access rights are required and should be an array' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Only the project creator or users with full access can create roles
    if (project.creator.toString() !== req.user.userId && !req.user.fullAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if role already exists
    const existingRole = await Role.findOne({ project: projectId, name: roleName });
    if (existingRole) {
      return res.status(400).json({ error: 'Role already exists in the project' });
    }

    const role = new Role({
      name: roleName,
      project: projectId,
      accessRights,
    });

    await role.save();

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Created role '${roleName}' in project '${project.title}' with access rights: ${accessRights.join(', ')}`,
    });
    await auditLog.save();

    res.status(201).json({ message: 'Role created successfully', role });
  } catch (err) {
    console.error('Error creating role:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
// Get all roles for a user
const getUserRoles = async (req, res) => {
  try {
    const { userId } = req.params;

    // Only allow users to fetch their own roles or admins to fetch any user's roles
    if (req.user.userId !== userId && !req.user.fullAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate that the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch roles assigned to the user
    const roles = await Role.find({ user: userId }).select('name accessRights');

    res.status(200).json({ roles });
  } catch (err) {
    console.error('Error fetching user roles:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


module.exports = {
  assignRole,
  removeRole,
  getProjectRoles,
  getUserRolesInProject,
  createRole, // Add the new function here
  getUserRoles
};

