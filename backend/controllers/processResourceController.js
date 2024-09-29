// controllers/processResourceController.js

const ProcessResource = require('../models/ProcessResource');
const ManufacturingProcess = require('../models/ManufacturingProcess');
const Resource = require('../models/Resource');
const BOM = require('../models/BOM');
const AuditLog = require('../models/AuditLog');

// Middleware to set projectId from ManufacturingProcess
const setProjectIdFromManufacturingProcess = async (req, res, next) => {
  try {
    const manufacturingProcessId = req.body.manufacturingProcessId || req.params.manufacturingProcessId || req.query.manufacturingProcessId;

    if (!manufacturingProcessId) {
      return res.status(400).json({ error: 'manufacturingProcessId is required' });
    }

    const manufacturingProcess = await ManufacturingProcess.findById(manufacturingProcessId);
    if (!manufacturingProcess) {
      return res.status(404).json({ error: 'Manufacturing process not found' });
    }

    const bom = await BOM.findById(manufacturingProcess.bom).populate('reference', 'project');
    if (!bom || !bom.reference || !bom.reference.project) {
      return res.status(400).json({ error: 'Manufacturing process is not associated with a project' });
    }

    req.params.projectId = bom.reference.project.toString();
    next();
  } catch (err) {
    console.error('Error in setProjectIdFromManufacturingProcess:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new ProcessResource
const createProcessResource = async (req, res) => {
  try {
    const { manufacturingProcessId, resourceId, quantity } = req.body;

    if (!manufacturingProcessId || !resourceId || typeof quantity !== 'number') {
      return res.status(400).json({ error: 'manufacturingProcessId, resourceId, and quantity are required' });
    }

    const manufacturingProcess = await ManufacturingProcess.findById(manufacturingProcessId);
    if (!manufacturingProcess) {
      return res.status(404).json({ error: 'Manufacturing process not found' });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const totalCost = quantity * resource.unitCost;
    const totalTime = quantity * resource.unitTime;

    const processResource = new ProcessResource({
      manufacturingProcess: manufacturingProcessId,
      resource: resourceId,
      quantity,
      totalCost,
      totalTime,
    });

    await processResource.save();

    manufacturingProcess.processResources.push(processResource._id);
    await manufacturingProcess.save();

    resource.processResources.push(processResource._id);
    await resource.save();

    await manufacturingProcess.calculateTotals();

    const bom = await BOM.findById(manufacturingProcess.bom);
    await bom.calculateTotals();

    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Added resource '${resource.name}' to manufacturing process '${manufacturingProcess.name}'`,
    });
    await auditLog.save();

    res.status(201).json({ message: 'ProcessResource created successfully', processResource });
  } catch (err) {
    console.error('Error creating ProcessResource:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all ProcessResources for a ManufacturingProcess
const getProcessResourcesByManufacturingProcess = async (req, res) => {
  try {
    const { manufacturingProcessId } = req.params;

    const processResources = await ProcessResource.find({ manufacturingProcess: manufacturingProcessId }).populate('resource');

    res.json({ processResources });
  } catch (err) {
    console.error('Error fetching ProcessResources:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a ProcessResource by ID
const getProcessResourceById = async (req, res) => {
  try {
    const processResource = await ProcessResource.findById(req.params.id).populate('resource');

    if (!processResource) {
      return res.status(404).json({ error: 'ProcessResource not found' });
    }

    const manufacturingProcess = await ManufacturingProcess.findById(processResource.manufacturingProcess);
    const bom = await BOM.findById(manufacturingProcess.bom).populate('reference', 'project');
    if (!bom.reference || !bom.reference.project) {
      return res.status(400).json({ error: 'Manufacturing process is not associated with a project' });
    }
    req.params.projectId = bom.reference.project.toString();

    const middleware = roleMiddleware('viewBOM');
    await middleware(req, res, () => {
      res.json({ processResource });
    });
  } catch (err) {
    console.error('Error fetching ProcessResource:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a ProcessResource
const updateProcessResource = async (req, res) => {
  try {
    const { quantity } = req.body;

    const processResource = await ProcessResource.findById(req.params.id);

    if (!processResource) {
      return res.status(404).json({ error: 'ProcessResource not found' });
    }

    const manufacturingProcess = await ManufacturingProcess.findById(processResource.manufacturingProcess);
    const bom = await BOM.findById(manufacturingProcess.bom).populate('reference', 'project');
    if (!bom.reference || !bom.reference.project) {
      return res.status(400).json({ error: 'Manufacturing process is not associated with a project' });
    }
    req.params.projectId = bom.reference.project.toString();

    const middleware = roleMiddleware('editBOM');
    await middleware(req, res, async () => {
      if (typeof quantity === 'number') processResource.quantity = quantity;

      const resource = await Resource.findById(processResource.resource);
      processResource.totalCost = processResource.quantity * resource.unitCost;
      processResource.totalTime = processResource.quantity * resource.unitTime;

      await processResource.save();

      await manufacturingProcess.calculateTotals();
      await bom.calculateTotals();

      const auditLog = new AuditLog({
        user: req.user.userId,
        action: `Updated ProcessResource '${processResource._id}' in manufacturing process '${manufacturingProcess.name}'`,
      });
      await auditLog.save();

      res.json({ message: 'ProcessResource updated successfully', processResource });
    });
  } catch (err) {
    console.error('Error updating ProcessResource:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a ProcessResource
const deleteProcessResource = async (req, res) => {
  try {
    const processResource = await ProcessResource.findById(req.params.id);

    if (!processResource) {
      return res.status(404).json({ error: 'ProcessResource not found' });
    }

    const manufacturingProcess = await ManufacturingProcess.findById(processResource.manufacturingProcess);
    const bom = await BOM.findById(manufacturingProcess.bom).populate('reference', 'project');
    if (!bom.reference || !bom.reference.project) {
      return res.status(400).json({ error: 'Manufacturing process is not associated with a project' });
    }
    req.params.projectId = bom.reference.project.toString();

    const middleware = roleMiddleware('editBOM');
    await middleware(req, res, async () => {
      manufacturingProcess.processResources.pull(processResource._id);
      await manufacturingProcess.save();

      const resource = await Resource.findById(processResource.resource);
      resource.processResources.pull(processResource._id);
      await resource.save();

      await processResource.remove();

      await manufacturingProcess.calculateTotals();
      await bom.calculateTotals();

      const auditLog = new AuditLog({
        user: req.user.userId,
        action: `Deleted ProcessResource '${processResource._id}' from manufacturing process '${manufacturingProcess.name}'`,
      });
      await auditLog.save();

      res.json({ message: 'ProcessResource deleted successfully' });
    });
  } catch (err) {
    console.error('Error deleting ProcessResource:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  setProjectIdFromManufacturingProcess,
  createProcessResource,
  getProcessResourcesByManufacturingProcess,
  getProcessResourceById,
  updateProcessResource,
  deleteProcessResource,
};
