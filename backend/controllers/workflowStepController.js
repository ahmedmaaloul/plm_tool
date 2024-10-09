const Workflow = require('../models/Workflow');
const WorkflowStep = require('../models/WorkflowStep');
const Task = require('../models/Task');
const AuditLog = require('../models/AuditLog');

// Add a Workflow Step
const addWorkflowStep = async (req, res) => {
  try {
    const { workflowId, name, order } = req.body;

    if (!workflowId || !name || typeof order !== 'number') {
      return res.status(400).json({ error: 'workflowId, name, and order are required' });
    }

    const workflow = await Workflow.findById(workflowId);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const workflowStep = new WorkflowStep({
      name,
      order,
      workflow: workflowId,
    });

    await workflowStep.save();

    workflow.workflowSteps.push(workflowStep._id);
    await workflow.save();

    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Added workflow step '${name}' to workflow '${workflow.name}'`,
    });
    await auditLog.save();

    res.status(201).json({ message: 'Workflow step added successfully', workflowStep });
  } catch (err) {
    console.error('Error adding workflow step:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get Workflow Steps by Workflow ID
const getWorkflowStepsByWorkflowId = async (req, res) => {
  try {
    const { workflowId } = req.params;

    const workflow = await Workflow.findById(workflowId).populate({
      path: 'workflowSteps',
      options: { sort: { order: 1 } },
    });

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json({ workflowSteps: workflow.workflowSteps });
  } catch (err) {
    console.error('Error fetching workflow steps:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a Workflow Step
const updateWorkflowStep = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, order } = req.body;

    const workflowStep = await WorkflowStep.findById(id);
    if (!workflowStep) {
      return res.status(404).json({ error: 'Workflow step not found' });
    }

    // Update fields if provided
    if (name) workflowStep.name = name;
    if (typeof order === 'number') workflowStep.order = order;

    await workflowStep.save();

    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Updated workflow step '${workflowStep.name}'`,
    });
    await auditLog.save();

    res.json({ message: 'Workflow step updated successfully', workflowStep });
  } catch (err) {
    console.error('Error updating workflow step:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a Workflow Step
const deleteWorkflowStep = async (req, res) => {
  try {
    const { id } = req.params;

    const workflowStep = await WorkflowStep.findById(id);
    if (!workflowStep) {
      return res.status(404).json({ error: 'Workflow step not found' });
    }

    // Delete associated tasks
    await Task.deleteMany({ workflowStep: workflowStep._id });

    // Remove the workflow step from the workflow's steps array
    const workflow = await Workflow.findById(workflowStep.workflow);
    if (workflow) {
      workflow.workflowSteps.pull(workflowStep._id);
      await workflow.save();
    }

    // Remove the workflow step
    await workflowStep.deleteOne();

    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Deleted workflow step '${workflowStep.name}'`,
    });
    await auditLog.save();

    res.json({ message: 'Workflow step and associated tasks deleted successfully' });
  } catch (err) {
    console.error('Error deleting workflow step:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  addWorkflowStep,
  getWorkflowStepsByWorkflowId,
  updateWorkflowStep,
  deleteWorkflowStep,
};
