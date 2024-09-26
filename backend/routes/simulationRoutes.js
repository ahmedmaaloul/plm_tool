// routes/simulationRoutes.js

const express = require('express');
const router = express.Router();
const Simulation = require('../models/Simulation');
const Reference = require('../models/Reference');
const Project = require('../models/Project');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const AuditLog = require('../models/AuditLog');

// Middleware to set projectId from referenceId
async function setProjectIdFromReference(req, res, next) {
  try {
    const referenceId = req.body.referenceId || req.params.referenceId || req.query.referenceId;
    if (!referenceId) {
      return res.status(400).json({ error: 'referenceId is required' });
    }

    const reference = await Reference.findById(referenceId);
    if (!reference) {
      return res.status(404).json({ error: 'Reference not found' });
    }

    if (!reference.project) {
      return res.status(400).json({ error: 'Reference is not associated with a project' });
    }

    req.params.projectId = reference.project.toString();
    next();
  } catch (err) {
    console.error('Error in setProjectIdFromReference:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Middleware to set projectId from simulationId
async function setProjectIdFromSimulation(req, res, next) {
  try {
    const simulationId = req.params.id;
    const simulation = await Simulation.findById(simulationId).populate('reference');

    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    const reference = simulation.reference;

    if (!reference) {
      return res.status(404).json({ error: 'Reference not found' });
    }

    if (!reference.project) {
      return res.status(400).json({ error: 'Reference is not associated with a project' });
    }

    req.params.projectId = reference.project.toString();
    next();
  } catch (err) {
    console.error('Error in setProjectIdFromSimulation:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Create a new Simulation
router.post(
  '/',
  authMiddleware,
  setProjectIdFromReference,
  roleMiddleware('manageSimulations'),
  async (req, res) => {
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
  }
);

// Get all Simulations for a Reference
router.get(
  '/reference/:referenceId',
  authMiddleware,
  setProjectIdFromReference,
  roleMiddleware('viewSimulations'),
  async (req, res) => {
    try {
      const { referenceId } = req.params;

      const simulations = await Simulation.find({ reference: referenceId });

      res.json({ simulations });
    } catch (err) {
      console.error('Error fetching simulations:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get a Simulation by ID
router.get(
  '/:id',
  authMiddleware,
  setProjectIdFromSimulation,
  roleMiddleware('viewSimulations'),
  async (req, res) => {
    try {
      const simulation = await Simulation.findById(req.params.id).populate('reference', 'code project');

      if (!simulation) {
        return res.status(404).json({ error: 'Simulation not found' });
      }

      res.json({ simulation });
    } catch (err) {
      console.error('Error fetching simulation:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update a Simulation
router.put(
  '/:id',
  authMiddleware,
  setProjectIdFromSimulation,
  roleMiddleware('manageSimulations'),
  async (req, res) => {
    try {
      const { results } = req.body;

      const simulation = await Simulation.findById(req.params.id);

      if (!simulation) {
        return res.status(404).json({ error: 'Simulation not found' });
      }

      // Update fields if provided
      if (results) simulation.results = results;

      await simulation.save();

      // Create an audit log entry
      const auditLog = new AuditLog({
        user: req.user.userId,
        action: `Updated simulation with ID: ${simulation._id}`,
      });
      await auditLog.save();

      res.json({ message: 'Simulation updated successfully', simulation });
    } catch (err) {
      console.error('Error updating simulation:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete a Simulation
router.delete(
  '/:id',
  authMiddleware,
  setProjectIdFromSimulation,
  roleMiddleware('manageSimulations'),
  async (req, res) => {
    try {
      const simulation = await Simulation.findById(req.params.id).populate('reference');

      if (!simulation) {
        return res.status(404).json({ error: 'Simulation not found' });
      }

      const reference = simulation.reference;

      // Optionally, remove the simulation from the reference
      reference.simulations.pull(simulation._id);
      await reference.save();

      await simulation.remove();

      // Create an audit log entry
      const auditLog = new AuditLog({
        user: req.user.userId,
        action: `Deleted simulation with ID: ${simulation._id}`,
      });
      await auditLog.save();

      res.json({ message: 'Simulation deleted successfully' });
    } catch (err) {
      console.error('Error deleting simulation:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;
