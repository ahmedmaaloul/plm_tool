const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const fullAccessMiddleware = require('../middleware/fullAccessMiddleware');
const customerController = require('../controllers/customerController');

// Create a new Customer
router.post(
  '/',
  authMiddleware,
  customerController.createCustomer
);

// Get all Customers
router.get(
  '/',
  authMiddleware,
  customerController.getCustomers
);

// Get a Customer by ID
router.get(
  '/:id',
  authMiddleware,
  customerController.getCustomerById
);

// Update a Customer
router.put(
  '/:id',
  authMiddleware,
  fullAccessMiddleware,
  customerController.updateCustomer
);

// Delete a Customer
router.delete(
  '/:id',
  authMiddleware,
  fullAccessMiddleware,
  customerController.deleteCustomer
);

module.exports = router;
