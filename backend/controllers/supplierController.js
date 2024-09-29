const Supplier = require('../models/Supplier');
const Resource = require('../models/Resource');
const AuditLog = require('../models/AuditLog');

// Create a new Supplier
const createSupplier = async (req, res) => {
  try {
    const { name, contactInfo } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const supplier = new Supplier({
      name,
      contactInfo,
    });

    await supplier.save();

    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Created supplier: ${supplier.name}`,
    });
    await auditLog.save();

    res.status(201).json({ message: 'Supplier created successfully', supplier });
  } catch (err) {
    console.error('Error creating supplier:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all Suppliers
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().populate('resources', 'name');

    res.json({ suppliers });
  } catch (err) {
    console.error('Error fetching suppliers:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a Supplier by ID
const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findById(id).populate('resources', 'name');

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json({ supplier });
  } catch (err) {
    console.error('Error fetching supplier:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a Supplier
const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contactInfo } = req.body;

    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    if (name) supplier.name = name;
    if (contactInfo) supplier.contactInfo = contactInfo;

    await supplier.save();

    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Updated supplier: ${supplier.name}`,
    });
    await auditLog.save();

    res.json({ message: 'Supplier updated successfully', supplier });
  } catch (err) {
    console.error('Error updating supplier:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a Supplier
const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    // Check if Supplier is associated with any Resources
    const associatedResources = await Resource.find({ supplier: id });

    if (associatedResources.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete supplier; it is associated with existing resources',
      });
    }

    await Supplier.findByIdAndDelete(id);

    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Deleted supplier: ${supplier.name}`,
    });
    await auditLog.save();

    res.json({ message: 'Supplier deleted successfully' });
  } catch (err) {
    console.error('Error deleting supplier:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
};
