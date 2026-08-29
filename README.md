# StockPilot

StockPilot is an inventory and procurement operations platform for tracking products, warehouses, stock movements, reorder policies, and operational alerts.

## Features

- Warehouse and product management
- Receive, issue, and adjust inventory
- Atomic stock updates with Prisma transactions
- Reorder thresholds and low-stock monitoring
- AI-assisted invoice and delivery-note extraction
- Inventory KPIs and movement charts
- Scheduled low-stock alerts and weekly digests
- Clerk authentication and server-side authorization
- Arcjet rate limiting on protected write operations

## Tech stack

- Next.js App Router
- React
- PostgreSQL + Prisma
- Clerk
- Tailwind CSS + shadcn-style components
- React Hook Form + Zod
- Recharts
- Inngest
- Google Gemini
- Resend
- Arcjet

## Local setup

1. Install Node.js 22+ LTS and Git.
2. Copy `.env.example` to `.env.local` and add your service credentials.
3. Install dependencies:

```bash
npm install
```

4. Create the first database migration:

```bash
npx prisma migrate dev --name init
```

5. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Production

The production build uses `prisma migrate deploy` before `next build`. Keep the `prisma/migrations` directory in source control.

## Environment variables

See `.env.example` for the required variables. Never commit `.env`, `.env.local`, API keys, or production database credentials.
