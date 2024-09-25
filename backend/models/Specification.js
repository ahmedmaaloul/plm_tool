// models/Specification.js
const mongoose = require('mongoose');

const SpecificationSchema = new mongoose.Schema({
  detail: { type: String, required: true },
  requirement: { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement', required: true },
  bom: { type: mongoose.Schema.Types.ObjectId, ref: 'BOM' },
});

module.exports = mongoose.model('Specification', SpecificationSchema);
