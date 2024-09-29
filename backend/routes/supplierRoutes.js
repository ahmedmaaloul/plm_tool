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
  roleMiddleware('manageSuppliers'), // Requires manageSuppliers role or fullAccess
  supplierController.createSupplier
);

// Get all Suppliers
router.get(
  '/',
  authMiddleware,
  roleMiddleware('viewSuppliers'), // Requires viewSuppliers role or fullAccess
  supplierController.getSuppliers
);

// Get a Supplier by ID
router.get(
  '/:id',
  authMiddleware,
  setProjectIdsFromSupplier, // Sets req.params.projectIds based on associated projects
  roleMiddleware('viewSuppliers'), // Requires viewSuppliers role for at least one associated project
  supplierController.getSupplierById
);

// Update a Supplier
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('manageSuppliers'), // Requires manageSuppliers role or fullAccess
  supplierController.updateSupplier
);

// Delete a Supplier
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('manageSuppliers'), // Requires manageSuppliers role or fullAccess
  supplierController.deleteSupplier
);

module.exports = router;
