// models/Workflow.js
const mongoose = require('mongoose');

const WorkflowSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  workflowSteps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WorkflowStep' }],
});

module.exports = mongoose.model('Workflow', WorkflowSchema);
