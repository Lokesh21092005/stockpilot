Markdown
# StockPilot 📦

> An enterprise-grade AI inventory and procurement operations platform built for modern multi-warehouse logistics, atomic stock control, automated reorder triggers, and intelligent document extraction.

---

## 🌟 Key Features

* **Multi-Warehouse & SKU Tracking:** Manage discrete stock pools across regional warehouses with granular SKU, category, and unit-cost metrics.
* **Atomic Inventory Movements:** Execute `RECEIVE`, `ISSUE`, and adjustment workflows backed by transactional database consistency and negative-stock prevention.
* **Automated Reorder Engine:** Real-time low-stock alerts triggered against dynamic minimum threshold and reorder quantity policies.
* **AI Document Extraction:** Automated invoice, purchase order, and delivery-note parsing using Google Gemini into structured inventory movements.
* **Scheduled Operations & Digests:** Durable background jobs via Inngest for daily stock audits and weekly operations digests.
* **Enterprise Security & Rate Limiting:** Role-safe authentication via Clerk, paired with Arcjet bot detection and write-mutation rate limiting.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router, Server Actions) |
| **Language & UI** | React 19, Tailwind CSS, shadcn/ui, Lucide Icons, Recharts |
| **Database & ORM** | PostgreSQL (Neon), Prisma ORM |
| **Auth & Security** | Clerk Authentication, Arcjet Rate Limiting & Shield |
| **AI Engine** | Google Gemini API (`@google/genai`) |
| **Background Jobs** | Inngest (Durable Workflows & Cron Schedules) |
| **Communications** | Resend API, React Email |

---

## 🏛️ System Architecture

User / Scanner ──► Next.js App Router (Server Actions)
│
┌────────────────┼────────────────┐
▼                ▼                ▼
Clerk Auth     Arcjet Shield     Google Gemini (OCR)
│                │
└────────────────┼────────────────┘
▼
Prisma ORM (Transactions)
│
▼
PostgreSQL Database
▲
│
Inngest Scheduled Engine ──► Resend Alerts


---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `v22.x LTS` or higher
* **PostgreSQL Database**: Neon, Supabase, or local instance

### 1. Clone & Install
```bash
git clone [https://github.com/YOUR_USERNAME/stockpilot.git](https://github.com/YOUR_USERNAME/stockpilot.git)
cd stockpilot
npm install
2. Configure Environment Variables
Create a .env.local file in the root directory:

Code snippet
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# External APIs
GEMINI_API_KEY="your_gemini_key"
RESEND_API_KEY="re_..."
EMAIL_FROM="StockPilot <onboarding@resend.dev>"
ARCJET_KEY="ajkey_..."

# Inngest
INNGEST_EVENT_KEY="your_event_key"
INNGEST_SIGNING_KEY="your_signing_key"
3. Database Migration & Setup
Bash
npx prisma generate
npx prisma migrate dev --name init
4. Run Development Server
Bash
npm run dev
Open http://localhost:3000 in your browser.

🚢 Deployment (Vercel)
Connect your GitHub repository to Vercel.

In Build & Development Settings, set the build command to:

Bash
prisma generate && prisma migrate deploy && next build
Add all production environment variables from .env.local into Vercel Settings.

Connect the Inngest production endpoint: https://your-domain.vercel.app/api/inngest.

📄 License
This project is licensed under the MIT License.