# My Hospital - Automated Report System

A comprehensive hospital management system that automatically generates daily patient reports in PDF format at midnight, with role-based user authentication and email notifications.

## Features

✅ **Automated Report Generation** - Daily PDF reports generated at 12:00 AM  
✅ **Role-Based Authentication** - Doctor, Admin, Nurse, Student access levels  
✅ **Patient Records Management** - View and manage patient information  
✅ **Report History** - Archive and retrieve past reports  
✅ **Email Notifications** - Automated emails sent after report generation  
✅ **Responsive Design** - Mobile-friendly interface  
✅ **Print Functionality** - Easy printing of reports  
✅ **Data Import** - Import patient data from existing systems  

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **PDF Generation**: PDFKit
- **Email**: Nodemailer
- **Scheduling**: Node-Cron
- **Authentication**: JWT (JSON Web Tokens)

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure `.env` file (copy from `.env.example`)
4. Start backend: `npm run dev`
5. Open frontend files in browser

## User Roles

- **Admin**: Full system access, user management
- **Doctor**: View patient records, authorize treatments
- **Nurse**: Update patient records, monitor status
- **Student**: View-only access to patient data

## License

MIT
