const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const supplierController = require('../controllers/supplierController');
const setProjectIdsFromSupplier = require('../middleware/setProjectIdsFromSupplier');

// Create a new Supplier
router.post(
  '/',
  authMiddleware,
  roleMiddleware('BOMAndSuppliers'),
  supplierController.createSupplier
);

// Get all Suppliers
router.get(
  '/',
  authMiddleware,
  roleMiddleware('BOMAndSuppliers'),
  supplierController.getSuppliers
);

// Get a Supplier by ID
router.get(
  '/:id',
  authMiddleware,
  roleMiddleware('BOMAndSuppliers'),
  setProjectIdsFromSupplier, // Sets req.params.projectIds based on associated projects
  supplierController.getSupplierById
);

// Update a Supplier
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('BOMAndSuppliers'),
  supplierController.updateSupplier
);

// Delete a Supplier
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('BOMAndSuppliers'),
  supplierController.deleteSupplier
);

module.exports = router;
