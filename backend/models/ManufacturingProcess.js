// models/ManufacturingProcess.js
const mongoose = require('mongoose');

const ManufacturingProcessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  details: { type: String, required: true },
  bom: { type: mongoose.Schema.Types.ObjectId, ref: 'BOM', required: true },
  totalCost: { type: Number, default: 0 },
  totalTime: { type: Number, default: 0 },
  processResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProcessResource' }],
});
ManufacturingProcessSchema.methods.calculateTotals = async function () {
    const processResources = await mongoose.model('ProcessResource').find({ manufacturingProcess: this._id });
    this.totalCost = processResources.reduce((sum, pr) => sum + pr.totalCost, 0);
    this.totalTime = processResources.reduce((sum, pr) => sum + pr.totalTime, 0);
    await this.save();
  };
  

module.exports = mongoose.model('ManufacturingProcess', ManufacturingProcessSchema);
