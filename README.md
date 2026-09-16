# A11yScope

Automated accessibility auditing for modern websites.

A11yScope crawls a website, runs automated accessibility checks with axe-core and Playwright, and turns the results into an actionable accessibility report.

## Features

- JWT authentication
  - Register
  - Login
  - Logout
  - Protected application routes
- Project and website management
- Quick website scans
- Controlled internal crawling
  - Same-origin pages only
  - Maximum 10 pages per scan
- Automated accessibility auditing with axe-core
- Violation explorer
  - Severity
  - WCAG tags
  - Description
  - Why it matters
  - Affected HTML
  - CSS selector
  - Suggested remediation
  - axe documentation
- Accessibility score
- Scan history
- Score trend charts
- Scan-to-scan comparison
  - Fixed violations
  - Introduced violations
  - Unchanged violations
- Monitoring UI
- Settings/account UI
- JSON export / printable report support
- SSRF protection and scan safety controls
  - Private/local address blocking
  - URL validation
  - Timeouts
  - Page limits
  - Controlled concurrency

## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React
- TanStack Query
- Zustand
- Recharts

### Backend

- Node.js
- Express
- TypeScript
- Zod
- JWT
- bcrypt

### Database

- PostgreSQL
- Prisma 7
- Neon PostgreSQL

### Accessibility / Browser Automation

- Playwright
- axe-core
- @axe-core/playwright

### Monorepo

- pnpm
- Turborepo

## Architecture

```text
                    ┌─────────────────────┐
                    │       GitHub        │
                    │      Repository     │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
        ┌─────────────────┐        ┌────────────────────┐
        │     Vercel      │        │      Render        │
        │  Next.js Web UI │───────▶│  Express API       │
        └─────────────────┘        │  Playwright Worker │
                                   └─────────┬──────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │      Neon       │
                                    │   PostgreSQL    │
                                    └─────────────────┘
```

## Monorepo Structure

```text
a11yscope/
├── apps/
│   ├── web/                    # Next.js frontend
│   └── api/                    # Express REST API
├── packages/
│   ├── database/               # Prisma schema/client
│   ├── types/                  # Shared types
│   └── config/                 # Shared configuration
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── turbo.json
└── README.md
```

## Requirements

- Node.js 22+ recommended
- pnpm 12
- PostgreSQL / Neon database

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/Moksh91119/a11yscope.git
cd a11yscope
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure the API

Create:

```text
apps/api/.env
```

Example:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="replace-with-a-secret-at-least-32-characters"
PORT=4000
WEB_URL="http://localhost:3000"
```

### 4. Configure the frontend

Create:

```text
apps/web/.env.local
```

Example:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

### 5. Generate Prisma Client

```bash
pnpm --filter @a11yscope/database exec prisma generate
```

### 6. Apply migrations

For local development:

```bash
pnpm --filter @a11yscope/database exec prisma migrate dev
```

For an existing production database:

```bash
pnpm --filter @a11yscope/database exec prisma migrate deploy
```

### 7. Start the application

Run both applications:

```bash
pnpm dev
```

Or run them independently:

```bash
pnpm --filter @a11yscope/api dev
```

```bash
pnpm --filter @a11yscope/web dev
```

The default local URLs are:

- Frontend: `http://localhost:3000`
- API: `http://localhost:4000`
- API health check: `http://localhost:4000/api/health`

## Database

The Prisma schema is located at:

```text
packages/database/prisma/schema.prisma
```

The main entities are:

```text
User
 └── Project
      └── Website
           ├── Scan
           │    ├── Page
           │    │    └── ViolationOccurrence
           │    └── ...
           └── Monitoring
```

### Prisma Studio

```bash
pnpm --filter @a11yscope/database studio
```

## Scan Flow

A website scan follows this general flow:

```text
Create scan
    ↓
Validate URL
    ↓
SSRF protection
    ↓
Launch Playwright
    ↓
Crawl same-origin pages
    ↓
Limit to 10 pages
    ↓
Run axe-core on each page
    ↓
Normalize violations
    ↓
Calculate accessibility score
    ↓
Persist scan/page/violation data
    ↓
Display report
```

### Scan statuses

```text
QUEUED
  ↓
INITIALIZING
  ↓
CRAWLING
  ↓
ANALYZING
  ↓
GENERATING_REPORT
  ↓
COMPLETED
```

A scan can also end as:

```text
FAILED
CANCELLED
```

## Accessibility Scoring

The current scoring model assigns weighted penalties based on axe impact:

| Impact   | Penalty |
| -------- | ------: |
| Critical |      12 |
| Serious  |       6 |
| Moderate |       3 |
| Minor    |       1 |

The score is calculated from the resulting accessibility violations and is intended as a product-level signal rather than a replacement for manual accessibility testing.

## Security

Because A11yScope visits URLs supplied by users, the scanner includes protections against server-side request forgery.

Current protections include:

- URL validation
- Same-origin crawling
- Localhost blocking
- Private IPv4 range blocking
- IPv6 private/local address blocking
- DNS resolution checks
- Navigation timeouts
- Maximum page count
- Controlled scan concurrency

These controls are important because the scanner makes outbound requests from the backend server.

## API

The backend exposes REST endpoints for:

- Authentication
- Projects
- Websites
- Scans
- Scan reports
- Scan comparison
- Website scan history

Example health request:

```http
GET /api/health
```

Example scan request:

```http
POST /api/scans/websites/:websiteId
Authorization: Bearer <jwt>
```

## Deployment

The intended zero-cost deployment architecture is:

```text
Frontend → Vercel
API + Playwright → Render
Database → Neon
Source control → GitHub
```

### Production environment variables

#### API

```env
DATABASE_URL="production-neon-connection-string"
JWT_SECRET="production-secret-at-least-32-characters"
PORT="10000"
WEB_URL="https://your-vercel-domain.vercel.app"
```

#### Frontend

```env
NEXT_PUBLIC_API_URL="https://your-render-service.onrender.com/api"
```

Do not commit `.env`, `.env.local`, or production secrets to Git.

## Production Build

Type-check the database package:

```bash
pnpm --filter @a11yscope/database typecheck
```

Build the database package:

```bash
pnpm --filter @a11yscope/database build
```

Build the API:

```bash
pnpm --filter @a11yscope/api build
```

Build the frontend:

```bash
pnpm --filter @a11yscope/web build
```

## Current Scope

A11yScope intentionally focuses on the core accessibility auditing workflow.

Not currently included:

- Billing / Stripe
- Teams and organization RBAC
- OAuth
- Public API
- Browser extension
- Mobile application
- Redis
- Elasticsearch
- Microservices
- Kubernetes
- AI-generated accessibility fixes
- Email monitoring notifications

The goal is to keep the system deployable and maintainable while providing a credible end-to-end accessibility auditing product.

## Roadmap

Potential future improvements include:

- More advanced crawling controls
- Better scan scheduling
- Historical analytics
- Additional export formats
- Screenshot evidence storage
- Improved accessibility remediation workflows
- More detailed WCAG reporting
- Automated regression detection

## License

Private project. All rights reserved unless otherwise specified.
