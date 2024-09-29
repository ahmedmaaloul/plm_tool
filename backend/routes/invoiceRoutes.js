const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const invoiceController = require('../controllers/invoiceController');
const Invoice = require('../models/Invoice');

/**
 * Middleware to set projectIds from Invoice
 * - For POST: get projectId from req.body.project
 * - For PUT/DELETE: get projectId from existing Invoice
 */
async function setProjectIdsFromInvoice(req, res, next) {
  try {
    let projectId = null;

    if (req.method === 'POST') {
      // For creating a new Invoice, get projectId from body
      projectId = req.body.project;
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required in the request body.' });
      }
    } else {
      // For updating or deleting an existing Invoice, get projectId from the Invoice
      const invoiceId = req.params.id;
      if (!invoiceId) {
        return res.status(400).json({ error: 'Invoice ID is required in the request parameters.' });
      }

      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found.' });
      }

      projectId = invoice.project.toString();
    }

    // Set projectIds in request params for roleMiddleware
    req.params.projectIds = [projectId];

    next();
  } catch (err) {
    console.error('Error in setProjectIdsFromInvoice:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

/**
 * Route Definitions
 */

// Create a new Invoice
router.post(
  '/',
  authMiddleware,
  setProjectIdsFromInvoice, // Sets req.params.projectIds
  roleMiddleware('manageInvoices'), // Checks if user can manage invoices for at least one project
  invoiceController.createInvoice
);

// Get all Invoices
router.get(
  '/',
  authMiddleware,
  invoiceController.getInvoices
);

// Get an Invoice by ID
router.get(
  '/:id',
  authMiddleware,
  invoiceController.getInvoiceById
);

// Update an Invoice
router.put(
  '/:id',
  authMiddleware,
  setProjectIdsFromInvoice, // Sets req.params.projectIds based on existing Invoice
  roleMiddleware('manageInvoices'), // Checks if user can manage invoices for at least one project
  invoiceController.updateInvoice
);

// Delete an Invoice
router.delete(
  '/:id',
  authMiddleware,
  setProjectIdsFromInvoice, // Sets req.params.projectIds based on existing Invoice
  roleMiddleware('manageInvoices'), // Checks if user can manage invoices for at least one project
  invoiceController.deleteInvoice
);

module.exports = router;
