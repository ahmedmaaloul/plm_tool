// models/ProcessResource.js
const mongoose = require('mongoose');

const ProcessResourceSchema = new mongoose.Schema({
  manufacturingProcess: { type: mongoose.Schema.Types.ObjectId, ref: 'ManufacturingProcess', required: true },
  resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
  quantity: { type: Number, required: true },
  totalCost: { type: Number, default: 0 },
  totalTime: { type: Number, default: 0 },
});

ProcessResourceSchema.methods.calculateTotals = async function () {
    const resource = await mongoose.model('Resource').findById(this.resource);
    this.totalCost = this.quantity * resource.unitCost;
    this.totalTime = this.quantity * resource.unitTime;
    await this.save();
  };
  

module.exports = mongoose.model('ProcessResource', ProcessResourceSchema);
