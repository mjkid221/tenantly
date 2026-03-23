# Tenantly

A property management platform for tracking rental contracts, invoices, tenant billing, and communications. Built for managing real estate rentals and share houses with per-tenant invoicing, direct messaging, document management, and admin controls.

[tenantly.icu](https://tenantly.icu)

<img width="1450" height="737" alt="Screenshot 2026-03-23 at 8 38 10 PM" src="https://github.com/user-attachments/assets/a9769e7b-40c6-47db-85ad-8c78c8672cd8" />

## Features

- **Property Management** -- Add properties with images, addresses, and tenant assignments
- **Tenant Billing** -- Create invoices per-property or per-tenant with line items, categories, attachments, and flexible charge methods (fixed, percentage of bill, full amount)
- **Multiple Payment Methods** -- Configure any number of payment options (AU bank transfer, Korean wire, PayPal, etc.) displayed on invoices and emails
- **Contracts** -- Upload and manage rental contracts per property with versioning
- **Property Documents** -- Upload and manage entry condition reports, inspections, maintenance records, and insurance documents
- **Direct Messaging** -- Floating chat widget for tenant-admin communication, grouped by property with unread indicators
- **Payments** -- Track tenant payments against invoice line items with proof uploads
- **File Preview** -- In-app preview modal for images and PDFs with backdrop blur
- **Guest Access** -- Generate time-limited access codes for tenants to view property details without an account
- **Email Invoices** -- Send invoices to tenants via Resend with payment method details included
- **Unread Message Digest** -- Daily cron emails admins a summary of unread messages
- **Magic Link Login** -- Email-based passwordless login alongside Google and Microsoft OAuth
- **Admin Dashboard** -- Role-based access control (admin vs tenant), invoice categories, payment method configuration, and admin management
- **Apple-style Emails** -- Clean, minimal invoice and magic link email templates

## Tech Stack

- **Framework**: Next.js 15 (App Router) with React 19
- **Database**: PostgreSQL via Supabase with Drizzle ORM
- **Auth**: Supabase Auth (Google OAuth, Microsoft OAuth, Magic Link)
- **Storage**: Supabase Storage (property images, contracts, documents, invoice attachments)
- **Email**: Resend
- **API**: tRPC with React Query
- **UI**: shadcn/ui, Tailwind CSS, Lucide icons
- **Deployment**: Vercel

## Getting Started

```bash
cp .env.example .env
supabase start
pnpm install
pnpm db:push
pnpm dev
```

Requires a running Supabase instance (local via `supabase start` or hosted).

## Environment Variables

- `DATABASE_URL` -- PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` -- Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` -- Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` -- Supabase service role key
- `RESEND_API_KEY` -- Resend API key for sending emails
- `NEXT_PUBLIC_SITE_URL` -- Public site URL (for OAuth redirects)
- `CRON_SECRET` -- Secret for authenticating cron job requests
