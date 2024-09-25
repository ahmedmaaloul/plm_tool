// models/AccessControl.js
const mongoose = require('mongoose');

const AccessControlSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hasFullAccess: { type: Boolean, default: false },
});

module.exports = mongoose.model('AccessControl', AccessControlSchema);
