// routes/workflowStepRoutes.js

const express = require('express');
const router = express.Router();
const Workflow = require('../models/Workflow');
const WorkflowStep = require('../models/WorkflowStep');
const Project = require('../models/Project');
const AuditLog = require('../models/AuditLog');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Add a Workflow Step
router.post('/', authMiddleware, roleMiddleware('editWorkflow'), async (req, res) => {
  try {
    const { workflowId, name, order } = req.body;

    if (!workflowId || !name || typeof order !== 'number') {
      return res.status(400).json({ error: 'workflowId, name, and order are required' });
    }

    const workflow = await Workflow.findById(workflowId);

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    // Get the associated project
    const project = await Project.findById(workflow.project);

    if (!project) {
      return res.status(404).json({ error: 'Associated project not found' });
    }

    // Apply access control using projectId
    req.params.projectId = project._id.toString();

    // Create the workflow step
    const workflowStep = new WorkflowStep({
      name,
      order,
      workflow: workflowId,
    });

    await workflowStep.save();

    // Add the step to the workflow
    workflow.workflowSteps.push(workflowStep._id);
    await workflow.save();

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Added workflow step '${name}' to workflow in project '${project.title}'`,
    });
    await auditLog.save();

    res.status(201).json({ message: 'Workflow step added successfully', workflowStep });
  } catch (err) {
    console.error('Error adding workflow step:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Workflow Steps by Workflow ID
router.get('/workflow/:workflowId', authMiddleware, roleMiddleware('viewWorkflow'), async (req, res) => {
  try {
    const { workflowId } = req.params;

    const workflow = await Workflow.findById(workflowId)
      .populate({
        path: 'workflowSteps',
        options: { sort: { order: 1 } },
      });

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    // Get the associated project
    const project = await Project.findById(workflow.project);

    if (!project) {
      return res.status(404).json({ error: 'Associated project not found' });
    }

    // Apply access control using projectId
    req.params.projectId = project._id.toString();

    res.json({ workflowSteps: workflow.workflowSteps });
  } catch (err) {
    console.error('Error fetching workflow steps:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a Workflow Step
router.put('/:id', authMiddleware, roleMiddleware('editWorkflow'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, order } = req.body;

    const workflowStep = await WorkflowStep.findById(id);

    if (!workflowStep) {
      return res.status(404).json({ error: 'Workflow step not found' });
    }

    const workflow = await Workflow.findById(workflowStep.workflow);

    if (!workflow) {
      return res.status(404).json({ error: 'Associated workflow not found' });
    }

    const project = await Project.findById(workflow.project);

    if (!project) {
      return res.status(404).json({ error: 'Associated project not found' });
    }

    // Apply access control using projectId
    req.params.projectId = project._id.toString();

    // Update fields if provided
    if (name) workflowStep.name = name;
    if (typeof order === 'number') workflowStep.order = order;

    await workflowStep.save();

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Updated workflow step '${workflowStep.name}' in project '${project.title}'`,
    });
    await auditLog.save();

    res.json({ message: 'Workflow step updated successfully', workflowStep });
  } catch (err) {
    console.error('Error updating workflow step:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a Workflow Step
router.delete('/:id', authMiddleware, roleMiddleware('editWorkflow'), async (req, res) => {
  try {
    const { id } = req.params;

    const workflowStep = await WorkflowStep.findById(id);

    if (!workflowStep) {
      return res.status(404).json({ error: 'Workflow step not found' });
    }

    const workflow = await Workflow.findById(workflowStep.workflow);

    if (!workflow) {
      return res.status(404).json({ error: 'Associated workflow not found' });
    }

    const project = await Project.findById(workflow.project);

    if (!project) {
      return res.status(404).json({ error: 'Associated project not found' });
    }

    // Apply access control using projectId
    req.params.projectId = project._id.toString();

    // Remove the step from the workflow
    workflow.workflowSteps.pull(workflowStep._id);
    await workflow.save();

    await workflowStep.remove();

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Deleted workflow step '${workflowStep.name}' from project '${project.title}'`,
    });
    await auditLog.save();

    res.json({ message: 'Workflow step deleted successfully' });
  } catch (err) {
    console.error('Error deleting workflow step:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
