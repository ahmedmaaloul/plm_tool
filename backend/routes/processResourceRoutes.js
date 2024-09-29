const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const processResourceController = require('../controllers/processResourceController');

// Create a new ProcessResource
router.post(
  '/',
  authMiddleware,
  processResourceController.setProjectIdFromManufacturingProcess,
  roleMiddleware('editBOM'),
  processResourceController.createProcessResource
);

// Get all ProcessResources for a ManufacturingProcess
router.get(
  '/manufacturing-process/:manufacturingProcessId',
  authMiddleware,
  processResourceController.setProjectIdFromManufacturingProcess,
  roleMiddleware('viewBOM'),
  processResourceController.getProcessResourcesByManufacturingProcess
);

// Get a ProcessResource by ID
router.get('/:id', authMiddleware, processResourceController.getProcessResourceById);

// Update a ProcessResource
router.put('/:id', authMiddleware, processResourceController.updateProcessResource);

// Delete a ProcessResource
router.delete('/:id', authMiddleware, processResourceController.deleteProcessResource);

module.exports = router;
