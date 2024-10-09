const Simulation = require('../models/Simulation');
const Reference = require('../models/Reference');
const AuditLog = require('../models/AuditLog');

// Create a new Simulation
const createSimulation = async (req, res) => {
  try {
    const { results, referenceId } = req.body;

    if (!results || !referenceId) {
      return res.status(400).json({ error: 'results and referenceId are required' });
    }

    const simulation = new Simulation({
      results,
      reference: referenceId,
    });

    await simulation.save();

    // Optionally, add the simulation to the reference
    const reference = await Reference.findById(referenceId);
    reference.simulations.push(simulation._id);
    await reference.save();

    // Create an audit log entry
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Created simulation for reference: ${reference.code}`,
    });
    await auditLog.save();

    res.status(201).json({ message: 'Simulation created successfully', simulation });
  } catch (err) {
    console.error('Error creating simulation:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all Simulations for a Reference
const getSimulationsByReferenceId = async (req, res) => {
  try {
    const { referenceId } = req.params;

    const simulations = await Simulation.find({ reference: referenceId });

    res.json({ simulations });
  } catch (err) {
    console.error('Error fetching simulations:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a Simulation by ID
const getSimulationById = async (req, res) => {
  try {
    const simulation = await Simulation.findById(req.params.id).populate('reference', 'code project');

    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    // Set projectId for access control
    if (!simulation.reference.project) {
      return res.status(400).json({ error: 'Reference is not associated with a project' });
    }
    req.params.projectId = simulation.reference.project.toString();

    // Apply access control
    const middleware = roleMiddleware('viewSimulations');
    await middleware(req, res, () => {
      res.json({ simulation });
    });
  } catch (err) {
    console.error('Error fetching simulation:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a Simulation
const updateSimulation = async (req, res) => {
  try {
    const { results } = req.body;

    const simulation = await Simulation.findById(req.params.id).populate('reference', 'project');

    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    // Set projectId for access control
    if (!simulation.reference.project) {
      return res.status(400).json({ error: 'Reference is not associated with a project' });
    }
    req.params.projectId = simulation.reference.project.toString();

    // Apply access control
    const middleware = roleMiddleware('manageSimulations');
    await middleware(req, res, async () => {
      // Update fields if provided
      if (results) simulation.results = results;

      await simulation.save();

      // Create an audit log entry
      const auditLog = new AuditLog({
        user: req.user.userId,
        action: `Updated simulation for reference: ${simulation.reference.code}`,
      });
      await auditLog.save();

      res.json({ message: 'Simulation updated successfully', simulation });
    });
  } catch (err) {
    console.error('Error updating simulation:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a Simulation
const deleteSimulation = async (req, res) => {
  try {
    const simulation = await Simulation.findById(req.params.id).populate('reference', 'project');

    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    // Set projectId for access control
    if (!simulation.reference.project) {
      return res.status(400).json({ error: 'Reference is not associated with a project' });
    }
    req.params.projectId = simulation.reference.project.toString();

    // Apply access control
    const middleware = roleMiddleware('manageSimulations');
    await middleware(req, res, async () => {
      // Optionally, remove the simulation from the reference
      const reference = await Reference.findById(simulation.reference._id);
      reference.simulations.pull(simulation._id);
      await reference.save();

      await simulation.deleteOne();

      // Create an audit log entry
      const auditLog = new AuditLog({
        user: req.user.userId,
        action: `Deleted simulation for reference: ${reference.code}`,
      });
      await auditLog.save();

      res.json({ message: 'Simulation deleted successfully' });
    });
  } catch (err) {
    console.error('Error deleting simulation:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createSimulation,
  getSimulationsByReferenceId,
  getSimulationById,
  updateSimulation,
  deleteSimulation,
};
