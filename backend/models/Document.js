// models/Document.js
const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  file: { type: Buffer, required: true },
  documentType: { type: String, required: true }, // e.g., 'Recipe', 'Specification'
  version: { type: Number, required: true },
  reference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reference",
    required: true,
  },
});

module.exports = mongoose.model("Document", DocumentSchema);
