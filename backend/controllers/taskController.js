const Task = require('../models/Task');
const WorkflowStep = require('../models/WorkflowStep');
const Workflow = require('../models/Workflow');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');

// Middleware to set projectId from workflowStepId in the body
const setProjectIdFromWorkflowStep = async (req, res, next) => {
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
};

// Middleware to set projectId from taskId in the params
const setProjectIdFromTask = async (req, res, next) => {
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
};

// Middleware to set projectId from workflowStepId in the params
const setProjectIdFromWorkflowStepParam = async (req, res, next) => {
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
};

// Create a new Task
const createTask = async (req, res) => {
  try {
    const { description, workflowStepId, roleId, dueDate } = req.body;

    if (!description || !workflowStepId || !roleId) {
      return res.status(400).json({ error: 'description, workflowStepId, and roleId are required' });
    }

    const workflowStep = await WorkflowStep.findById(workflowStepId);

    const task = new Task({
      description,
      workflowStep: workflowStepId,
      role: roleId,
      dueDate,
    });

    await task.save();

    workflowStep.tasks.push(task._id);
    await workflowStep.save();

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
};

// Get Tasks by WorkflowStep ID
const getTasksByWorkflowStep = async (req, res) => {
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
};

// Update a Task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, status, dueDate } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (description) task.description = description;
    if (status) task.status = status;
    if (dueDate) task.dueDate = dueDate;

    await task.save();

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
};

// Delete a Task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id).populate('workflowStep');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const workflowStep = task.workflowStep;
    workflowStep.tasks.pull(task._id);
    await workflowStep.save();

    await task.remove();

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
};

// Get Tasks Assigned to the User
const getUserTasks = async (req, res) => {
  try {
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
};

module.exports = {
  setProjectIdFromWorkflowStep,
  setProjectIdFromTask,
  setProjectIdFromWorkflowStepParam,
  createTask,
  getTasksByWorkflowStep,
  updateTask,
  deleteTask,
  getUserTasks,
};
