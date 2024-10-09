const Specification = require('../models/Specification');
const Requirement = require('../models/Requirement');
const BOM = require('../models/BOM');
const AuditLog = require('../models/AuditLog');

/**
 * Create a new Specification
 */
const createSpecification = async (req, res) => {
  try {
    const { detail, requirement, bom } = req.body;

    // Validate required fields
    if (!detail || !requirement) {
      return res.status(400).json({ error: 'Detail and requirement ID are required.' });
    }

    // Check if Requirement exists
    const requirementDoc = await Requirement.findById(requirement);
    if (!requirementDoc) {
      return res.status(404).json({ error: 'Requirement not found.' });
    }

    // If BOM is provided, check if BOM exists
    let bomDoc = null;
    if (bom) {
      bomDoc = await BOM.findById(bom);
      if (!bomDoc) {
        return res.status(404).json({ error: 'BOM not found.' });
      }
    }

    // Create the Specification
    const specification = new Specification({
      detail,
      requirement,
      bom: bom ? bomDoc._id : null,
    });

    await specification.save();

    // Add Specification to Requirement's specifications array
    requirementDoc.specifications.push(specification._id);
    await requirementDoc.save();

    // If BOM is provided, add Specification to BOM's specifications array
    if (bomDoc) {
      bomDoc.specifications.push(specification._id);
      await bomDoc.save();
    }

    // Create AuditLog
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Created specification '${detail}' linked to requirement '${requirementDoc._id}'${bomDoc ? ` and BOM '${bomDoc._id}'` : ''}.`,
    });
    await auditLog.save();

    res.status(201).json({ message: 'Specification created successfully.', specification });
  } catch (err) {
    console.error('Error creating specification:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get all Specifications
 * Accessible to authenticated users without additional role checks
 */
const getSpecifications = async (req, res) => {
  try {
    const specifications = await Specification.find()
      .populate('requirement', 'description')
      .populate('bom', 'name');

    res.json({ specifications });
  } catch (err) {
    console.error('Error fetching specifications:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get a Specification by ID
 * Accessible to authenticated users without additional role checks
 */
const getSpecificationById = async (req, res) => {
  try {
    const { id } = req.params;

    const specification = await Specification.findById(id)
      .populate('requirement', 'description')
      .populate('bom', 'name');

    if (!specification) {
      return res.status(404).json({ error: 'Specification not found.' });
    }

    res.json({ specification });
  } catch (err) {
    console.error('Error fetching specification:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Update a Specification
 */
const updateSpecification = async (req, res) => {
  try {
    const { id } = req.params;
    const { detail, requirement, bom } = req.body;

    const specification = await Specification.findById(id);
    if (!specification) {
      return res.status(404).json({ error: 'Specification not found.' });
    }

    // Track old associations
    const oldRequirementId = specification.requirement.toString();
    const oldBomId = specification.bom ? specification.bom.toString() : null;

    // Update fields if provided
    if (detail) specification.detail = detail;
    if (requirement && requirement !== oldRequirementId) specification.requirement = requirement;
    if (bom !== undefined) specification.bom = bom; // bom can be set to null

    await specification.save();

    // Update Requirement associations if changed
    if (requirement && requirement !== oldRequirementId) {
      // Remove from old Requirement
      const oldRequirement = await Requirement.findById(oldRequirementId);
      if (oldRequirement) {
        oldRequirement.specifications.pull(specification._id);
        await oldRequirement.save();
      }

      // Add to new Requirement
      const newRequirement = await Requirement.findById(requirement);
      if (newRequirement) {
        newRequirement.specifications.push(specification._id);
        await newRequirement.save();
      }
    }

    // Update BOM associations if changed
    if (bom !== oldBomId) {
      // Remove from old BOM
      if (oldBomId) {
        const oldBom = await BOM.findById(oldBomId);
        if (oldBom) {
          oldBom.specifications.pull(specification._id);
          await oldBom.save();
        }
      }

      // Add to new BOM
      if (bom) {
        const newBom = await BOM.findById(bom);
        if (newBom) {
          newBom.specifications.push(specification._id);
          await newBom.save();
        }
      }
    }

    // Create AuditLog
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Updated specification '${specification.detail}' (ID: ${specification._id}).`,
    });
    await auditLog.save();

    res.json({ message: 'Specification updated successfully.', specification });
  } catch (err) {
    console.error('Error updating specification:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Delete a Specification
 */
const deleteSpecification = async (req, res) => {
  try {
    const { id } = req.params;

    const specification = await Specification.findById(id);
    if (!specification) {
      return res.status(404).json({ error: 'Specification not found.' });
    }

    // Remove Specification from Requirement's specifications array
    const requirement = await Requirement.findById(specification.requirement);
    if (requirement) {
      requirement.specifications.pull(specification._id);
      await requirement.save();
    }

    // Remove Specification from BOM's specifications array if linked
    if (specification.bom) {
      const bom = await BOM.findById(specification.bom);
      if (bom) {
        bom.specifications.pull(specification._id);
        await bom.save();
      }
    }

    // Remove the Specification
    await specification.deleteOne();

    // Create AuditLog
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Deleted specification '${specification.detail}' (ID: ${specification._id}).`,
    });
    await auditLog.save();

    res.json({ message: 'Specification deleted successfully.' });
  } catch (err) {
    console.error('Error deleting specification:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createSpecification,
  getSpecifications,
  getSpecificationById,
  updateSpecification,
  deleteSpecification,
};
