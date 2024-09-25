// models/WorkflowStep.js
const mongoose = require('mongoose');

const WorkflowStepSchema = new mongoose.Schema({
  name: { type: String, required: true },
  order: { type: Number, required: true },
  workflow: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
});

module.exports = mongoose.model('WorkflowStep', WorkflowStepSchema);
