// routes/patients.js
const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const { authMiddleware, isRole } = require('../middleware/auth');

// list patients - any authenticated user (view-only depends on role enforced on frontend)
router.get('/', authMiddleware, async (req, res) => {
  const patients = await Patient.find().sort({ createdAt: -1 }).limit(1000);
  res.json(patients);
});

// get single
router.get('/:id', authMiddleware, async (req, res) => {
  const p = await Patient.findById(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

// create - nurse/admin/doctor
router.post('/', authMiddleware, isRole(['admin','doctor','nurse']), async (req, res) => {
  try {
    const p = await Patient.create(req.body);
    res.json(p);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// update
router.put('/:id', authMiddleware, isRole(['admin','doctor','nurse']), async (req, res) => {
  try {
    const updated = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// delete - admin only
router.delete('/:id', authMiddleware, isRole('admin'), async (req, res) => {
  await Patient.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
