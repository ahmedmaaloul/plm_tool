const Invoice = require('../models/Invoice');
const Project = require('../models/Project');
const Customer = require('../models/Customer');
const AuditLog = require('../models/AuditLog');

/**
 * Create a new Invoice
 */
const createInvoice = async (req, res) => {
  try {
    const { filename, project, customer } = req.body;

    // Validate required fields
    if (!filename || !project || !customer) {
      return res.status(400).json({ error: 'Filename, project ID, and customer ID are required.' });
    }

    // Check if Project exists
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Check if Customer exists
    const customerDoc = await Customer.findById(customer);
    if (!customerDoc) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    // Create the Invoice
    const invoice = new Invoice({
      filename,
      project,
      customer,
    });

    await invoice.save();

    // Add Invoice to Project's invoices array
    projectDoc.invoices.push(invoice._id);
    await projectDoc.save();

    // Add Invoice to Customer's invoices array
    customerDoc.invoices.push(invoice._id);
    await customerDoc.save();

    // Create AuditLog
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Created invoice '${filename}' for customer '${customerDoc.name}' in project '${projectDoc.title}'.`,
    });
    await auditLog.save();

    res.status(201).json({ message: 'Invoice created successfully.', invoice });
  } catch (err) {
    console.error('Error creating invoice:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get all Invoices
 * No access control required beyond authentication
 */
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('project', 'title')
      .populate('customer', 'name contactInfo');

    res.json({ invoices });
  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get an Invoice by ID
 * No access control required beyond authentication
 */
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id)
      .populate('project', 'title')
      .populate('customer', 'name contactInfo');

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }

    res.json({ invoice });
  } catch (err) {
    console.error('Error fetching invoice:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Update an Invoice
 */
const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { filename, project, customer } = req.body;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }

    // Keep track of old project and customer
    const oldProjectId = invoice.project.toString();
    const oldCustomerId = invoice.customer.toString();

    // Update fields if provided
    if (filename) invoice.filename = filename;
    if (project) invoice.project = project;
    if (customer) invoice.customer = customer;

    await invoice.save();

    // If project has changed, update Project's invoices arrays
    if (project && project !== oldProjectId) {
      const oldProject = await Project.findById(oldProjectId);
      const newProject = await Project.findById(project);

      if (!newProject) {
        return res.status(404).json({ error: 'New project not found.' });
      }

      // Remove from old project
      if (oldProject) {
        oldProject.invoices.pull(invoice._id);
        await oldProject.save();
      }

      // Add to new project
      newProject.invoices.push(invoice._id);
      await newProject.save();
    }

    // If customer has changed, update Customer's invoices arrays
    if (customer && customer !== oldCustomerId) {
      const oldCustomer = await Customer.findById(oldCustomerId);
      const newCustomer = await Customer.findById(customer);

      if (!newCustomer) {
        return res.status(404).json({ error: 'New customer not found.' });
      }

      // Remove from old customer
      if (oldCustomer) {
        oldCustomer.invoices.pull(invoice._id);
        await oldCustomer.save();
      }

      // Add to new customer
      newCustomer.invoices.push(invoice._id);
      await newCustomer.save();
    }

    // Create AuditLog
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Updated invoice '${invoice.filename}' (ID: ${invoice._id}).`,
    });
    await auditLog.save();

    res.json({ message: 'Invoice updated successfully.', invoice });
  } catch (err) {
    console.error('Error updating invoice:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Delete an Invoice
 */
const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }

    const project = await Project.findById(invoice.project);
    if (!project) {
      return res.status(404).json({ error: 'Associated project not found.' });
    }

    const customer = await Customer.findById(invoice.customer);
    if (!customer) {
      return res.status(404).json({ error: 'Associated customer not found.' });
    }

    // Remove Invoice from Project's invoices array
    project.invoices.pull(invoice._id);
    await project.save();

    // Remove Invoice from Customer's invoices array
    customer.invoices.pull(invoice._id);
    await customer.save();

    // Remove the Invoice
    await invoice.remove();

    // Create AuditLog
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Deleted invoice '${invoice.filename}' from customer '${customer.name}' in project '${project.title}'.`,
    });
    await auditLog.save();

    res.json({ message: 'Invoice deleted successfully.' });
  } catch (err) {
    console.error('Error deleting invoice:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
};
