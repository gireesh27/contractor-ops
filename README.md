# ContractorOps

ContractorOps is a site-to-bill automation platform for small contractors.

It helps small contractors, civil site engineers, interior contractors, builders, and subcontractors convert daily site work into organized BOQ records, labour and material tracking, measurements, client bills, PDF reports, WhatsApp updates, and payment follow-ups.

## Tech Stack

- Next.js App Router with TypeScript
- Tailwind CSS
- MongoDB with Mongoose models for all SaaS modules
- NextAuth Google login with email/password fallback
- Redis-aware cache and rate-limit helpers with safe no-cache fallback
- Razorpay payment collection with Cashfree Payment Gateway fallback
- Cloudinary upload support with local development fallback
- Professional PDF, XLSX, and DOCX export utilities
- API routes for tenant-scoped CRUD, project, labour, material, bill, payment, report, export, notification, file, and AI workflows
- Vercel-ready project structure

## Getting Started

```bash
cp .env.example .env
npm install
npm run dev
```

Set `MONGODB_URI` before creating a workspace. ContractorOps does not read hardcoded demo data; operational records are saved and retrieved from MongoDB with `organizationId` isolation.

## MVP Modules

- Authentication and organization setup
- Dashboard
- Projects
- BOQ and estimates
- Daily site progress
- Labour attendance
- Material tracking
- Measurement book
- Client billing
- Payments and outstanding follow-up
- Vendor and subcontractor management
- Site photos and proof
- Reports
- AI report generator placeholder
- Subscription and SaaS settings
- Internal admin panel
- Role and permission model
- Project scheduling
- Task tracking
- Equipment tracking
- Expenses
- Documents
- Notifications
- Calendar
- Admin panel

## Future Integrations

- Configure Google OAuth for production login.
- Configure Redis for dashboard cache, export/AI rate limiting, and notification queue placeholders.
- Configure Razorpay and Cashfree keys for customer collections.
- Configure Cloudinary for production file storage.
- Configure OpenAI or Gemini to enable AI-generated reports and insights.
