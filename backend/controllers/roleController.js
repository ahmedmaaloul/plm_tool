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

    if (project.creator.toString() !== req.user.userId && !req.user.fullAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingRole = await Role.findOne({ user: userId, project: projectId, name: roleName });
    if (existingRole) {
      return res.status(400).json({ error: 'User already has this role in the project' });
    }

    const role = new Role({
      name: roleName,
      project: projectId,
      user: userId,
    });

    await role.save();

    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Assigned role '${roleName}' to user '${user.username}' in project '${project.title}'`,
    });
    await auditLog.save();

    res.status(201).json({ message: 'Role assigned successfully', role });
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

    if (project.creator.toString() !== req.user.userId && !req.user.fullAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const role = await Role.findOneAndDelete({ user: userId, project: projectId, name: roleName });
    if (!role) {
      return res.status(404).json({ error: 'Role not found for the user in this project' });
    }

    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Removed role '${roleName}' from user '${role.user}' in project '${project.title}'`,
    });
    await auditLog.save();

    res.json({ message: 'Role removed successfully' });
  } catch (err) {
    console.error('Error removing role:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all roles for a project
const getProjectRoles = async (req, res) => {
  try {
    const { projectId } = req.params;

    const roles = await Role.find({ project: projectId })
      .populate('user', 'username')
      .select('name user');

    res.json({ roles });
  } catch (err) {
    console.error('Error fetching roles:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all roles for a user in a project
const getUserRolesInProject = async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    const roles = await Role.find({ project: projectId, user: userId })
      .select('name');

    res.json({ roles });
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
};
