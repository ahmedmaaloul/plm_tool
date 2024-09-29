// routes/resourceRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const resourceController = require('../controllers/resourceController');
const Resource = require('../models/Resource');
const BOMResource = require('../models/BOMResource');
const ProcessResource = require('../models/ProcessResource');
const BOM = require('../models/BOM');
const ManufacturingProcess = require('../models/ManufacturingProcess');

// Middleware to set projectId(s) from Resource
async function setProjectIdsFromResource(req, res, next) {
  try {
    const resourceId = req.params.id;

    if (!resourceId) {
      // For routes where resourceId is not provided, proceed without setting projectId
      return next();
    }

    // Find all BOMResources and ProcessResources associated with the Resource
    const bomResources = await BOMResource.find({ resource: resourceId }).populate({
      path: 'bom',
      populate: { path: 'reference', select: 'project' },
    });

    const processResources = await ProcessResource.find({ resource: resourceId }).populate({
      path: 'manufacturingProcess',
      populate: {
        path: 'bom',
        populate: { path: 'reference', select: 'project' },
      },
    });

    // Collect unique projectIds
    const projectIdsSet = new Set();

    for (const bomResource of bomResources) {
      if (bomResource.bom && bomResource.bom.reference && bomResource.bom.reference.project) {
        projectIdsSet.add(bomResource.bom.reference.project.toString());
      }
    }

    for (const processResource of processResources) {
      if (
        processResource.manufacturingProcess &&
        processResource.manufacturingProcess.bom &&
        processResource.manufacturingProcess.bom.reference &&
        processResource.manufacturingProcess.bom.reference.project
      ) {
        projectIdsSet.add(processResource.manufacturingProcess.bom.reference.project.toString());
      }
    }

    // Convert Set to Array
    const projectIds = Array.from(projectIdsSet);

    // Attach projectIds to request parameters
    req.params.projectIds = projectIds;

    next();
  } catch (err) {
    console.error('Error in setProjectIdsFromResource:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Create a new Resource
router.post(
  '/',
  authMiddleware,
  roleMiddleware('createResource'),
  resourceController.createResource
);

// Get all Resources
router.get(
  '/',
  authMiddleware,
  roleMiddleware('viewResources'),
  resourceController.getResources
);

// Get a Resource by ID
router.get(
  '/:id',
  authMiddleware,
  setProjectIdsFromResource,
  roleMiddleware('viewResources'),
  resourceController.getResourceById
);

// Update a Resource
router.put(
  '/:id',
  authMiddleware,
  setProjectIdsFromResource,
  roleMiddleware('editResource'),
  resourceController.updateResource
);

// Delete a Resource
router.delete(
  '/:id',
  authMiddleware,
  setProjectIdsFromResource,
  roleMiddleware('deleteResource'),
  resourceController.deleteResource
);

module.exports = router;
