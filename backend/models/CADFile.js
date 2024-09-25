// models/CADFile.js
const mongoose = require('mongoose');

const CADFileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  data: { type: Buffer, required: true },
  reference: { type: mongoose.Schema.Types.ObjectId, ref: 'Reference', required: true },
});

module.exports = mongoose.model('CADFile', CADFileSchema);
