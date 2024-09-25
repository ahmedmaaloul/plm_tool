// models/Requirement.js
const mongoose = require('mongoose');

const RequirementSchema = new mongoose.Schema({
  description: { type: String, required: true },
  customerNeed: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerNeed', required: true },
  specifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Specification' }],
});

module.exports = mongoose.model('Requirement', RequirementSchema);
