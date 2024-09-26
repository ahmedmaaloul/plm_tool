const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const taskController = require('../controllers/taskController');

// Create a new Task
router.post('/', authMiddleware, roleMiddleware('manageTasks'), taskController.createTask);

// Get Tasks by WorkflowStep ID
router.get('/workflow-step/:workflowStepId', authMiddleware, roleMiddleware('viewTasks'), taskController.getTasksByWorkflowStep);

// Update a Task
router.put('/:id', authMiddleware, roleMiddleware('manageTasks'), taskController.updateTask);

// Delete a Task
router.delete('/:id', authMiddleware, roleMiddleware('manageTasks'), taskController.deleteTask);

// Get Tasks Assigned to the User
router.get('/my-tasks', authMiddleware, taskController.getUserTasks);

module.exports = router;
