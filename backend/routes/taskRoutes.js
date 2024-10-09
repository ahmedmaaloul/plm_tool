const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const taskController = require('../controllers/taskController');

// Create a new Task
router.post(
  '/',
  authMiddleware,
  taskController.setProjectIdFromWorkflowStep,
  taskController.createTask
);

// Get Tasks by WorkflowStep ID
router.get(
  '/workflow-step/:workflowStepId',
  authMiddleware,
  taskController.setProjectIdFromWorkflowStepParam,
  taskController.getTasksByWorkflowStep
);

// Update a Task
router.put(
  '/:id',
  authMiddleware,
  taskController.setProjectIdFromTask,
  taskController.updateTask
);

// Delete a Task
router.delete(
  '/:id',
  authMiddleware,
  taskController.setProjectIdFromTask,
  taskController.deleteTask
);

// Get Tasks Assigned to the User
router.get('/my-tasks', authMiddleware, taskController.getUserTasks);

module.exports = router;
