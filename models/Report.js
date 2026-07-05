// models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  filePath: { type: String, required: true },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
