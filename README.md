# Private Real Estate Manager

A private property management app for tracking rental contracts, invoices, and tenant billing. Built for managing real estate rentals/share house with per-tenant invoicing, guest access codes, and admin controls.

This was whipped up quickly for myself for managing my tenants and collecting rent. So it isn't the best maintained codebase :p.

## Features

- **Property Management** -- Add properties with images, addresses, and tenant assignments
- **Tenant Billing** -- Create invoices per-property or per-tenant (e.g. share house bill splitting), with line items, categories, and file attachments
- **Contracts** -- Upload and manage rental contracts per property
- **Payments** -- Track tenant payments against invoice line items
- **Guest Access** -- Generate time-limited access codes so tenants can view their invoices without an account
- **Email Invoices** -- Send invoices directly to tenants via Resend
- **Admin Dashboard** -- Full admin controls with role-based access (admin vs tenant views)
- **OAuth Login** -- Google and Microsoft sign-in via Supabase Auth

## Getting Started

```bash
cp .env.example .env
pnpm install
pnpm db:push
pnpm dev
```

Requires a running Supabase instance (local via `supabase start` or hosted).
