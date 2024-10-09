// routes/workflowRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const workflowController = require('../controllers/workflowController');

// Create a new Workflow
router.post('/', authMiddleware, workflowController.createWorkflow);

// Get a Workflow by Project ID
router.get('/project/:projectId', authMiddleware, workflowController.getWorkflowByProjectId);

// Delete a Workflow
router.delete('/:id', authMiddleware, workflowController.deleteWorkflow);

module.exports = router;
