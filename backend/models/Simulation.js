// models/Simulation.js
const mongoose = require('mongoose');

const SimulationSchema = new mongoose.Schema({
  results: { type: String, required: true },
  reference: { type: mongoose.Schema.Types.ObjectId, ref: 'Reference', required: true },
});

module.exports = mongoose.model('Simulation', SimulationSchema);
