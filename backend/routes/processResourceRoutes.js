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
  roleMiddleware('BOMAndSuppliers'), // Require 'BOMAndSuppliers' access
  processResourceController.createProcessResource
);

// Get all ProcessResources for a ManufacturingProcess
router.get(
  '/manufacturing-process/:manufacturingProcessId',
  authMiddleware,
  processResourceController.setProjectIdFromManufacturingProcess,
  roleMiddleware('BOMAndSuppliers'), // Require 'BOMAndSuppliers' access
  processResourceController.getProcessResourcesByManufacturingProcess
);

// Get a ProcessResource by ID
router.get('/:id', authMiddleware,  roleMiddleware('BOMAndSuppliers'), processResourceController.getProcessResourceById);

// Update a ProcessResource
router.put('/:id', authMiddleware,roleMiddleware('BOMAndSuppliers'), processResourceController.updateProcessResource);

// Delete a ProcessResource
router.delete('/:id', authMiddleware,roleMiddleware('BOMAndSuppliers'), processResourceController.deleteProcessResource);

module.exports = router;
