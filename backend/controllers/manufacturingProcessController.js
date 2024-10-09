// controllers/manufacturingProcessController.js

const ManufacturingProcess = require('../models/ManufacturingProcess');
const BOM = require('../models/BOM');
const ProcessResource = require('../models/ProcessResource');
const AuditLog = require('../models/AuditLog');

// Create a new ManufacturingProcess
const createManufacturingProcess = async (req, res) => {
  try {
    const { name, details, bomId } = req.body;

    if (!name || !details || !bomId) {
      return res.status(400).json({ error: 'Name, details, and bomId are required' });
    }

    const bom = await BOM.findById(bomId);
    if (!bom) {
      return res.status(404).json({ error: 'BOM not found' });
    }

    const manufacturingProcess = new ManufacturingProcess({
      name,
      details,
      bom: bomId,
    });

    await manufacturingProcess.save();

    // Add manufacturingProcess to BOM
    bom.manufacturingProcesses.push(manufacturingProcess._id);
    await bom.save();

    // Recalculate BOM totals
    await bom.calculateTotals();

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Created manufacturing process '${name}' in BOM '${bom.name}'`,
    });
    await auditLog.save();

    res.status(201).json({
      message: 'Manufacturing process created successfully',
      manufacturingProcess,
    });
  } catch (err) {
    console.error('Error creating manufacturing process:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all ManufacturingProcesses for a BOM
const getManufacturingProcessesByBOM = async (req, res) => {
  try {
    const { bomId } = req.params;

    const manufacturingProcesses = await ManufacturingProcess.find({ bom: bomId }).populate('processResources');

    res.json({ manufacturingProcesses });
  } catch (err) {
    console.error('Error fetching manufacturing processes:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a ManufacturingProcess by ID
const getManufacturingProcessById = async (req, res) => {
  try {
    const manufacturingProcess = await ManufacturingProcess.findById(req.params.id).populate({
      path: 'processResources',
      populate: { path: 'resource' },
    });

    if (!manufacturingProcess) {
      return res.status(404).json({ error: 'Manufacturing process not found' });
    }

    res.json({ manufacturingProcess });
  } catch (err) {
    console.error('Error fetching manufacturing process:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a ManufacturingProcess
const updateManufacturingProcess = async (req, res) => {
  try {
    const { name, details, bomId } = req.body;

    const manufacturingProcess = await ManufacturingProcess.findById(req.params.id);

    if (!manufacturingProcess) {
      return res.status(404).json({ error: 'Manufacturing process not found' });
    }

    // Update fields if provided
    if (name) manufacturingProcess.name = name;
    if (details) manufacturingProcess.details = details;

    // Handle BOM change
    if (bomId && bomId !== manufacturingProcess.bom.toString()) {
      const newBOM = await BOM.findById(bomId);
      if (!newBOM) {
        return res.status(404).json({ error: 'New BOM not found' });
      }

      // Remove from old BOM
      const currentBOM = await BOM.findById(manufacturingProcess.bom);
      currentBOM.manufacturingProcesses.pull(manufacturingProcess._id);
      await currentBOM.save();

      // Add to new BOM
      newBOM.manufacturingProcesses.push(manufacturingProcess._id);
      await newBOM.save();

      // Update manufacturingProcess's bom field
      manufacturingProcess.bom = bomId;

      // Recalculate totals for both BOMs
      await currentBOM.calculateTotals();
      await newBOM.calculateTotals();
    }

    await manufacturingProcess.save();

    // Recalculate totals for the manufacturing process
    await manufacturingProcess.calculateTotals();

    // Recalculate totals for the BOM
    const bom = await BOM.findById(manufacturingProcess.bom);
    await bom.calculateTotals();

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Updated manufacturing process '${manufacturingProcess.name}'`,
    });
    await auditLog.save();

    res.json({
      message: 'Manufacturing process updated successfully',
      manufacturingProcess,
    });
  } catch (err) {
    console.error('Error updating manufacturing process:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a ManufacturingProcess
const deleteManufacturingProcess = async (req, res) => {
  try {
    const manufacturingProcess = await ManufacturingProcess.findById(req.params.id);

    if (!manufacturingProcess) {
      return res.status(404).json({ error: 'Manufacturing process not found' });
    }

    const bom = await BOM.findById(manufacturingProcess.bom);
    bom.manufacturingProcesses.pull(manufacturingProcess._id);
    await bom.save();

    // Delete associated ProcessResources
    await ProcessResource.deleteMany({ manufacturingProcess: manufacturingProcess._id });

    // Delete manufacturingProcess
    await manufacturingProcess.deleteOne();

    // Recalculate BOM totals
    await bom.calculateTotals();

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Deleted manufacturing process '${manufacturingProcess.name}' from BOM '${bom.name}'`,
    });
    await auditLog.save();

    res.json({ message: 'Manufacturing process deleted successfully' });
  } catch (err) {
    console.error('Error deleting manufacturing process:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createManufacturingProcess,
  getManufacturingProcessesByBOM,
  getManufacturingProcessById,
  updateManufacturingProcess,
  deleteManufacturingProcess,
};
