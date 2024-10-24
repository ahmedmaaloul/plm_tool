// models/Invoice.js
const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  filename: { type: String }, // Filename of the generated PDF
  data: { type: Buffer },      // PDF data stored as binary
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
