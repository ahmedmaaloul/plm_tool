const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const setProjectIdsFromCustomerNeed = require('../middleware/setProjectIdsFromCustomerNeed');
const requirementController = require('../controllers/requirementController');

/**
 * Route Definitions
 */

// Create a new Requirement
router.post(
  '/',
  authMiddleware,
  setProjectIdsFromCustomerNeed, // Sets req.params.projectIds based on customerNeed
  roleMiddleware('manageRequirements'), // Requires role based on associated projects
  requirementController.createRequirement
);

// Get all Requirements
router.get(
  '/',
  authMiddleware,
  requirementController.getRequirements
);

// Get a Requirement by ID
router.get(
  '/:id',
  authMiddleware,
  setProjectIdsFromCustomerNeed, // Sets req.params.projectIds based on requirement
  roleMiddleware('viewRequirements'), // Requires role based on associated projects
  requirementController.getRequirementById
);

// Update a Requirement
router.put(
  '/:id',
  authMiddleware,
  setProjectIdsFromCustomerNeed, // Sets req.params.projectIds based on requirement
  roleMiddleware('manageRequirements'), // Requires role based on associated projects
  requirementController.updateRequirement
);

// Delete a Requirement
router.delete(
  '/:id',
  authMiddleware,
  setProjectIdsFromCustomerNeed, // Sets req.params.projectIds based on requirement
  roleMiddleware('manageRequirements'), // Requires role based on associated projects
  requirementController.deleteRequirement
);

module.exports = router;
