const Project = require('../models/Project');
const Role = require('../models/Role');
const Workflow = require('../models/Workflow');
const WorkflowStep = require('../models/WorkflowStep');
const Task = require('../models/Task');
const AuditLog = require('../models/AuditLog');

// Create a new project
const createProject = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const project = new Project({
      title,
      creator: req.user.userId,
    });

    await project.save();

    const projectCreatorRole = new Role({
      name: 'Project Creator',
      project: project._id,
      user: req.user.userId,
    });

    await projectCreatorRole.save();

    project.roles.push(projectCreatorRole._id);
    await project.save();

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
};

// Get all projects for the authenticated user
const getProjects = async (req, res) => {
  try {
    const userRoles = await Role.find({ user: req.user.userId });
    const userRoleIds = userRoles.map((role) => role._id);

    const projects = await Project.find({
      $or: [
        { creator: req.user.userId },
        { roles: { $in: userRoleIds } },
      ],
    }).populate('reference');

    res.json({ projects });
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a specific project by ID
const getProjectById = async (req, res) => {
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
};

// Update project details
const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, referenceId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.creator.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (title) project.title = title;
    if (referenceId) project.reference = referenceId;

    await project.save();

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
};

// Delete a project
const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).populate('workflow');
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.creator.toString() !== req.user.userId && !req.user.fullAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Role.deleteMany({ project: project._id });

    if (project.workflow) {
      const workflow = await Workflow.findById(project.workflow._id).populate('workflowSteps');

      if (workflow) {
        for (const step of workflow.workflowSteps) {
          await Task.deleteMany({ workflowStep: step._id });
        }

        await WorkflowStep.deleteMany({ workflow: workflow._id });
        await Workflow.findByIdAndDelete(workflow._id);
      }
    }

    await project.remove();

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
};

// Update required roles for an action
const updateRequiredRoles = async (req, res) => {
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

    if (project.creator.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    project.requiredRoles.set(action, roles);
    await project.save();

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
};

// Get required roles for a project
const getRequiredRoles = async (req, res) => {
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
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  updateRequiredRoles,
  getRequiredRoles,
};
