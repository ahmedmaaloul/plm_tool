// controllers/resourceController.js

const Resource = require('../models/Resource');
const Supplier = require('../models/Supplier');
const BOMResource = require('../models/BOMResource');
const ProcessResource = require('../models/ProcessResource');
const AuditLog = require('../models/AuditLog');

// Create a new Resource
const createResource = async (req, res) => {
  try {
    const { name, type, description, unitCost, unitTime, unit, supplierId } = req.body;

    if (!name || !type || unitCost === undefined || !unit || !supplierId) {
      return res.status(400).json({ error: 'Name, type, unitCost, unit, and supplierId are required' });
    }

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const resource = new Resource({
      name,
      type,
      description,
      unitCost,
      unitTime: unitTime || 0,
      unit,
      supplier: supplierId,
    });

    await resource.save();

    // Add resource to supplier's resources array
    supplier.resources.push(resource._id);
    await supplier.save();

    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Created resource: ${resource.name}`,
    });
    await auditLog.save();

    res.status(201).json({ message: 'Resource created successfully', resource });
  } catch (err) {
    console.error('Error creating resource:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all Resources
const getResources = async (req, res) => {
  try {
    const resources = await Resource.find().populate('supplier', 'name');

    res.json({ resources });
  } catch (err) {
    console.error('Error fetching resources:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a Resource by ID
const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('supplier', 'name');

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json({ resource });
  } catch (err) {
    console.error('Error fetching resource:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a Resource
const updateResource = async (req, res) => {
  try {
    const { name, type, description, unitCost, unitTime, unit, supplierId } = req.body;

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    if (name) resource.name = name;
    if (type) resource.type = type;
    if (description) resource.description = description;
    if (unitCost !== undefined) resource.unitCost = unitCost;
    if (unitTime !== undefined) resource.unitTime = unitTime;
    if (unit) resource.unit = unit;

    // Handle supplier change
    if (supplierId && supplierId !== resource.supplier.toString()) {
      // Remove resource from old supplier's resources array
      const oldSupplier = await Supplier.findById(resource.supplier);
      if (oldSupplier) {
        oldSupplier.resources.pull(resource._id);
        await oldSupplier.save();
      }

      // Add resource to new supplier's resources array
      const newSupplier = await Supplier.findById(supplierId);
      if (!newSupplier) {
        return res.status(404).json({ error: 'New supplier not found' });
      }
      newSupplier.resources.push(resource._id);
      await newSupplier.save();

      resource.supplier = supplierId;
    }

    await resource.save();

    // Update BOMResources
    const bomResources = await BOMResource.find({ resource: resource._id });
    for (const bomResource of bomResources) {
      bomResource.totalCost = bomResource.quantity * resource.unitCost;
      bomResource.totalTime = bomResource.quantity * resource.unitTime;
      await bomResource.save();

      const BOM = require('../models/BOM');
      const bom = await BOM.findById(bomResource.bom);
      await bom.calculateTotals();
    }

    // Update ProcessResources
    const processResources = await ProcessResource.find({ resource: resource._id });
    for (const processResource of processResources) {
      processResource.totalCost = processResource.quantity * resource.unitCost;
      processResource.totalTime = processResource.quantity * resource.unitTime;
      await processResource.save();

      const ManufacturingProcess = require('../models/ManufacturingProcess');
      const manufacturingProcess = await ManufacturingProcess.findById(processResource.manufacturingProcess);
      await manufacturingProcess.calculateTotals();

      const BOM = require('../models/BOM');
      const bom = await BOM.findById(manufacturingProcess.bom);
      await bom.calculateTotals();
    }

    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Updated resource: ${resource.name}`,
    });
    await auditLog.save();

    res.json({ message: 'Resource updated successfully', resource });
  } catch (err) {
    console.error('Error updating resource:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a Resource
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const bomResources = await BOMResource.find({ resource: resource._id });
    const processResources = await ProcessResource.find({ resource: resource._id });

    if (bomResources.length > 0 || processResources.length > 0) {
      return res.status(400).json({ error: 'Cannot delete resource; it is associated with BOMs or Processes' });
    }

    // Remove resource from supplier's resources array
    const supplier = await Supplier.findById(resource.supplier);
    if (supplier) {
      supplier.resources.pull(resource._id);
      await supplier.save();
    }

    await resource.remove();

    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Deleted resource: ${resource.name}`,
    });
    await auditLog.save();

    res.json({ message: 'Resource deleted successfully' });
  } catch (err) {
    console.error('Error deleting resource:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource,
};
