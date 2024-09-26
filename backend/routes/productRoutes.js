// routes/productRoutes.js

const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Reference = require('../models/Reference');
const AuditLog = require('../models/AuditLog');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const setProjectIdFromReferenceMiddleware = require('../middleware/setProjectIdFromReferenceMiddleware');

// Middleware to set projectId from referenceId in the body or params


// Create a new Product
router.post('/', authMiddleware, roleMiddleware('manageProducts'), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: 'name and description are required' });
    }

    const product = new Product({
      name,
      description,
    });

    await product.save();

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Created product: ${name}`,
    });
    await auditLog.save();

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all Products
router.get('/', authMiddleware, roleMiddleware('viewProducts'), async (req, res) => {
  try {
    const products = await Product.find().populate('references', 'code');

    res.json({ products });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a Product by ID
router.get('/:id', authMiddleware, roleMiddleware('viewProducts'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('references', 'code');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a Product
router.put('/:id', authMiddleware, roleMiddleware('manageProducts'), async (req, res) => {
  try {
    const { name, description } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update fields if provided
    if (name) product.name = name;
    if (description) product.description = description;

    await product.save();

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Updated product: ${product.name}`,
    });
    await auditLog.save();

    res.json({ message: 'Product updated successfully', product });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a Product
router.delete('/:id', authMiddleware, roleMiddleware('manageProducts'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Optionally, handle deletion of associated references
    // Be cautious with cascading deletes

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Deleted product: ${product.name}`,
    });
    await auditLog.save();

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
