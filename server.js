// server.js - main entry point
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');

dotenv.config();

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const reportRoutes = require('./routes/reports');
const importRoutes = require('./routes/import');

const { generateDailyReport } = require('./utils/pdfGenerator');
const { sendReportEmails } = require('./utils/emailSender');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/import', importRoutes);

// serve frontend static files from ./frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// initial admin bootstrap (create admin user if none exists)
async function bootstrapAdmin() {
  try {
    const count = await User.countDocuments({});
    if (count === 0 && process.env.BOOTSTRAP_ADMIN_EMAIL && process.env.BOOTSTRAP_ADMIN_PASS) {
      const UserModel = require('./models/User');
      await UserModel.create({
        name: 'Administrator',
        email: process.env.BOOTSTRAP_ADMIN_EMAIL,
        password: process.env.BOOTSTRAP_ADMIN_PASS,
        role: 'admin'
      });
      console.log('Bootstrap admin created:', process.env.BOOTSTRAP_ADMIN_EMAIL);
    }
  } catch (err) {
    console.error('Bootstrap admin error:', err);
  }
}
bootstrapAdmin();

// schedule daily report at midnight (server's local time)
cron.schedule('0 0 * * *', async () => {
  console.log('[cron] Running daily report generation at', new Date().toISOString());
  try {
    const reportPath = await generateDailyReport(); // returns path & doc
    console.log('[cron] Report generated:', reportPath);
    // send notifications to doctors/admins
    await sendReportEmails(reportPath);
  } catch (err) {
    console.error('[cron] Error generating report:', err);
  }
});

// optional manual trigger for admin
if (process.env.ENABLE_MANUAL_REPORT_ENDPOINT === 'true') {
  const { authMiddleware, isRole } = require('./middleware/auth');
  app.post('/api/admin/generate-report', authMiddleware, isRole('admin'), async (req, res) => {
    try {
      const { path: reportPath } = await generateDailyReport(req.user._id);
      await sendReportEmails(reportPath);
      res.json({ ok: true, reportPath });
    } catch (err) {
      console.error('manual report error', err);
      res.status(500).json({ ok: false, error: err.message });
    }
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Server listening on port ${PORT}`));
