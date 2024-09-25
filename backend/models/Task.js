// models/Task.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  description: { type: String, required: true },
  workflowStep: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkflowStep', required: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  status: { type: String, default: 'Pending' },
  dueDate: { type: Date },
});

module.exports = mongoose.model('Task', TaskSchema);
