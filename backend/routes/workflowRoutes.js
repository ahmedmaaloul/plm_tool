// routes/workflowRoutes.js

const express = require('express');
const router = express.Router();
const Workflow = require('../models/Workflow');
const Project = require('../models/Project');
const WorkflowStep = require('../models/WorkflowStep');
const AuditLog = require('../models/AuditLog');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Create a new Workflow
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Only the project creator or users with full access can create a workflow
    if (project.creator.toString() !== req.user.userId && !req.user.fullAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if the project already has a workflow
    const existingWorkflow = await Workflow.findOne({ project: projectId });
    if (existingWorkflow) {
      return res.status(400).json({ error: 'Workflow already exists for this project' });
    }

    const workflow = new Workflow({
      project: projectId,
    });

    await workflow.save();

    // Associate the workflow with the project
    project.workflow = workflow._id;
    await project.save();

    // Create an audit log entry
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
});

// Get a Workflow by Project ID
router.get('/project/:projectId', authMiddleware, roleMiddleware('viewWorkflow'), async (req, res) => {
  try {
    const { projectId } = req.params;

    const workflow = await Workflow.findOne({ project: projectId })
      .populate({
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
});

// Delete a Workflow
router.delete('/:id', authMiddleware, async (req, res) => {
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

    // Only the project creator or users with full access can delete the workflow
    if (project.creator.toString() !== req.user.userId && !req.user.fullAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete associated workflow steps
    await WorkflowStep.deleteMany({ workflow: workflow._id });

    // Remove workflow reference from project
    project.workflow = null;
    await project.save();

    await workflow.remove();

    // Create an audit log entry
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
});

module.exports = router;
