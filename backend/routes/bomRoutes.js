// routes/bomRoutes.js

const express = require('express');
const router = express.Router();
const BOM = require('../models/BOM');
const BOMResource = require('../models/BOMResource');
const ManufacturingProcess = require('../models/ManufacturingProcess');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const adminMiddleware = require('../middleware/adminMiddleware');
const AuditLog = require('../models/AuditLog');

// Create a new BOM
router.post('/', authMiddleware, roleMiddleware('createBOM'), async (req, res) => {
  try {
    const { name, referenceId } = req.body;

    // Validate input
    if (!name || !referenceId) {
      return res.status(400).json({ error: 'Name and referenceId are required' });
    }

    // Create BOM
    const bom = new BOM({
      name,
      reference: referenceId,
    });

    await bom.save();

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Created BOM: ${bom.name}`,
    });
    await auditLog.save();

    res.status(201).json({ message: 'BOM created successfully', bom });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all BOMs (Admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const boms = await BOM.find()
      .populate('reference', 'code description')
      .populate('manufacturingProcesses')
      .populate('bomResources')
      .populate('specifications');
    res.json({ boms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a BOM by ID
router.get('/project/:projectId/bom/:id', authMiddleware,roleMiddleware('viewBOM'), async (req, res) => {
  try {
    const { projectId, id } = req.params;
    const bom = await BOM.findById(id)
      .populate('reference', 'code description')
      .populate({
        path: 'manufacturingProcesses',
        populate: { path: 'processResources' },
      })
      .populate({
        path: 'bomResources',
        populate: { path: 'resource' },
      })
      .populate('specifications');

    if (!bom) {
      return res.status(404).json({ error: 'BOM not found' });
    }

    res.json({ bom });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a BOM
router.put('/project/:projectId/bom/:id', authMiddleware, roleMiddleware('editBOM'), async (req, res) => {
    const { projectId, id } = req.params;
    try {
    const { name, referenceId } = req.body;
    const bom = await BOM.findById(id);

    if (!bom) {
      return res.status(404).json({ error: 'BOM not found' });
    }

    // Update fields if provided
    if (name) bom.name = name;
    if (referenceId) bom.reference = referenceId;

    await bom.save();

    // Recalculate totals
    await bom.calculateTotals();

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Updated BOM: ${bom.name}`,
    });
    await auditLog.save();

    res.json({ message: 'BOM updated successfully', bom });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a BOM
router.delete('/project/:projectId/bom/:id', authMiddleware, roleMiddleware('deleteBOM'), async (req, res) => {
    const { projectId, id } = req.params;
    try {
    const bom = await BOM.findByIdAndDelete(id);

    if (!bom) {
      return res.status(404).json({ error: 'BOM not found' });
    }

    // Optionally, delete related documents (manufacturing processes, resources)
    await ManufacturingProcess.deleteMany({ bom: bom._id });
    await BOMResource.deleteMany({ bom: bom._id });

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Deleted BOM: ${bom.name}`,
    });
    await auditLog.save();

    res.json({ message: 'BOM deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Recalculate totals for a BOM
router.post('/:id/recalculate', authMiddleware, async (req, res) => {
  try {
    const bom = await BOM.findById(req.params.id);

    if (!bom) {
      return res.status(404).json({ error: 'BOM not found' });
    }

    await bom.calculateTotals();

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Recalculated totals for BOM: ${bom.name}`,
    });
    await auditLog.save();

    res.json({ message: 'BOM totals recalculated', totalCost: bom.totalCost, totalTime: bom.totalTime });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
