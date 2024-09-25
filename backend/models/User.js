// models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  fullAccess: { type: Boolean, default: false },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
  auditLogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AuditLog' }],
  accessControls: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AccessControl' }],
});

// Password hashing middleware
UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
UserSchema.methods.checkPassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', UserSchema);
