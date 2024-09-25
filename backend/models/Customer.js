// models/Customer.js
const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactInfo: { type: String, required: true },
  customerNeeds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CustomerNeed' }],
  invoices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' }],
});

module.exports = mongoose.model('Customer', CustomerSchema);
