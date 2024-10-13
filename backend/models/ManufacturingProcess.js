const mongoose = require('mongoose');

const ManufacturingProcessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  details: { type: String, required: true },
  bom: { type: mongoose.Schema.Types.ObjectId, ref: 'BOM', required: true },
  resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
  quantity: { type: Number, required: true },
  totalCost: { type: Number, default: 0 },
  totalTime: { type: Number, default: 0 },
});

ManufacturingProcessSchema.methods.calculateTotals = async function () {
  const resource = await mongoose.model('Resource').findById(this.resource);
  if (resource) {
    this.totalCost = resource.unitCost * this.quantity;
    this.totalTime = resource.unitTime * this.quantity;
    await this.save();
  } else {
    throw new Error('Resource not found during total calculation');
  }
};

module.exports = mongoose.model('ManufacturingProcess', ManufacturingProcessSchema);
