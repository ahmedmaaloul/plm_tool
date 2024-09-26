const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  reference: { type: mongoose.Schema.Types.ObjectId, ref: 'Reference', required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  invoices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' }],
  workflow: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow' },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
  requiredRoles: {
    // Actions mapped to arrays of role names
    type: Map,
    of: [String],
    default: {},
  },
});

module.exports = mongoose.model('Project', ProjectSchema);
