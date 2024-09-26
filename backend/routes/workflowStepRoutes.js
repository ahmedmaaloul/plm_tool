const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const workflowStepController = require('../controllers/workflowStepController');

// Add a Workflow Step
router.post('/', authMiddleware, roleMiddleware('editWorkflow'), workflowStepController.addWorkflowStep);

// Get Workflow Steps by Workflow ID
router.get('/workflow/:workflowId', authMiddleware, roleMiddleware('viewWorkflow'), workflowStepController.getWorkflowStepsByWorkflowId);

// Update a Workflow Step
router.put('/:id', authMiddleware, roleMiddleware('editWorkflow'), workflowStepController.updateWorkflowStep);

// Delete a Workflow Step
router.delete('/:id', authMiddleware, roleMiddleware('editWorkflow'), workflowStepController.deleteWorkflowStep);

module.exports = router;
