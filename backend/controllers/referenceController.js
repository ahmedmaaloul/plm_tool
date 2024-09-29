const Reference = require('../models/Reference');
const Product = require('../models/Product');
const Project = require('../models/Project');
const BOM = require('../models/BOM');
const AuditLog = require('../models/AuditLog');

// Create a new Reference
const createReference = async (req, res) => {
  try {
    const { code, description, productId, projectId, bomId } = req.body;

    if (!code || !productId) {
      return res.status(400).json({ error: 'Code and productId are required' });
    }

    const existingReference = await Reference.findOne({ code });
    if (existingReference) {
      return res.status(400).json({ error: 'Reference code already exists' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let project = null;
    if (projectId) {
      project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
    }

    let bom = null;
    if (bomId) {
      bom = await BOM.findById(bomId);
      if (!bom) {
        return res.status(404).json({ error: 'BOM not found' });
      }
    }

    const reference = new Reference({
      code,
      description,
      product: productId,
      project: projectId || null,
      bom: bomId || null,
    });

    await reference.save();

    product.references.push(reference._id);
    await product.save();

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
};

// Get all References (with optional filtering)
const getReferences = async (req, res) => {
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
};

// Get a Reference by ID
const getReferenceById = async (req, res) => {
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
};

// Update a Reference
const updateReference = async (req, res) => {
  try {
    const { code, description, productId, projectId, bomId } = req.body;

    const reference = await Reference.findById(req.params.id);
    if (!reference) {
      return res.status(404).json({ error: 'Reference not found' });
    }

    if (code && code !== reference.code) {
      const existingReference = await Reference.findOne({ code });
      if (existingReference && existingReference._id.toString() !== reference._id.toString()) {
        return res.status(400).json({ error: 'Reference code already exists' });
      }
      reference.code = code;
    }

    if (description) reference.description = description;

    if (productId && productId !== reference.product.toString()) {
      const newProduct = await Product.findById(productId);
      if (!newProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const oldProduct = await Product.findById(reference.product);
      if (oldProduct) {
        oldProduct.references.pull(reference._id);
        await oldProduct.save();
      }

      newProduct.references.push(reference._id);
      await newProduct.save();

      reference.product = productId;
    }

    if (projectId && projectId !== reference.project?.toString()) {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      reference.project = projectId;
    }

    if (bomId && bomId !== reference.bom?.toString()) {
      const bom = await BOM.findById(bomId);
      if (!bom) {
        return res.status(404).json({ error: 'BOM not found' });
      }
      reference.bom = bomId;
    }

    await reference.save();

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
};


// Delete a Reference
const deleteReference = async (req, res) => {
  try {
    const reference = await Reference.findById(req.params.id);
    if (!reference) {
      return res.status(404).json({ error: 'Reference not found' });
    }

    // **Delete associated BOM if it exists**
    if (reference.bom) {
      const bom = await BOM.findById(reference.bom);
      if (bom) {
        // Delete related manufacturing processes and their process resources
        const manufacturingProcesses = await ManufacturingProcess.find({ bom: bom._id });
        for (const process of manufacturingProcesses) {
          // Delete process resources associated with the manufacturing process
          await ProcessResource.deleteMany({ manufacturingProcess: process._id });
          // Delete the manufacturing process
          await process.remove();
        }

        // Delete BOM resources associated with the BOM
        await BOMResource.deleteMany({ bom: bom._id });

        // Delete the BOM
        await bom.remove();
      }
    }

    // Remove the reference from the product's references array
    const product = await Product.findById(reference.product);
    if (product) {
      product.references.pull(reference._id);
      await product.save();
    }

    // Delete the reference
    await reference.remove();

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Deleted reference: ${reference.code}`,
    });
    await auditLog.save();

    res.json({ message: 'Reference and associated BOM deleted successfully' });
  } catch (err) {
    console.error('Error deleting reference:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createReference,
  getReferences,
  getReferenceById,
  updateReference,
  deleteReference,
};
