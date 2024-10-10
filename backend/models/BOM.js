const mongoose = require('mongoose');
const BOMResource = require("./BOMResource");
const ManufacturingProcess = require("./ManufacturingProcess");

const BOMSchema = new mongoose.Schema({
  name: { type: String, required: true },
  reference: { type: mongoose.Schema.Types.ObjectId, ref: 'Reference', required: true },
  totalCost: { type: Number, default: 0 },
  totalTime: { type: Number, default: 0 },
  manufacturingProcesses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ManufacturingProcess' }],
  bomResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BOMResource' }],
  specifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Specification' }],
});

BOMSchema.methods.calculateTotals = async function () {
  const bomResources = await BOMResource.find({ bom: this._id });
  const manufacturingProcesses = await ManufacturingProcess.find({ bom: this._id });

  const bomResourcesTotalCost = bomResources.reduce((sum, br) => sum + br.totalCost, 0);
  const manufacturingProcessesTotalCost = manufacturingProcesses.reduce((sum, mp) => sum + mp.totalCost, 0);

  this.totalCost = bomResourcesTotalCost + manufacturingProcessesTotalCost;

  const bomResourcesTotalTime = bomResources.reduce((sum, br) => sum + br.totalTime, 0);
  const manufacturingProcessesTotalTime = manufacturingProcesses.reduce((sum, mp) => sum + mp.totalTime, 0);

  this.totalTime = bomResourcesTotalTime + manufacturingProcessesTotalTime;

  await this.save();
};

  

  module.exports = mongoose.model('BOM', BOMSchema);
