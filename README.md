# My Hospital - Automated Report System (Offline)

Overview
- Local Node.js + Express backend + MongoDB + PDFKit + Nodemailer.
- Frontend: static vanilla HTML/CSS/JS in `frontend/`.
- Generates daily PDF patient reports at midnight, archives them in `reports/`, and emails them to admins/doctors.

Requirements
- Node.js 16+ (npm)
- Local MongoDB instance running (e.g., `mongod` on default port)
- Optional: a local SMTP (MailHog, MailCatcher) or remote SMTP credentials for Nodemailer.

Install & Run
1. Clone repository or copy files into a folder.
2. Install dependencies:
   npm install
3. Copy `.env.example` to `.env` and edit:
   - MONGO_URI (e.g. mongodb://localhost:27017/myhospital)
   - JWT_SECRET
   - SMTP_* (or use a local SMTP like MailHog)
   - BOOTSTRAP_ADMIN_EMAIL / BOOTSTRAP_ADMIN_PASS for initial admin creation
4. Start local MongoDB if not running.
5. Start the app:
   npm run dev
6. Open http://localhost:3000/ in your browser.
7. Login with the bootstrap admin credentials (if no users existed, an admin will be created automatically).

Notes for offline / 8GB laptop
- Everything runs locally. Ensure MongoDB runs locally.
- Avoid huge CSV imports on low-memory machines; split into smaller files.
- PDFKit generates small report PDFs; keep patient counts reasonable to limit memory.

Security notes
- Change JWT_SECRET and bootstrap admin password.
- This demo stores user password hashes and basic role checking. For production, add rate-limiting, CSRF protections, HTTPS, stronger password policies, and more robust input validation.

Files of interest
- server.js - app entry & cron scheduler
- models/* - mongoose models
- routes/* - API endpoints
- utils/pdfGenerator.js - PDF generation and report archive
- utils/emailSender.js - email notification
- frontend/* - static UI

Enjoy — the system is ready to run locally and produce daily reports at midnight.
