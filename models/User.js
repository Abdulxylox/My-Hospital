// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin','doctor','nurse','student'], default: 'student' },
  createdAt: { type: Date, default: Date.now }
});

// virtual password setter
userSchema.virtual('password').set(function(password) {
  this._plainPassword = password;
  this.passwordHash = bcrypt.hashSync(password, 10);
});

userSchema.methods.verifyPassword = function(password) {
  return bcrypt.compareSync(password, this.passwordHash);
};

// allow create with plain password string
userSchema.statics.create = async function(obj) {
  if (obj.password && !obj.passwordHash) {
    obj.passwordHash = bcrypt.hashSync(obj.password, 10);
    delete obj.password;
  }
  return mongoose.model('User').base.model('User').create(obj);
};

module.exports = mongoose.model('User', userSchema);
