// models/CustomerNeed.js
const mongoose = require('mongoose');

const CustomerNeedSchema = new mongoose.Schema({
  description: { type: String, required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  requirements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Requirement' }],
});

module.exports = mongoose.model('CustomerNeed', CustomerNeedSchema);
