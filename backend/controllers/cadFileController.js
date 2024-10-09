const CADFile = require('../models/CADFile');
const Reference = require('../models/Reference');
const AuditLog = require('../models/AuditLog');

// Create a new CADFile
const createCADFile = async (req, res) => {
  try {
    const { filename, data, referenceId } = req.body;

    if (!filename || !data || !referenceId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const cadFile = new CADFile({
      filename,
      data: Buffer.from(data, 'base64'), // Assuming data is sent as base64 string
      reference: referenceId,
    });

    await cadFile.save();

    // Add the CAD file to the reference's cadFiles array
    const reference = await Reference.findById(referenceId);
    reference.cadFiles.push(cadFile._id);
    await reference.save();

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Created CAD file '${filename}' for reference '${reference.code}'`,
    });
    await auditLog.save();

    res.status(201).json({ message: 'CAD file created successfully', cadFile });
  } catch (err) {
    console.error('Error creating CAD file:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all CADFiles for a Reference
const getCADFilesByReferenceId = async (req, res) => {
  try {
    const { referenceId } = req.params;

    const cadFiles = await CADFile.find({ reference: referenceId }).select('-data');

    res.json({ cadFiles });
  } catch (err) {
    console.error('Error fetching CAD files:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a CADFile by ID
const getCADFileById = async (req, res) => {
  try {
    const cadFile = await CADFile.findById(req.params.id).populate('reference', 'code project');

    if (!cadFile) {
      return res.status(404).json({ error: 'CAD file not found' });
    }

    // Set projectId for access control
    if (!cadFile.reference.project) {
      return res.status(400).json({ error: 'Reference is not associated with a project' });
    }
    req.params.projectId = cadFile.reference.project.toString();

    // Apply access control
    const middleware = roleMiddleware('viewCADFiles');
    await middleware(req, res, () => {
      res.json({ cadFile });
    });
  } catch (err) {
    console.error('Error fetching CAD file:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a CADFile
const updateCADFile = async (req, res) => {
  try {
    const { filename, data } = req.body;

    const cadFile = await CADFile.findById(req.params.id).populate('reference', 'project');

    if (!cadFile) {
      return res.status(404).json({ error: 'CAD file not found' });
    }

    // Set projectId for access control
    if (!cadFile.reference.project) {
      return res.status(400).json({ error: 'Reference is not associated with a project' });
    }
    req.params.projectId = cadFile.reference.project.toString();

    // Apply access control
    const middleware = roleMiddleware('manageCADFiles');
    await middleware(req, res, async () => {
      // Update fields if provided
      if (filename) cadFile.filename = filename;
      if (data) cadFile.data = Buffer.from(data, 'base64');

      await cadFile.save();

      // Create an audit log entry
      const auditLog = new AuditLog({
        user: req.user.userId,
        action: `Updated CAD file '${cadFile.filename}'`,
      });
      await auditLog.save();

      res.json({ message: 'CAD file updated successfully', cadFile });
    });
  } catch (err) {
    console.error('Error updating CAD file:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a CADFile
const deleteCADFile = async (req, res) => {
  try {
    const cadFile = await CADFile.findById(req.params.id).populate('reference');

    if (!cadFile) {
      return res.status(404).json({ error: 'CAD file not found' });
    }

    // Set projectId for access control
    if (!cadFile.reference.project) {
      return res.status(400).json({ error: 'Reference is not associated with a project' });
    }
    req.params.projectId = cadFile.reference.project.toString();

    // Apply access control
    const middleware = roleMiddleware('manageCADFiles');
    await middleware(req, res, async () => {
      // Remove the CAD file from the reference's cadFiles array
      const reference = cadFile.reference;
      reference.cadFiles.pull(cadFile._id);
      await reference.save();

      await cadFile.deleteOne();

      // Create an audit log entry
      const auditLog = new AuditLog({
        user: req.user.userId,
        action: `Deleted CAD file '${cadFile.filename}'`,
      });
      await auditLog.save();

      res.json({ message: 'CAD file deleted successfully' });
    });
  } catch (err) {
    console.error('Error deleting CAD file:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createCADFile,
  getCADFilesByReferenceId,
  getCADFileById,
  updateCADFile,
  deleteCADFile,
};
