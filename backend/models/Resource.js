// models/Resource.js
const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // 'Material', 'Labor', 'Equipment'
  description: { type: String },
  unitCost: { type: Number, required: true },
  unitTime: { type: Number, default: 0 }, // Time per unit, in hours
  unit: { type: String, required: true }, // e.g., 'kg', 'hour', 'piece'
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  bomResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BOMResource' }],
  processResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProcessResource' }],
});

module.exports = mongoose.model('Resource', ResourceSchema);
