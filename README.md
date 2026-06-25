# AI Use Case Finder

Describe a business challenge and get a prioritized AI use case analysis — powered by Google Gemini 2.5 Flash. Each analysis includes feasibility and impact scores, ROI estimates, a 30-60-90 day implementation roadmap, tech stack recommendations, and a downloadable PDF report.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS 4, shadcn/ui |
| Auth | Clerk |
| AI | Google Gemini 2.5 Flash (`@google/generative-ai`) |
| Database | PostgreSQL via Prisma 7 |
| PDF | `@react-pdf/renderer` |
| Charts | Recharts |
| Validation | Zod 4 |

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/venisha047-sketch/ai-use-case-finder.git
cd ai-use-case-finder
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in every value. See the table below for where to find each one.

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) → Get API Key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | [clerk.com](https://clerk.com) → Your app → API Keys |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys |
| `CLERK_WEBHOOK_SECRET` | Clerk Dashboard → Webhooks (see step 4) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local dev |

### 3. Set up the database

```bash
# Generate the Prisma client
npm run db:generate

# Create tables (development — creates a migration)
npm run db:migrate

# Or apply existing migrations only (production / CI)
npm run db:deploy
```

### 4. Configure the Clerk webhook

The app syncs Clerk users to PostgreSQL via a webhook. Without it, project creation will fail on a missing-user foreign key error.

1. Go to **Clerk Dashboard → Webhooks → Add Endpoint**
2. Set the URL to `https://yourdomain.com/api/webhooks/clerk` (use [ngrok](https://ngrok.com) for local dev)
3. Enable events: `user.created`, `user.updated`, `user.deleted`
4. Copy the **Signing Secret** into `CLERK_WEBHOOK_SECRET` in your `.env.local`

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Generate Prisma client + build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript compiler check |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Create and apply a new migration (dev) |
| `npm run db:deploy` | Apply existing migrations (production / CI) |
| `npm run db:studio` | Open Prisma Studio GUI |

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Clerk sign-in / sign-up pages
│   ├── (dashboard)/     # Protected app pages (projects, analysis, history)
│   ├── api/             # Route handlers
│   │   ├── analysis/    # Run analysis, get analysis, export PDF
│   │   ├── projects/    # Project CRUD + analysis history list
│   │   ├── dashboard/   # Stats endpoint
│   │   └── webhooks/    # Clerk user sync
│   ├── error.tsx        # Route-level error boundary
│   ├── global-error.tsx # Root-level error boundary
│   ├── loading.tsx      # Root loading state
│   └── not-found.tsx    # 404 page
├── components/
│   ├── analysis/        # Score gauges, charts, roadmap, tech stack, export button
│   ├── dashboard/       # Stats strip, trend chart, ROI chart, recent projects
│   ├── layout/          # Sidebar, top nav, page header
│   ├── projects/        # Project card, form, status badge
│   ├── shared/          # Empty/error/loading/confirm states
│   └── ui/              # shadcn/ui primitives
├── hooks/               # Client-side data fetching hooks
├── lib/
│   ├── env.ts           # Type-safe env var validation
│   ├── errors.ts        # AppError, withApiHandler, error factories
│   ├── gemini.ts        # Gemini AI client, prompting, Zod response parsing
│   ├── pdf.ts           # @react-pdf/renderer PDF generator
│   ├── prisma.ts        # Prisma client singleton
│   ├── repositories/    # Data access layer (Prisma queries)
│   ├── services/        # Business logic layer
│   ├── utils.ts         # Formatting helpers, label maps
│   └── validations.ts   # Zod schemas for all API inputs
└── types/               # Domain types, API contracts, Gemini response schema
```

## Deployment (Vercel)

```bash
# Install the Vercel CLI
npm i -g vercel

# Link to a Vercel project and deploy
vercel --prod
```

Set all environment variables from `.env.example` in the **Vercel Dashboard → Settings → Environment Variables**.

After deploying, update `NEXT_PUBLIC_APP_URL` to your production URL and re-configure the Clerk webhook to point to your live domain.

The `build` script runs `prisma generate` automatically, so no extra build command configuration is needed.

## Architecture

```
Pages/Components
    ↓ fetch()
Hooks (client-side)
    ↓ HTTP
API Routes (withApiHandler)
    ↓ validated input
Services (business logic, ownership checks)
    ↓
Repositories (Prisma queries)
    ↓
PostgreSQL
    ↑ also
Gemini AI (analysis.service.ts → gemini.ts)
```

## License

MIT
