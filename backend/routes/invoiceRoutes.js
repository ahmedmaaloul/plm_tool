const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const invoiceController = require('../controllers/invoiceController');
const Invoice = require('../models/Invoice');

// Middleware for project ID extraction
async function setProjectIdsFromInvoice(req, res, next) {
  try {
    let projectId = null;

    if (req.method === 'POST') {
      projectId = req.body.project;
    } else {
      const invoiceId = req.params.id;
      const invoice = await Invoice.findById(invoiceId);
      projectId = invoice.project.toString();
    }

    req.params.projectIds = [projectId];
    next();
  } catch (err) {
    console.error('Error in setProjectIdsFromInvoice:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Create a new Invoice
router.post(
  '/',
  authMiddleware,
  roleMiddleware('manageInvoices'),
  invoiceController.createInvoice
);

// Get all Invoices
router.get('/', authMiddleware, invoiceController.getInvoices);

// Get an Invoice by ID
router.get('/:id', authMiddleware, invoiceController.getInvoiceById);

// Update an Invoice
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('manageInvoices'),
  invoiceController.updateInvoice
);

// Delete an Invoice
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('manageInvoices'),
  invoiceController.deleteInvoice
);

// Download an Invoice PDF
router.get('/download/:id', authMiddleware, invoiceController.downloadInvoice);

module.exports = router;
