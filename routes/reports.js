// routes/reports.js
const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const path = require('path');
const { authMiddleware, isRole } = require('../middleware/auth');

// list reports
router.get('/', authMiddleware, isRole(['admin','doctor','nurse']), async (req, res) => {
  const reports = await Report.find().sort({ date: -1 }).limit(200);
  res.json(reports);
});

// download report
router.get('/download/:id', authMiddleware, isRole(['admin','doctor','nurse']), async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ error: 'Not found' });
  const file = path.resolve(report.filePath);
  res.download(file);
});

module.exports = router;
