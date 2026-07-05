// models/Patient.js
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: Date },
  gender: { type: String, enum: ['male','female','other'], default: 'other' },
  mrn: { type: String, unique: true, sparse: true },
  admittedAt: { type: Date },
  status: { type: String, default: 'stable' },
  notes: { type: String },
  history: [{ date: Date, note: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', patientSchema);
