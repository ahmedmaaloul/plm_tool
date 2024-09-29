// routes/bomResourceRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const bomResourceController = require('../controllers/bomResourceController');
const BOM = require('../models/BOM');
const BOMResource = require('../models/BOMResource');

// Middleware to set projectId from BOM
async function setProjectIdFromBOM(req, res, next) {
  try {
    const bomId = req.body.bomId || req.params.bomId;
    let bom;

    if (bomId) {
      // If bomId is available, find the BOM
      bom = await BOM.findById(bomId).populate('reference', 'project');
    } else if (req.params.id) {
      // If BOMResource ID is available, find the BOMResource and then its BOM
      const bomResource = await BOMResource.findById(req.params.id);
      if (!bomResource) {
        return res.status(404).json({ error: 'BOMResource not found' });
      }
      bom = await BOM.findById(bomResource.bom).populate('reference', 'project');
    } else {
      return res.status(400).json({ error: 'bomId or BOMResource ID is required' });
    }

    if (!bom) {
      return res.status(404).json({ error: 'BOM not found' });
    }

    if (!bom.reference || !bom.reference.project) {
      return res.status(400).json({ error: 'BOM is not associated with a project' });
    }

    // Set projectId in request params for access control
    req.params.projectId = bom.reference.project.toString();
    next();
  } catch (err) {
    console.error('Error in setProjectIdFromBOM:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Create a new BOMResource
router.post(
  '/',
  authMiddleware,
  setProjectIdFromBOM,
  roleMiddleware('editBOM'),
  bomResourceController.createBOMResource
);

// Get all BOMResources for a BOM
router.get(
  '/bom/:bomId',
  authMiddleware,
  setProjectIdFromBOM,
  roleMiddleware('viewBOM'),
  bomResourceController.getBOMResourcesByBOM
);

// Get a BOMResource by ID
router.get(
  '/:id',
  authMiddleware,
  setProjectIdFromBOM,
  roleMiddleware('viewBOM'),
  bomResourceController.getBOMResourceById
);

// Update a BOMResource
router.put(
  '/:id',
  authMiddleware,
  setProjectIdFromBOM,
  roleMiddleware('editBOM'),
  bomResourceController.updateBOMResource
);

// Delete a BOMResource
router.delete(
  '/:id',
  authMiddleware,
  setProjectIdFromBOM,
  roleMiddleware('editBOM'),
  bomResourceController.deleteBOMResource
);

module.exports = router;
