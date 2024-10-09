const Requirement = require('../models/Requirement');
const CustomerNeed = require('../models/CustomerNeed');
const Specification = require('../models/Specification');
const AuditLog = require('../models/AuditLog');

/**
 * Create a new Requirement
 */
const createRequirement = async (req, res) => {
  try {
    const { description, customerNeed, specifications } = req.body;

    if (!description || !customerNeed) {
      return res.status(400).json({ error: 'Description and CustomerNeed ID are required.' });
    }

    // Verify that the CustomerNeed exists
    const customerNeedDoc = await CustomerNeed.findById(customerNeed);
    if (!customerNeedDoc) {
      return res.status(404).json({ error: 'CustomerNeed not found.' });
    }

    // Create the Requirement
    const requirement = new Requirement({
      description,
      customerNeed,
      specifications: [], // Initialize as empty; can add later
    });

    // If specifications are provided, validate and add them
    if (specifications && Array.isArray(specifications)) {
      for (const specId of specifications) {
        const specification = await Specification.findById(specId);
        if (!specification) {
          return res.status(404).json({ error: `Specification with ID ${specId} not found.` });
        }
        requirement.specifications.push(specId);
      }
    }

    await requirement.save();

    // Add the Requirement to the CustomerNeed's requirements array
    customerNeedDoc.requirements.push(requirement._id);
    await customerNeedDoc.save();

    // Create AuditLog
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Created Requirement '${requirement.description}' for CustomerNeed '${customerNeedDoc.description}'.`,
    });
    await auditLog.save();

    res.status(201).json({ message: 'Requirement created successfully.', requirement });
  } catch (err) {
    console.error('Error creating Requirement:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get all Requirements
 */
const getRequirements = async (req, res) => {
  try {
    const requirements = await Requirement.find()
      .populate({
        path: 'customerNeed',
        populate: { path: 'customer', select: 'name contactInfo' },
      })
      .populate('specifications', 'description');

    res.json({ requirements });
  } catch (err) {
    console.error('Error fetching Requirements:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get a Requirement by ID
 */
const getRequirementById = async (req, res) => {
  try {
    const { id } = req.params;

    const requirement = await Requirement.findById(id)
      .populate({
        path: 'customerNeed',
        populate: { path: 'customer', select: 'name contactInfo' },
      })
      .populate('specifications', 'description');

    if (!requirement) {
      return res.status(404).json({ error: 'Requirement not found.' });
    }

    res.json({ requirement });
  } catch (err) {
    console.error('Error fetching Requirement:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Update a Requirement
 */
const updateRequirement = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, customerNeed, specifications } = req.body;

    const requirement = await Requirement.findById(id);
    if (!requirement) {
      return res.status(404).json({ error: 'Requirement not found.' });
    }

    // If updating the CustomerNeed, handle associations
    if (customerNeed && customerNeed !== requirement.customerNeed.toString()) {
      const newCustomerNeed = await CustomerNeed.findById(customerNeed);
      if (!newCustomerNeed) {
        return res.status(404).json({ error: 'New CustomerNeed not found.' });
      }

      const oldCustomerNeed = await CustomerNeed.findById(requirement.customerNeed);
      if (oldCustomerNeed) {
        oldCustomerNeed.requirements.pull(requirement._id);
        await oldCustomerNeed.save();
      }

      newCustomerNeed.requirements.push(requirement._id);
      await newCustomerNeed.save();

      requirement.customerNeed = customerNeed;
    }

    // Update description if provided
    if (description) {
      requirement.description = description;
    }

    // Update specifications if provided
    if (specifications && Array.isArray(specifications)) {
      // Clear existing specifications
      requirement.specifications = [];

      for (const specId of specifications) {
        const specification = await Specification.findById(specId);
        if (!specification) {
          return res.status(404).json({ error: `Specification with ID ${specId} not found.` });
        }
        requirement.specifications.push(specId);
      }
    }

    await requirement.save();

    // Create AuditLog
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Updated Requirement '${requirement.description}' (ID: ${requirement._id}).`,
    });
    await auditLog.save();

    res.json({ message: 'Requirement updated successfully.', requirement });
  } catch (err) {
    console.error('Error updating Requirement:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Delete a Requirement
 */
const deleteRequirement = async (req, res) => {
  try {
    const { id } = req.params;

    const requirement = await Requirement.findById(id).populate('customerNeed').populate('specifications');
    if (!requirement) {
      return res.status(404).json({ error: 'Requirement not found.' });
    }

    // Check if Requirement has associated Specifications
    if (requirement.specifications && requirement.specifications.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete Requirement; it has associated Specifications.',
      });
    }

    // Remove the Requirement from the CustomerNeed's requirements array
    if (requirement.customerNeed) {
      requirement.customerNeed.requirements.pull(requirement._id);
      await requirement.customerNeed.save();
    }

    // Remove the Requirement
    await requirement.deleteOne();

    // Create AuditLog
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Deleted Requirement '${requirement.description}' from CustomerNeed '${requirement.customerNeed.description}'.`,
    });
    await auditLog.save();

    res.json({ message: 'Requirement deleted successfully.' });
  } catch (err) {
    console.error('Error deleting Requirement:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createRequirement,
  getRequirements,
  getRequirementById,
  updateRequirement,
  deleteRequirement,
};
