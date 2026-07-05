// utils/pdfGenerator.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Patient = require('../models/Patient');
const Report = require('../models/Report');

async function generateDailyReport(generatedBy = null) {
  // fetch patients
  const patients = await Patient.find().sort({ name: 1 }).lean();
  // ensure reports dir
  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);
  const timestamp = new Date().toISOString().replace(/[:.]/g,'-');
  const filename = `daily-report-${timestamp}.pdf`;
  const filepath = path.join(reportsDir, filename);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    doc.fontSize(18).text('My Hospital - Daily Patient Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown();

    patients.forEach((p, i) => {
      doc.fontSize(12).text(`${i+1}. ${p.name} (${p.mrn || 'No MRN'})`, { continued: false });
      doc.fontSize(10).text(`DOB: ${p.dob ? new Date(p.dob).toLocaleDateString() : 'Unknown'} | Gender: ${p.gender || ''}`);
      doc.text(`Status: ${p.status || ''}`);
      if (p.notes) doc.text(`Notes: ${p.notes}`);
      doc.moveDown(0.5);
      if (doc.y > 720) doc.addPage();
    });

    doc.end();
    stream.on('finish', async () => {
      // save report record
      const r = await Report.create({ filePath: filepath, generatedBy });
      resolve({ path: filepath, reportId: r._id });
    });
    stream.on('error', reject);
  });
}

module.exports = { generateDailyReport };
