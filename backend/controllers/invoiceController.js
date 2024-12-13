const Invoice = require('../models/Invoice');
const Project = require('../models/Project');
const Customer = require('../models/Customer');
const AuditLog = require('../models/AuditLog');
const PDFDocument = require('pdfkit');
const path = require('path');

/**
 * Generate Invoice PDF and return it as a Buffer
 */
const generateInvoicePDF = async (invoice) => {
  // Fetch the project and customer details
  const project = await Project.findById(invoice.project)
    .populate({
      path: 'reference',
      populate: {
        path: 'bom',
        populate: [
          { path: 'bomResources', populate: { path: 'resource' } },
          { path: 'manufacturingProcesses', populate: { path: 'resource' } },
        ],
      },
    });

  const customer = await Customer.findById(invoice.customer);

  // Ensure project, customer, and BOM exist
  if (!project || !customer || !project.reference || !project.reference.bom) {
    throw new Error('Project, Customer, or BOM not found');
  }

  // Sanitize the project title and customer name for the filename
  const sanitizedProjectTitle = project.title.replace(/[<>:"\/\\|?*\x00-\x1F]/g, '').replace(/\s+/g, '_');
  const sanitizedCustomerName = customer.name.replace(/[<>:"\/\\|?*\x00-\x1F]/g, '').replace(/\s+/g, '_');

  // Get the current date and time
  const date = new Date();
  const pad = (num) => String(num).padStart(2, '0');
  const formattedDate = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;

  // Construct the filename using the date and time
  const filename = `${sanitizedProjectTitle}-${sanitizedCustomerName}-${formattedDate}.pdf`;

  // Create a new PDF document
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Collect the PDF data into a buffer
  const buffers = [];
  doc.on('data', (data) => buffers.push(data));

  // Return a promise that resolves when the PDF is generated
  return new Promise((resolve, reject) => {
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve({ pdfData, filename });
    });

    // ----- Start of PDF Content -----

    // Header with company information
    doc
      // .image('path/to/company/logo.png', 50, 45, { width: 50 }) // Uncomment if you have a logo
      .fillColor('#444444')
      .fontSize(20)
      .text('Bena', 110, 57)
      .fontSize(10)
      .text('12 Av. Léonard de Vinci', 200, 65, { align: 'right' })
      .text('Courbevoie, Ile-de-France, 92400', 200, 80, { align: 'right' })
      .moveDown();

    // Invoice Title
    doc
      .fontSize(20)
      .text('INVOICE', { align: 'center' })
      .moveDown();

    // Invoice Details
    const invoiceDetailsTop = 150;
    doc
      .fontSize(12)
      .text(`Invoice ID: ${invoice._id}`, 50, invoiceDetailsTop)
      .text(`Invoice Date: ${date.toLocaleDateString()}`, 50, invoiceDetailsTop + 15)
      .text(`Total Amount: $${project.reference.bom.totalCost.toFixed(2)}`, 50, invoiceDetailsTop + 30)
      .text(`Customer Name: ${customer.name}`, 300, invoiceDetailsTop)
      .text(`Contact Info: ${customer.contactInfo}`, 300, invoiceDetailsTop + 15);

    // Table Headers
    const itemsTableTop = 220;
    doc
      .fontSize(12)
      .text('Item', 50, itemsTableTop)
      .text('Quantity', 200, itemsTableTop)
      .text('Unit Cost', 280, itemsTableTop, { width: 90, align: 'right' })
      .text('Line Total', 370, itemsTableTop, { width: 90, align: 'right' });

    // Draw table line
    doc
      .strokeColor('#aaaaaa')
      .lineWidth(1)
      .moveTo(50, itemsTableTop + 15)
      .lineTo(550, itemsTableTop + 15)
      .stroke();

    // Table Content
    let position = itemsTableTop + 25;

    // BOM Resources
    project.reference.bom.bomResources.forEach((bomResource) => {
      doc
        .fontSize(12)
        .text(bomResource.resource.name, 50, position)
        .text(bomResource.quantity, 200, position)
        .text(`$${bomResource.resource.unitCost.toFixed(2)}`, 280, position, { width: 90, align: 'right' })
        .text(`$${bomResource.totalCost.toFixed(2)}`, 370, position, { width: 90, align: 'right' });
      position += 20;
    });

    // Manufacturing Processes
    project.reference.bom.manufacturingProcesses.forEach((process) => {
      doc
        .fontSize(12)
        .text(process.resource.name, 50, position)
        .text(process.quantity, 200, position)
        .text(`$${process.resource.unitCost.toFixed(2)}`, 280, position, { width: 90, align: 'right' })
        .text(`$${process.totalCost.toFixed(2)}`, 370, position, { width: 90, align: 'right' });
      position += 20;
    });

    // Total Cost
    doc
      .fontSize(12)
      .text('Total', 300, position + 20)
      .text(`$${project.reference.bom.totalCost.toFixed(2)}`, 370, position + 20, { width: 90, align: 'right' });

    // Footer
    doc
      .fontSize(10)
      .text('Thank you for your business!', 50, position + 80, { align: 'center', width: 500 });

    // ----- End of PDF Content -----

    // Finalize the PDF file
    doc.end();
  });
};


/**
 * Create a new Invoice
 */
const createInvoice = async (req, res) => {
  try {
    const { project, customer } = req.body;

    // Validate required fields
    if (!project || !customer) {
      return res.status(400).json({ error: 'Project ID and Customer ID are required.' });
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
    const invoice = new Invoice({ project, customer });
    await invoice.save();

    // Generate PDF and save the data and filename
    const { pdfData, filename } = await generateInvoicePDF(invoice);
    invoice.filename = filename; // Store the filename
    invoice.data = pdfData;      // Store the PDF data
    await invoice.save();

    // Update related documents
    projectDoc.invoices.push(invoice._id);
    await projectDoc.save();
    customerDoc.invoices.push(invoice._id);
    await customerDoc.save();

    // Create AuditLog
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Created invoice for customer '${customerDoc.name}' in project '${projectDoc.title}'.`,
    });
    await auditLog.save();

    res.status(201).json({ message: 'Invoice created successfully.', invoice });
  } catch (err) {
    console.error('Error creating invoice:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Download an Invoice PDF
 */
const downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id);
    if (!invoice || !invoice.data) {
      return res.status(404).json({ error: 'Invoice not found or file not generated.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoice.filename}"`);
    res.send(invoice.data);
  } catch (err) {
    console.error('Error downloading invoice:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get all Invoices
 */
const getInvoices = async (req, res) => {
  try {
    const { projectId } = req.query; // Extract projectId from query parameters
    let filter = {};

    if (projectId) {
      // Validate projectId format (assuming MongoDB ObjectId)
      if (!projectId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: 'Invalid projectId format' });
      }
      filter.project = projectId; // Filter invoices by projectId
    }

    const invoices = await Invoice.find(filter)
      .populate('project', 'title') // Populate project title
      .populate('customer', 'name contactInfo'); // Populate customer name and contact info

    res.json({ invoices });
  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
/**
 * Get an Invoice by ID
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

    // Update fields if provided
    if (filename) invoice.filename = filename;
    if (project) invoice.project = project;
    if (customer) invoice.customer = customer;

    await invoice.save();

    // Create AuditLog
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Updated invoice (ID: ${invoice._id}).`,
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
    const customer = await Customer.findById(invoice.customer);

    // Update related documents
    project.invoices.pull(invoice._id);
    await project.save();
    customer.invoices.pull(invoice._id);
    await customer.save();

    // Delete the Invoice
    await invoice.deleteOne();

    // Create AuditLog
    const auditLog = new AuditLog({
      user: req.user.userId,
      action: `Deleted invoice (ID: ${invoice._id}).`,
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
  downloadInvoice,
};
