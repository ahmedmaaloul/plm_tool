// routes/projectRoutes.js

const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Create a new project
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, referenceId } = req.body;

    if (!title || !referenceId) {
      return res.status(400).json({ error: 'Title and referenceId are required' });
    }

    // Create the project
    const project = new Project({
      title,
      reference: referenceId,
      creator: req.user.userId,
    });

    await project.save();

    // Assign 'Project Creator' role to the creator (optional)
    const projectCreatorRole = new Role({
      name: 'Project Creator',
      project: project._id,
      user: req.user.userId,
    });

    await projectCreatorRole.save();

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Created project: ${project.title}`,
    });
    await auditLog.save();

    res.status(201).json({ message: 'Project created successfully', project });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all projects for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Fetch projects where the user is the creator or has roles assigned
    const projects = await Project.find({
      $or: [
        { creator: req.user.userId },
        { 'roles.user': req.user.userId },
      ],
    }).populate('reference');

    res.json({ projects });
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific project by ID
router.get('/:projectId', authMiddleware, roleMiddleware('viewProject'), async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate('reference')
      .populate('roles');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project });
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update project details
router.put('/:projectId', authMiddleware, roleMiddleware('editProject'), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, referenceId } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Only the project creator can update project details
    if (project.creator.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update fields if provided
    if (title) project.title = title;
    if (referenceId) project.reference = referenceId;

    await project.save();

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Updated project: ${project.title}`,
    });
    await auditLog.save();

    res.json({ message: 'Project updated successfully', project });
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a project
router.delete('/:projectId', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Only the project creator or users with full access can delete the project
    if (project.creator.toString() !== req.user.userId && !req.user.fullAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await project.remove();

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Deleted project: ${project.title}`,
    });
    await auditLog.save();

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update required roles for an action
router.put('/:projectId/required-roles', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { action, roles } = req.body;

    if (!action || !Array.isArray(roles)) {
      return res.status(400).json({ error: 'Action and roles are required' });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Only the project creator can update required roles
    if (project.creator.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update required roles for the action
    project.requiredRoles.set(action, roles);
    await project.save();

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Updated required roles for action '${action}' in project: ${project.title}`,
    });
    await auditLog.save();

    res.json({ message: 'Required roles updated', requiredRoles: project.requiredRoles });
  } catch (err) {
    console.error('Error updating required roles:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get required roles for a project
router.get('/:projectId/required-roles', authMiddleware, roleMiddleware('viewProject'), async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ requiredRoles: project.requiredRoles });
  } catch (err) {
    console.error('Error fetching required roles:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
