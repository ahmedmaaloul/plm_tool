// models/BOMResource.js
const mongoose = require('mongoose');

const BOMResourceSchema = new mongoose.Schema({
  bom: { type: mongoose.Schema.Types.ObjectId, ref: 'BOM', required: true },
  resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
  quantity: { type: Number, required: true },
  totalCost: { type: Number, default: 0 },
  totalTime: { type: Number, default: 0 },
});

module.exports = mongoose.model('BOMResource', BOMResourceSchema);
