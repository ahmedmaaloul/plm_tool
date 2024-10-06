const Resource = require('../models/Resource');
const BOMResource = require('../models/BOMResource');
const ProcessResource = require('../models/ProcessResource');
const Project = require('../models/Project');

const setProjectIdsFromSupplier = async (req, res, next) => {
  try {
    const supplierId = req.params.id || req.body.supplierId;

    if (!supplierId) {
      return res.status(400).json({ error: 'Supplier ID is required' });
    }

    // Find all Resources associated with the Supplier
    const resources = await Resource.find({ supplier: supplierId });

    if (resources.length === 0) {
      // Supplier has no associated resources; no projects linked
      return res.status(400).json({ error: 'Supplier has no associated resources' });
    }

    // Collect all projectIds from BOMResources and ProcessResources linked to these Resources
    const resourceIds = resources.map((resource) => resource._id);

    // Find all BOMResources linked to these Resources
    const bomResources = await BOMResource.find({ resource: { $in: resourceIds } }).populate({
      path: 'bom',
      populate: { path: 'reference', select: 'project' },
    });

    // Find all ProcessResources linked to these Resources
    const processResources = await ProcessResource.find({ resource: { $in: resourceIds } }).populate({
      path: 'manufacturingProcess',
      populate: {
        path: 'bom',
        populate: { path: 'reference', select: 'project' },
      },
    });

    // Use a Set to store unique projectIds
    const projectIdsSet = new Set();

    bomResources.forEach((br) => {
      if (br.bom && br.bom.reference && br.bom.reference.project) {
        projectIdsSet.add(br.bom.reference.project.toString());
      }
    });

    processResources.forEach((pr) => {
      if (
        pr.manufacturingProcess &&
        pr.manufacturingProcess.bom &&
        pr.manufacturingProcess.bom.reference &&
        pr.manufacturingProcess.bom.reference.project
      ) {
        projectIdsSet.add(pr.manufacturingProcess.bom.reference.project.toString());
      }
    });

    // Convert Set to Array
    const projectIds = Array.from(projectIdsSet);

    if (projectIds.length === 0) {
      return res.status(400).json({ error: 'Supplier is not associated with any projects' });
    }

    // Attach projectIds to request params for access control
    req.params.projectIds = projectIds;

    next();
  } catch (err) {
    console.error('Error in setProjectIdsFromSupplier:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = setProjectIdsFromSupplier
