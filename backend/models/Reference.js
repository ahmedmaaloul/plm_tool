// models/Reference.js
const mongoose = require('mongoose');

const ReferenceSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  description: { type: String },
  bom: { type: mongoose.Schema.Types.ObjectId, ref: 'BOM' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  cadFiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CADFile' }],
  documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  simulations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Simulation' }],
});

module.exports = mongoose.model('Reference', ReferenceSchema);
