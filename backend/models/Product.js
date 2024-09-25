// models/Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  references: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reference' }],
});

module.exports = mongoose.model('Product', ProductSchema);
