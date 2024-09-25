// routes/referenceRoutes.js

const express = require('express');
const router = express.Router();
const Reference = require('../models/Reference');
const Product = require('../models/Product');
const Project = require('../models/Project');
const BOM = require('../models/BOM');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const AuditLog = require('../models/AuditLog');

// Create a new Reference
router.post('/', authMiddleware, roleMiddleware('createReference'), async (req, res) => {
  try {
    const {
      code,
      description,
      productId,
      projectId,
      bomId,
    } = req.body;

    if (!code || !productId) {
      return res.status(400).json({ error: 'Code and productId are required' });
    }

    // Check if the code is unique
    const existingReference = await Reference.findOne({ code });
    if (existingReference) {
      return res.status(400).json({ error: 'Reference code already exists' });
    }

    // Verify that the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // If projectId is provided, verify that the project exists
    let project = null;
    if (projectId) {
      project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
    }

    // If bomId is provided, verify that the BOM exists
    let bom = null;
    if (bomId) {
      bom = await BOM.findById(bomId);
      if (!bom) {
        return res.status(404).json({ error: 'BOM not found' });
      }
    }

    // Create the reference
    const reference = new Reference({
      code,
      description,
      product: productId,
      project: projectId || null,
      bom: bomId || null,
    });

    await reference.save();

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Created reference: ${reference.code}`,
    });
    await auditLog.save();

    res.status(201).json({ message: 'Reference created successfully', reference });
  } catch (err) {
    console.error('Error creating reference:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all References (with optional filtering)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { productId, projectId } = req.query;

    const filter = {};
    if (productId) filter.product = productId;
    if (projectId) filter.project = projectId;

    const references = await Reference.find(filter)
      .populate('product', 'name')
      .populate('project', 'title')
      .populate('bom', 'name')
      .populate('cadFiles', 'filename')
      .populate('documents', 'filename')
      .populate('simulations', 'name');

    res.json({ references });
  } catch (err) {
    console.error('Error fetching references:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a Reference by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const reference = await Reference.findById(req.params.id)
      .populate('product', 'name')
      .populate('project', 'title')
      .populate('bom', 'name')
      .populate('cadFiles', 'filename')
      .populate('documents', 'filename')
      .populate('simulations', 'name');

    if (!reference) {
      return res.status(404).json({ error: 'Reference not found' });
    }

    res.json({ reference });
  } catch (err) {
    console.error('Error fetching reference:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a Reference
router.put('/:id', authMiddleware,roleMiddleware('updateReference'), async (req, res) => {
  try {
    const { code, description, productId, projectId, bomId } = req.body;

    const reference = await Reference.findById(req.params.id);
    if (!reference) {
      return res.status(404).json({ error: 'Reference not found' });
    }

    // Update fields if provided
    if (code && code !== reference.code) {
      // Check if the new code is unique
      const existingReference = await Reference.findOne({ code });
      if (existingReference && existingReference._id.toString() !== reference._id.toString()) {
        return res.status(400).json({ error: 'Reference code already exists' });
      }
      reference.code = code;
    }

    if (description) reference.description = description;

    if (productId && productId !== reference.product.toString()) {
      // Verify that the product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      reference.product = productId;
    }

    if (projectId && projectId !== reference.project?.toString()) {
      // Verify that the project exists
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      reference.project = projectId;
    }

    if (bomId && bomId !== reference.bom?.toString()) {
      // Verify that the BOM exists
      const bom = await BOM.findById(bomId);
      if (!bom) {
        return res.status(404).json({ error: 'BOM not found' });
      }
      reference.bom = bomId;
    }

    await reference.save();

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Updated reference: ${reference.code}`,
    });
    await auditLog.save();

    res.json({ message: 'Reference updated successfully', reference });
  } catch (err) {
    console.error('Error updating reference:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a Reference
router.delete('/:id', authMiddleware,roleMiddleware('deleteReference'), async (req, res) => {
  try {
    const reference = await Reference.findByIdAndDelete(req.params.id);

    if (!reference) {
      return res.status(404).json({ error: 'Reference not found' });
    }

    // Optionally, handle deletion of associated documents, files, simulations
    // Note: Be cautious with cascading deletes

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Deleted reference: ${reference.code}`,
    });
    await auditLog.save();

    res.json({ message: 'Reference deleted successfully' });
  } catch (err) {
    console.error('Error deleting reference:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
