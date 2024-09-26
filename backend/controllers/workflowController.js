const Workflow = require('../models/Workflow');
const Project = require('../models/Project');
const WorkflowStep = require('../models/WorkflowStep');
const AuditLog = require('../models/AuditLog');

// Create a new Workflow
const createWorkflow = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.creator.toString() !== req.user.userId && !req.user.fullAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const existingWorkflow = await Workflow.findOne({ project: projectId });
    if (existingWorkflow) {
      return res.status(400).json({ error: 'Workflow already exists for this project' });
    }

    const workflow = new Workflow({ project: projectId });
    await workflow.save();

    project.workflow = workflow._id;
    await project.save();

    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Created workflow for project '${project.title}'`,
    });
    await auditLog.save();

    res.status(201).json({ message: 'Workflow created successfully', workflow });
  } catch (err) {
    console.error('Error creating workflow:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a Workflow by Project ID
const getWorkflowByProjectId = async (req, res) => {
  try {
    const { projectId } = req.params;

    const workflow = await Workflow.findOne({ project: projectId }).populate({
      path: 'workflowSteps',
      options: { sort: { order: 1 } },
    });

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found for this project' });
    }

    res.json({ workflow });
  } catch (err) {
    console.error('Error fetching workflow:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a Workflow
const deleteWorkflow = async (req, res) => {
  try {
    const { id } = req.params;

    const workflow = await Workflow.findById(id);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const project = await Project.findById(workflow.project);
    if (!project) {
      return res.status(404).json({ error: 'Associated project not found' });
    }

    if (project.creator.toString() !== req.user.userId && !req.user.fullAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await WorkflowStep.deleteMany({ workflow: workflow._id });

    project.workflow = null;
    await project.save();

    await workflow.remove();

    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Deleted workflow for project '${project.title}'`,
    });
    await auditLog.save();

    res.json({ message: 'Workflow deleted successfully' });
  } catch (err) {
    console.error('Error deleting workflow:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createWorkflow,
  getWorkflowByProjectId,
  deleteWorkflow,
};
