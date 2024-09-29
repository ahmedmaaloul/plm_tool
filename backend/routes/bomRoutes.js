const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const bomController = require('../controllers/bomController');
const BOM = require('../models/BOM');
const Reference = require('../models/Reference');

// Middleware to set projectId from BOM or Reference
async function setProjectIdFromBOMOrReference(req, res, next) {
  try {
    const bomId = req.params.id || req.body.bomId;
    const referenceId = req.body.referenceId;

    let projectId = null;

    if (bomId) {
      const bom = await BOM.findById(bomId).populate('reference', 'project');
      if (!bom) {
        return res.status(404).json({ error: 'BOM not found' });
      }
      if (bom.reference && bom.reference.project) {
        projectId = bom.reference.project.toString();
      } else {
        return res.status(400).json({ error: 'BOM is not associated with a project' });
      }
    } else if (referenceId) {
      const reference = await Reference.findById(referenceId).populate('project', '_id');
      if (!reference) {
        return res.status(404).json({ error: 'Reference not found' });
      }
      if (reference.project) {
        projectId = reference.project._id.toString();
      } else {
        return res.status(400).json({ error: 'Reference is not associated with a project' });
      }
    } else {
      return res.status(400).json({ error: 'No BOM ID or Reference ID provided' });
    }

    // Set projectId in request params for access control
    req.params.projectId = projectId;

    next();
  } catch (err) {
    console.error('Error in setProjectIdFromBOMOrReference:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Create a new BOM
router.post(
  '/',
  authMiddleware,
  setProjectIdFromBOMOrReference,
  roleMiddleware('createBOM'),
  bomController.createBOM
);

// Get all BOMs (Admin only)
router.get('/', authMiddleware, adminMiddleware, bomController.getBOMs);

// Get a BOM by ID
router.get(
  '/:id',
  authMiddleware,
  setProjectIdFromBOMOrReference,
  roleMiddleware('viewBOM'),
  bomController.getBOMById
);

// Update a BOM
router.put(
  '/:id',
  authMiddleware,
  setProjectIdFromBOMOrReference,
  roleMiddleware('editBOM'),
  bomController.updateBOM
);

// Delete a BOM
router.delete(
  '/:id',
  authMiddleware,
  setProjectIdFromBOMOrReference,
  roleMiddleware('deleteBOM'),
  bomController.deleteBOM
);

// Recalculate totals for a BOM
router.post(
  '/:id/recalculate',
  authMiddleware,
  setProjectIdFromBOMOrReference,
  roleMiddleware('editBOM'),
  bomController.recalculateBOMTotals
);

module.exports = router;
