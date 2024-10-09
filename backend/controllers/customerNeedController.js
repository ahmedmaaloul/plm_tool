const CustomerNeed = require('../models/CustomerNeed');
const Customer = require('../models/Customer');
const Requirement = require('../models/Requirement');
const AuditLog = require('../models/AuditLog');

/**
 * Create a new CustomerNeed
 */
const createCustomerNeed = async (req, res) => {
  try {
    const { description, customer, requirements } = req.body;

    // Validate required fields
    if (!description || !customer) {
      return res.status(400).json({ error: 'Description and customer ID are required.' });
    }

    // Check if Customer exists
    const customerDoc = await Customer.findById(customer);
    if (!customerDoc) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    // Validate requirements if provided
    let validRequirements = [];
    if (requirements && Array.isArray(requirements)) {
      validRequirements = await Requirement.find({ _id: { $in: requirements } });
      if (validRequirements.length !== requirements.length) {
        return res.status(400).json({ error: 'Some requirements are invalid.' });
      }
    }

    // Create the CustomerNeed
    const customerNeed = new CustomerNeed({
      description,
      customer,
      requirements: validRequirements.map((req) => req._id),
    });

    await customerNeed.save();

    // Add CustomerNeed to Customer's customerNeeds array
    customerDoc.customerNeeds.push(customerNeed._id);
    await customerDoc.save();

    // Create AuditLog
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Created CustomerNeed '${description}' for customer '${customerDoc.name}'.`,
    });
    await auditLog.save();

    res.status(201).json({ message: 'CustomerNeed created successfully.', customerNeed });
  } catch (err) {
    console.error('Error creating CustomerNeed:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get all CustomerNeeds
 */
const getCustomerNeeds = async (req, res) => {
  try {
    const customerNeeds = await CustomerNeed.find()
      .populate('customer', 'name contactInfo')
      .populate('requirements', 'description'); // Populate requirements if needed

    res.json({ customerNeeds });
  } catch (err) {
    console.error('Error fetching CustomerNeeds:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get a CustomerNeed by ID
 */
const getCustomerNeedById = async (req, res) => {
  try {
    const { id } = req.params;

    const customerNeed = await CustomerNeed.findById(id)
      .populate('customer', 'name contactInfo')
      .populate('requirements', 'description');

    if (!customerNeed) {
      return res.status(404).json({ error: 'CustomerNeed not found.' });
    }

    res.json({ customerNeed });
  } catch (err) {
    console.error('Error fetching CustomerNeed:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Update a CustomerNeed
 */
const updateCustomerNeed = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, customer, requirements } = req.body;

    const customerNeed = await CustomerNeed.findById(id).populate('customer');
    if (!customerNeed) {
      return res.status(404).json({ error: 'CustomerNeed not found.' });
    }

    // Keep track of old customer ID
    const oldCustomerId = customerNeed.customer.toString();

    // Update fields if provided
    if (description) customerNeed.description = description;

    if (customer && customer !== oldCustomerId) {
      // Check if new Customer exists
      const newCustomer = await Customer.findById(customer);
      if (!newCustomer) {
        return res.status(404).json({ error: 'New customer not found.' });
      }

      // Remove CustomerNeed from old Customer's customerNeeds array
      const oldCustomer = await Customer.findById(oldCustomerId);
      if (oldCustomer) {
        oldCustomer.customerNeeds.pull(customerNeed._id);
        await oldCustomer.save();
      }

      // Add CustomerNeed to new Customer's customerNeeds array
      newCustomer.customerNeeds.push(customerNeed._id);
      await newCustomer.save();

      // Update customer reference
      customerNeed.customer = customer;
    }

    if (requirements && Array.isArray(requirements)) {
      // Validate requirements
      const validRequirements = await Requirement.find({ _id: { $in: requirements } });
      if (validRequirements.length !== requirements.length) {
        return res.status(400).json({ error: 'Some requirements are invalid.' });
      }

      customerNeed.requirements = validRequirements.map((req) => req._id);
    }

    await customerNeed.save();

    // Create AuditLog
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Updated CustomerNeed '${customerNeed.description}' (ID: ${customerNeed._id}).`,
    });
    await auditLog.save();

    res.json({ message: 'CustomerNeed updated successfully.', customerNeed });
  } catch (err) {
    console.error('Error updating CustomerNeed:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Delete a CustomerNeed
 */
const deleteCustomerNeed = async (req, res) => {
  try {
    const { id } = req.params;

    const customerNeed = await CustomerNeed.findById(id).populate('customer').populate('requirements');
    if (!customerNeed) {
      return res.status(404).json({ error: 'CustomerNeed not found.' });
    }

    // Check if CustomerNeed has associated Requirements
    if (customerNeed.requirements && customerNeed.requirements.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete CustomerNeed; it has associated requirements.',
      });
    }

    // Remove CustomerNeed from Customer's customerNeeds array
    const customer = await Customer.findById(customerNeed.customer._id);
    if (customer) {
      customer.customerNeeds.pull(customerNeed._id);
      await customer.save();
    }

    // Remove the CustomerNeed
    await customerNeed.deleteOne();

    // Create AuditLog
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Deleted CustomerNeed '${customerNeed.description}' (ID: ${customerNeed._id}).`,
    });
    await auditLog.save();

    res.json({ message: 'CustomerNeed deleted successfully.' });
  } catch (err) {
    console.error('Error deleting CustomerNeed:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createCustomerNeed,
  getCustomerNeeds,
  getCustomerNeedById,
  updateCustomerNeed,
  deleteCustomerNeed,
};
