const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const customerNeedController = require('../controllers/customerNeedController');
const setProjectIdsFromCustomerNeed = require('../middleware/setProjectIdsFromCustomerNeed');

// Create a new CustomerNeed
router.post(
  '/',
  authMiddleware,
  setProjectIdsFromCustomerNeed,
  roleMiddleware('manageCustomerNeeds'), // Requires role-based access
  customerNeedController.createCustomerNeed
);

// Get all CustomerNeeds
router.get(
  '/',
  authMiddleware,
  customerNeedController.getCustomerNeeds // No access control beyond authentication
);

// Get a CustomerNeed by ID
router.get(
  '/:id',
  authMiddleware,
  customerNeedController.getCustomerNeedById // No access control beyond authentication
);

// Update a CustomerNeed
router.put(
  '/:id',
  authMiddleware,
  setProjectIdsFromCustomerNeed,
  roleMiddleware('manageCustomerNeeds'), // Requires role-based access
  customerNeedController.updateCustomerNeed
);

// Delete a CustomerNeed
router.delete(
  '/:id',
  authMiddleware,
  setProjectIdsFromCustomerNeed,
  roleMiddleware('manageCustomerNeeds'), // Requires role-based access
  customerNeedController.deleteCustomerNeed
);

module.exports = router;
