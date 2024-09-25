// models/Invoice.js
const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  filename: { type: String, required: true }, // Filename of the generated PDF
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
