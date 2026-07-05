// routes/import.js - CSV import for patients
const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const Patient = require('../models/Patient');
const { authMiddleware, isRole } = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });

router.post('/patients', authMiddleware, isRole(['admin','nurse','doctor']), upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const results = [];
  const filePath = req.file.path;
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      // map CSV rows to patient schema as best effort
      const created = [];
      for (const row of results) {
        const doc = {
          name: row.name || row.Name || 'Unknown',
          mrn: row.mrn || row.MRN || undefined,
          dob: row.dob ? new Date(row.dob) : undefined,
          gender: row.gender || row.Gender || undefined,
          status: row.status || 'stable',
          notes: row.notes || ''
        };
        try {
          const p = await Patient.create(doc);
          created.push(p);
        } catch (err) {
          // ignore individual errors, continue
        }
      }
      // cleanup
      fs.unlinkSync(filePath);
      res.json({ imported: created.length });
    });
});

module.exports = router;
