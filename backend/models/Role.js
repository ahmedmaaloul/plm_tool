// models/Role.js
const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., 'Designer', 'Manager', 'Project Creator'
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  accessRights: [{ type: String, required: true }], // Array of access rights
});

module.exports = mongoose.model('Role', RoleSchema);
