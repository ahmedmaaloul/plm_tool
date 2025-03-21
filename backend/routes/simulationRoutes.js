const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const simulationController = require('../controllers/simulationController');

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

// Create a new Simulation
router.post('/', authMiddleware, setProjectIdFromReference, roleMiddleware('manageSimulations'), simulationController.createSimulation);

// Get all Simulations for a Reference
router.get('/reference/:referenceId', authMiddleware, setProjectIdFromReference, roleMiddleware('viewSimulations'), simulationController.getSimulationsByReferenceId);

// Get a Simulation by ID
router.get('/:id', authMiddleware, simulationController.getSimulationById);

// Update a Simulation
router.put('/:id', authMiddleware, simulationController.updateSimulation);

// Delete a Simulation
router.delete('/:id', authMiddleware, simulationController.deleteSimulation);

module.exports = router;
