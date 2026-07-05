// utils/emailSender.js
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Report = require('../models/Report');

async function getTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function sendReportEmails(reportPath) {
  // collect recipients - admins and doctors
  const recipients = await User.find({ role: { $in: ['admin','doctor'] } }).select('email');
  if (!recipients || recipients.length === 0) {
    console.log('No recipients to email');
    return;
  }
  const transporter = await getTransport();
  const to = recipients.map(r => r.email).join(',');
  const report = await Report.findOne({ filePath: reportPath });
  const subject = 'Daily Patient Report - My Hospital';
  const text = 'Attached is the daily patient report.';
  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    text,
    attachments: [
      { filename: require('path').basename(reportPath), path: reportPath }
    ]
  });
  console.log('Report emailed to:', to);
}

module.exports = { sendReportEmails };
