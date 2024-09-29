const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const workflowStepController = require('../controllers/workflowStepController');
const Workflow = require('../models/Workflow');
const WorkflowStep = require('../models/WorkflowStep');

// Middleware to set projectId from Workflow or WorkflowStep
async function setProjectIdFromWorkflow(req, res, next) {
  try {
    const workflowId = req.body.workflowId || req.params.workflowId;
    const workflowStepId = req.params.id;

    let projectId = null;

    if (workflowId) {
      const workflow = await Workflow.findById(workflowId);
      if (!workflow) {
        return res.status(404).json({ error: 'Workflow not found' });
      }
      projectId = workflow.project.toString();
    } else if (workflowStepId) {
      const workflowStep = await WorkflowStep.findById(workflowStepId).populate('workflow');
      if (!workflowStep || !workflowStep.workflow) {
        return res.status(404).json({ error: 'WorkflowStep or associated Workflow not found' });
      }
      projectId = workflowStep.workflow.project.toString();
    } else {
      return res.status(400).json({ error: 'Workflow ID or WorkflowStep ID is required' });
    }

    // Set projectId in request params for access control
    req.params.projectId = projectId;

    next();
  } catch (err) {
    console.error('Error in setProjectIdFromWorkflow:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Add a Workflow Step
router.post(
  '/',
  authMiddleware,
  setProjectIdFromWorkflow,
  roleMiddleware('editWorkflow'),
  workflowStepController.addWorkflowStep
);

// Get Workflow Steps by Workflow ID
router.get(
  '/workflow/:workflowId',
  authMiddleware,
  setProjectIdFromWorkflow,
  roleMiddleware('viewWorkflow'),
  workflowStepController.getWorkflowStepsByWorkflowId
);

// Update a Workflow Step
router.put(
  '/:id',
  authMiddleware,
  setProjectIdFromWorkflow,
  roleMiddleware('editWorkflow'),
  workflowStepController.updateWorkflowStep
);

// Delete a Workflow Step
router.delete(
  '/:id',
  authMiddleware,
  setProjectIdFromWorkflow,
  roleMiddleware('editWorkflow'),
  workflowStepController.deleteWorkflowStep
);

module.exports = router;
