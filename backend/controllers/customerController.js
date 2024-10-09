const Customer = require('../models/Customer');
const CustomerNeed = require('../models/CustomerNeed');
const Invoice = require('../models/Invoice');
const AuditLog = require('../models/AuditLog');

/**
 * Create a new Customer
 */
const createCustomer = async (req, res) => {
  try {
    const { name, contactInfo } = req.body;

    if (!name || !contactInfo) {
      return res.status(400).json({ error: 'Name and contact information are required.' });
    }

    const customer = new Customer({
      name,
      contactInfo,
      customerNeeds: [],
      invoices: [],
    });

    await customer.save();

    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Created customer: ${customer.name}`,
    });
    await auditLog.save();

    res.status(201).json({ message: 'Customer created successfully.', customer });
  } catch (err) {
    console.error('Error creating customer:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get all Customers
 */
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .populate('customerNeeds', 'description') // Populate customerNeeds if needed
      .populate('invoices', 'amount date'); // Populate invoices if needed

    res.json({ customers });
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get a Customer by ID
 */
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id)
      .populate('customerNeeds', 'description')
      .populate('invoices', 'amount date');

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    res.json({ customer });
  } catch (err) {
    console.error('Error fetching customer:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Update a Customer
 */
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contactInfo } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    if (name) customer.name = name;
    if (contactInfo) customer.contactInfo = contactInfo;

    await customer.save();

    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Updated customer: ${customer.name}`,
    });
    await auditLog.save();

    res.json({ message: 'Customer updated successfully.', customer });
  } catch (err) {
    console.error('Error updating customer:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Delete a Customer
 */
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id)
      .populate('customerNeeds')
      .populate('invoices');

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    // Check if Customer has associated CustomerNeeds or Invoices
    if (
      (customer.customerNeeds && customer.customerNeeds.length > 0) ||
      (customer.invoices && customer.invoices.length > 0)
    ) {
      return res.status(400).json({
        error: 'Cannot delete customer; it has associated customer needs or invoices.',
      });
    }

    await customer.deleteOne();

    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Deleted customer: ${customer.name}`,
    });
    await auditLog.save();

    res.json({ message: 'Customer deleted successfully.' });
  } catch (err) {
    console.error('Error deleting customer:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
