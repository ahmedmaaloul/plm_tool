// models/RoleAssignment.js

const mongoose = require('mongoose');

const RoleAssignmentSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
});

module.exports = mongoose.model('RoleAssignment', RoleAssignmentSchema);
