// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const WorkflowStep = require('../models/WorkflowStep');
const Workflow = require('../models/Workflow');
const Project = require('../models/Project');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Middleware to set projectId from workflowStepId in the body
async function setProjectIdFromWorkflowStep(req, res, next) {
  try {
    const { workflowStepId } = req.body;
    if (!workflowStepId) {
      return res.status(400).json({ error: 'workflowStepId is required' });
    }

    const workflowStep = await WorkflowStep.findById(workflowStepId);
    if (!workflowStep) {
      return res.status(404).json({ error: 'WorkflowStep not found' });
    }

    const workflow = await Workflow.findById(workflowStep.workflow);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const projectId = workflow.project.toString();
    req.params.projectId = projectId;
    next();
  } catch (err) {
    console.error('Error in setProjectIdFromWorkflowStep:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Middleware to set projectId from taskId in the params
async function setProjectIdFromTask(req, res, next) {
  try {
    const { id } = req.params; // taskId
    const task = await Task.findById(id).populate('workflowStep');
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const workflowStep = task.workflowStep;
    if (!workflowStep) {
      return res.status(404).json({ error: 'WorkflowStep not found' });
    }

    const workflow = await Workflow.findById(workflowStep.workflow);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const projectId = workflow.project.toString();
    req.params.projectId = projectId;
    next();
  } catch (err) {
    console.error('Error in setProjectIdFromTask:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Middleware to set projectId from workflowStepId in the params
async function setProjectIdFromWorkflowStepParam(req, res, next) {
  try {
    const { workflowStepId } = req.params;
    const workflowStep = await WorkflowStep.findById(workflowStepId);
    if (!workflowStep) {
      return res.status(404).json({ error: 'WorkflowStep not found' });
    }

    const workflow = await Workflow.findById(workflowStep.workflow);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const projectId = workflow.project.toString();
    req.params.projectId = projectId;
    next();
  } catch (err) {
    console.error('Error in setProjectIdFromWorkflowStepParam:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Create a new Task
router.post(
  '/',
  authMiddleware,
  setProjectIdFromWorkflowStep,
  roleMiddleware('manageTasks'),
  async (req, res) => {
    try {
      const { description, workflowStepId, roleId, dueDate } = req.body;

      if (!description || !workflowStepId || !roleId) {
        return res.status(400).json({ error: 'description, workflowStepId, and roleId are required' });
      }

      // Fetch WorkflowStep
      const workflowStep = await WorkflowStep.findById(workflowStepId);
      // No need to check again since middleware already did

      // Create the Task
      const task = new Task({
        description,
        workflowStep: workflowStepId,
        role: roleId,
        dueDate,
      });

      await task.save();

      // Add task to WorkflowStep
      workflowStep.tasks.push(task._id);
      await workflowStep.save();

      // Create an audit log entry
      const auditLog = new AuditLog({
        user: req.user.userId,
        action: `Created task: ${description}`,
      });
      await auditLog.save();

      res.status(201).json({ message: 'Task created successfully', task });
    } catch (err) {
      console.error('Error creating task:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get Tasks by WorkflowStep ID
router.get(
  '/workflow-step/:workflowStepId',
  authMiddleware,
  setProjectIdFromWorkflowStepParam,
  roleMiddleware('viewTasks'),
  async (req, res) => {
    try {
      const { workflowStepId } = req.params;

      const workflowStep = await WorkflowStep.findById(workflowStepId).populate({
        path: 'tasks',
        populate: { path: 'role', select: 'name' },
      });

      if (!workflowStep) {
        return res.status(404).json({ error: 'WorkflowStep not found' });
      }

      res.json({ tasks: workflowStep.tasks });
    } catch (err) {
      console.error('Error fetching tasks:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update a Task
router.put(
  '/:id',
  authMiddleware,
  setProjectIdFromTask,
  roleMiddleware('manageTasks'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { description, status, dueDate } = req.body;

      const task = await Task.findById(id);

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Update fields if provided
      if (description) task.description = description;
      if (status) task.status = status;
      if (dueDate) task.dueDate = dueDate;

      await task.save();

      // Create an audit log entry
      const auditLog = new AuditLog({
        user: req.user.userId,
        action: `Updated task: ${task.description}`,
      });
      await auditLog.save();

      res.json({ message: 'Task updated successfully', task });
    } catch (err) {
      console.error('Error updating task:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete a Task
router.delete(
  '/:id',
  authMiddleware,
  setProjectIdFromTask,
  roleMiddleware('manageTasks'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const task = await Task.findById(id).populate('workflowStep');

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const workflowStep = task.workflowStep;

      // Remove task from WorkflowStep
      workflowStep.tasks.pull(task._id);
      await workflowStep.save();

      await task.remove();

      // Create an audit log entry
      const auditLog = new AuditLog({
        user: req.user.userId,
        action: `Deleted task: ${task.description}`,
      });
      await auditLog.save();

      res.json({ message: 'Task deleted successfully' });
    } catch (err) {
      console.error('Error deleting task:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get Tasks Assigned to the User
router.get('/my-tasks', authMiddleware, async (req, res) => {
  try {
    // Fetch roles of the user
    const userRoles = await Role.find({ user: req.user.userId });
    const roleIds = userRoles.map((role) => role._id);

    const tasks = await Task.find({ role: { $in: roleIds } })
      .populate('workflowStep', 'name')
      .populate('role', 'name')
      .populate({
        path: 'workflowStep',
        populate: {
          path: 'workflow',
          populate: {
            path: 'project',
            select: 'title',
          },
        },
      });

    res.json({ tasks });
  } catch (err) {
    console.error('Error fetching user tasks:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
