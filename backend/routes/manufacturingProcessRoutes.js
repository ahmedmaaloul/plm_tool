// routes/manufacturingProcessRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const manufacturingProcessController = require('../controllers/manufacturingProcessController');
const BOM = require('../models/BOM');
const ManufacturingProcess = require('../models/ManufacturingProcess');

// Middleware to set projectId from BOM or ManufacturingProcess
async function setProjectIdFromBOM(req, res, next) {
  try {
    const bomId = req.body.bomId || req.params.bomId;
    const manufacturingProcessId = req.params.id;

    let bom;

    if (bomId) {
      // If bomId is available, find the BOM
      bom = await BOM.findById(bomId).populate('reference', 'project');
    } else if (manufacturingProcessId) {
      // If manufacturingProcessId is available, find the ManufacturingProcess and then its BOM
      const manufacturingProcess = await ManufacturingProcess.findById(manufacturingProcessId);
      if (!manufacturingProcess) {
        return res.status(404).json({ error: 'Manufacturing process not found' });
      }
      bom = await BOM.findById(manufacturingProcess.bom).populate('reference', 'project');
    }

    if (!bom) {
      return res.status(404).json({ error: 'BOM not found' });
    }

    if (!bom.reference || !bom.reference.project) {
      return res.status(400).json({ error: 'BOM is not associated with a project' });
    }

    // Set projectId in request params for access control
    req.params.projectId = bom.reference.project.toString();
    next();
  } catch (err) {
    console.error('Error in setProjectIdFromBOM:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Create a new ManufacturingProcess
router.post(
  '/',
  authMiddleware,
  setProjectIdFromBOM,
  roleMiddleware('BOMAndSuppliers'), // Require 'BOMAndSuppliers' access
  manufacturingProcessController.createManufacturingProcess
);

// Get all ManufacturingProcesses for a BOM
router.get(
  '/bom/:bomId',
  authMiddleware,
  setProjectIdFromBOM,
  roleMiddleware('BOMAndSuppliers'), // Require 'BOMAndSuppliers' access
  manufacturingProcessController.getManufacturingProcessesByBOM
);

// Get a ManufacturingProcess by ID
router.get(
  '/:id',
  authMiddleware,
  setProjectIdFromBOM,
  roleMiddleware('BOMAndSuppliers'), // Require 'BOMAndSuppliers' access
  manufacturingProcessController.getManufacturingProcessById
);

// Update a ManufacturingProcess
router.put(
  '/:id',
  authMiddleware,
  setProjectIdFromBOM,
  roleMiddleware('BOMAndSuppliers'), // Require 'BOMAndSuppliers' access
  manufacturingProcessController.updateManufacturingProcess
);

// Delete a ManufacturingProcess
router.delete(
  '/:id',
  authMiddleware,
  setProjectIdFromBOM,
  roleMiddleware('BOMAndSuppliers'), // Require 'BOMAndSuppliers' access
  manufacturingProcessController.deleteManufacturingProcess
);

module.exports = router;
