const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const specificationController = require('../controllers/specificationController');
const Specification = require('../models/Specification');
const Requirement = require('../models/Requirement');
const BOM = require('../models/BOM');

/**
 * Middleware to set projectIds from Specification
 * - For POST: get projectId from req.body.requirement or req.body.bom
 * - For PUT/DELETE: get projectId from existing Specification's requirement or bom
 */
async function setProjectIdsFromSpecification(req, res, next) {
  try {
    let projectIds = [];

    if (req.method === 'POST') {
      // For creating a new Specification
      const { requirement, bom } = req.body;

      if (!requirement && !bom) {
        return res.status(400).json({ error: 'Either requirement ID or BOM ID is required.' });
      }

      if (requirement) {
        const requirementDoc = await Requirement.findById(requirement).populate('customerNeed').populate('customerNeed.customer');
        if (!requirementDoc) {
          return res.status(404).json({ error: 'Requirement not found.' });
        }

        // Assuming CustomerNeed is linked to a Customer, which is linked to Projects via Invoices or other associations
        // Adjust the following logic based on your actual Project association
        // Here, we'll assume Requirement is linked to a Project directly or indirectly

        // Fetch the Project from Requirement's associations
        // This part may vary depending on your actual data model
        // For example, if Requirement is linked to a Project via CustomerNeed or Customer

        // Let's assume Requirement is linked to a Project via CustomerNeed's Customer's Invoices' Project
        // This is speculative; adjust according to your actual associations

        // Example:
        // requirementDoc.customerNeed.customer.invoices are linked to projects

        // Fetch all projects associated with the customer's invoices
        const customer = await require('../models/Customer').findById(requirementDoc.customerNeed.customer);
        if (customer) {
          const invoices = await require('../models/Invoice').find({ customer: customer._id }).populate('project');
          invoices.forEach(invoice => {
            if (invoice.project) {
              projectIds.push(invoice.project.toString());
            }
          });
        }
      }

      if (bom) {
        const bomDoc = await BOM.findById(bom).populate('reference');
        if (!bomDoc) {
          return res.status(404).json({ error: 'BOM not found.' });
        }

        if (bomDoc.reference && bomDoc.reference.project) {
          projectIds.push(bomDoc.reference.project.toString());
        }
      }

      // Remove duplicates
      projectIds = [...new Set(projectIds)];

      if (projectIds.length === 0) {
        return res.status(400).json({ error: 'Unable to determine associated project.' });
      }
    } else {
      // For updating or deleting an existing Specification
      const specificationId = req.params.id;
      if (!specificationId) {
        return res.status(400).json({ error: 'Specification ID is required in the request parameters.' });
      }

      const specification = await Specification.findById(specificationId).populate('requirement').populate('bom');
      if (!specification) {
        return res.status(404).json({ error: 'Specification not found.' });
      }

      if (specification.requirement) {
        const requirementDoc = await Requirement.findById(specification.requirement).populate('customerNeed').populate('customerNeed.customer');
        if (requirementDoc) {
          const customer = await require('../models/Customer').findById(requirementDoc.customerNeed.customer);
          if (customer) {
            const invoices = await require('../models/Invoice').find({ customer: customer._id }).populate('project');
            invoices.forEach(invoice => {
              if (invoice.project) {
                projectIds.push(invoice.project.toString());
              }
            });
          }
        }
      }

      if (specification.bom) {
        const bomDoc = await BOM.findById(specification.bom).populate('reference');
        if (bomDoc && bomDoc.reference && bomDoc.reference.project) {
          projectIds.push(bomDoc.reference.project.toString());
        }
      }

      // Remove duplicates
      projectIds = [...new Set(projectIds)];

      if (projectIds.length === 0) {
        return res.status(400).json({ error: 'Unable to determine associated project.' });
      }
    }

    // Attach projectIds to request params for roleMiddleware
    req.params.projectIds = projectIds;

    next();
  } catch (err) {
    console.error('Error in setProjectIdsFromSpecification:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

/**
 * Route Definitions
 */

// Create a new Specification
router.post(
  '/',
  authMiddleware,
  setProjectIdsFromSpecification, // Sets req.params.projectIds
  roleMiddleware('BOMAndSuppliers'), // Requires manage role
  specificationController.createSpecification
);

// Get all Specifications
router.get(
  '/',
  authMiddleware,
  specificationController.getSpecifications
);

// Get a Specification by ID
router.get(
  '/:id',
  authMiddleware,
  specificationController.getSpecificationById
);

// Update a Specification
router.put(
  '/:id',
  authMiddleware,
  setProjectIdsFromSpecification, // Sets req.params.projectIds based on existing Specification
  roleMiddleware('BOMAndSuppliers'), // Requires manage role
  specificationController.updateSpecification
);

// Delete a Specification
router.delete(
  '/:id',
  authMiddleware,
  setProjectIdsFromSpecification, // Sets req.params.projectIds based on existing Specification
  roleMiddleware('manageSpecifications'), // Requires manage role
  specificationController.deleteSpecification
);

module.exports = router;
