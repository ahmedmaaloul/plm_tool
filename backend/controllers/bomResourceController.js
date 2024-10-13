// controllers/bomResourceController.js

const BOMResource = require('../models/BOMResource');
const BOM = require('../models/BOM');
const Resource = require('../models/Resource');
const AuditLog = require('../models/AuditLog');

// Create a new BOMResource
const createBOMResource = async (req, res) => {
  try {
    const { bomId, resourceId, quantity } = req.body;

    if (!bomId || !resourceId || typeof quantity !== 'number') {
      return res.status(400).json({ error: 'bomId, resourceId, and quantity are required' });
    }

    const bom = await BOM.findById(bomId);
    if (!bom) {
      return res.status(404).json({ error: 'BOM not found' });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Calculate totalCost and totalTime
    const totalCost = quantity * resource.unitCost;
    const totalTime = quantity * resource.unitTime;

    const bomResource = new BOMResource({
      bom: bomId,
      resource: resourceId,
      quantity,
      totalCost,
      totalTime,
    });

    await bomResource.save();

    // Add bomResource to BOM and Resource
    bom.bomResources.push(bomResource._id);
    await bom.save();

    resource.bomResources.push(bomResource._id);
    await resource.save();

    // Recalculate BOM totals
    await bom.calculateTotals();

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Added resource '${resource.name}' to BOM '${bom.name}'`,
    });
    await auditLog.save();

    res.status(201).json({ message: 'BOMResource created successfully', bomResource });
  } catch (err) {
    console.error('Error creating BOMResource:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all BOMResources for a BOM
const getBOMResourcesByBOM = async (req, res) => {
  try {
    const { bomId } = req.params;

    const bomResources = await BOMResource.find({ bom: bomId }).populate('resource');

    res.json({ bomResources });
  } catch (err) {
    console.error('Error fetching BOMResources:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a BOMResource by ID
const getBOMResourceById = async (req, res) => {
  try {
    const bomResource = await BOMResource.findById(req.params.id)
      .populate('bom')
      .populate('resource');

    if (!bomResource) {
      return res.status(404).json({ error: 'BOMResource not found' });
    }

    res.json({ bomResource });
  } catch (err) {
    console.error('Error fetching BOMResource:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a BOMResource
const updateBOMResource = async (req, res) => {
  try {
    let { quantity } = req.body;

    // Convert quantity to a number if it's a string and check if it's a valid number
    if (isNaN(quantity)) {
      return res.status(400).json({ error: 'Invalid quantity. Must be a number.' });
    }

    // Ensure quantity is a number (either originally a number or converted from a string)
    quantity = parseFloat(quantity);
    console.log(typeof quantity);

    const bomResource = await BOMResource.findById(req.params.id);

    if (!bomResource) {
      return res.status(404).json({ error: 'BOMResource not found' });
    }

    // Update fields if provided
    if (!isNaN(quantity)) bomResource.quantity = quantity;

    // Recalculate totalCost and totalTime
    const resource = await Resource.findById(bomResource.resource);
    bomResource.totalCost = bomResource.quantity * resource.unitCost;
    bomResource.totalTime = bomResource.quantity * resource.unitTime;

    await bomResource.save();

    // Recalculate BOM totals
    const bom = await BOM.findById(bomResource.bom);
    await bom.calculateTotals();

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Updated BOMResource '${bomResource._id}' in BOM '${bom.name}'`,
    });
    await auditLog.save();

    res.json({ message: 'BOMResource updated successfully', bomResource });
  } catch (err) {
    console.error('Error updating BOMResource:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


// Delete a BOMResource
const deleteBOMResource = async (req, res) => {
  try {
    const bomResource = await BOMResource.findById(req.params.id);

    if (!bomResource) {
      return res.status(404).json({ error: 'BOMResource not found' });
    }

    // Remove bomResource from BOM
    const bom = await BOM.findById(bomResource.bom);
    bom.bomResources.pull(bomResource._id);
    await bom.save();

    // Remove bomResource from Resource
    const resource = await Resource.findById(bomResource.resource);
    resource.bomResources.pull(bomResource._id);
    await resource.save();

    // Delete bomResource
    await bomResource.deleteOne();

    // Recalculate BOM totals
    await bom.calculateTotals();

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Deleted BOMResource '${bomResource._id}' from BOM '${bom.name}'`,
    });
    await auditLog.save();

    res.json({ message: 'BOMResource deleted successfully' });
  } catch (err) {
    console.error('Error deleting BOMResource:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createBOMResource,
  getBOMResourcesByBOM,
  getBOMResourceById,
  updateBOMResource,
  deleteBOMResource,
};
