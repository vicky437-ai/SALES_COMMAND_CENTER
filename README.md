# Sales Command Center

AI-powered sales pipeline analytics dashboard built with **Snowflake App Runtime** (Next.js) and **Cortex AI**. Designed as a demo showcasing how CoCo (Cortex Code) can vibe-code a full-stack app that runs entirely inside Snowflake — zero data egress, sub-second queries.

![Powered by Snowflake App Runtime](https://img.shields.io/badge/Snowflake_App_Runtime-Next.js-38bdf8?style=flat-square&logo=snowflake)
![Cortex AI](https://img.shields.io/badge/Cortex_AI-Natural_Language-22d3ee?style=flat-square)

---

## Features

| Feature | Description |
|---------|-------------|
| **KPI Cards** | Total Revenue, Deals Won, Avg Deal Size, Pipeline Value — live from Snowflake |
| **Cortex AI Search** | Natural language questions → AI-generated answers using `SNOWFLAKE.CORTEX.COMPLETE` |
| **Pipeline Funnel** | Visual breakdown by stage (Discovery → Proposal → Negotiation → Closed Won/Lost) |
| **Rep Leaderboard** | Quota attainment ranking with color-coded progress bars |
| **Dark Theme** | Professional dark UI inspired by Snowflake Summit demo aesthetic |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Snowflake App Runtime (SPCS)                  │
│                                                                 │
│  ┌──────────────┐    ┌──────────────────────────────────────┐   │
│  │   Next.js    │    │         API Routes (Server)           │   │
│  │   Frontend   │───▶│                                      │   │
│  │  (React 19)  │    │  /api/kpis        → SELECT aggregates│   │
│  │              │    │  /api/pipeline    → SELECT by stage   │   │
│  │  Components: │    │  /api/leaderboard → SELECT + JOIN     │   │
│  │  • KPICards  │    │  /api/ask         → CORTEX.COMPLETE   │   │
│  │  • AISearch  │    │                                      │   │
│  │  • Pipeline  │    └───────────────┬──────────────────────┘   │
│  │  • Leaders   │                    │                          │
│  └──────────────┘                    ▼                          │
│                         ┌─────────────────────────┐             │
│                         │   Snowflake SDK (OAuth)  │             │
│                         │   Connection Pool        │             │
│                         └────────────┬────────────┘             │
└──────────────────────────────────────┼──────────────────────────┘
                                       │
                                       ▼
                    ┌──────────────────────────────────┐
                    │       MERIDIAN_SALES.GOLD         │
                    │                                  │
                    │  Q2_DEALS (92 rows)              │
                    │  Q2_REPS  (10 rows)              │
                    │  Q1_DEALS (88 rows)              │
                    │  Q1_REPS  (10 rows)              │
                    └──────────────────────────────────┘
                                       │
                                       ▼
                    ┌──────────────────────────────────┐
                    │    SNOWFLAKE.CORTEX.COMPLETE      │
                    │    (claude-sonnet-4-6)                 │
                    │    Natural language Q&A           │
                    └──────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (Turbopack) |
| Frontend | React 19, Recharts, Lucide Icons |
| Backend | Next.js API Routes + Snowflake Node.js SDK |
| AI | Snowflake Cortex COMPLETE (claude-sonnet-4-6) |
| Auth | SPCS OAuth (owner's rights) |
| Deploy | `snow app deploy` → Snowpark Container Services |
| Data | MERIDIAN_SALES.GOLD (Snowflake tables) |

---

## Prerequisites

- **Node.js** v18+ (v26 recommended)
- **Snowflake CLI** (`snow`) v3.17+ — [Install guide](https://docs.snowflake.com/en/developer-guide/snowflake-cli/installation/installation)
- **Snowflake account** with:
  - Access to `MERIDIAN_SALES.GOLD` schema (Q2_DEALS, Q2_REPS tables)
  - `SNOWFLAKE.CORTEX.COMPLETE` function available
  - A compute pool for deployment (optional for local dev)

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server (reads credentials from ~/.snowflake/config.toml)
npm run dev
```

The app automatically reads Snowflake credentials from your [Snowflake CLI connection](https://docs.snowflake.com/en/developer-guide/snowflake-cli/connecting/specify-credentials) in `~/.snowflake/config.toml`.

To use a specific connection:

```bash
SNOWFLAKE_CONNECTION_NAME=myconn npm run dev
```

Or provide env vars directly:

```bash
SNOWFLAKE_ACCOUNT=myaccount \
SNOWFLAKE_ACCOUNT_URL=https://myaccount.snowflakecomputing.com \
SNOWFLAKE_USER=myuser \
SNOWFLAKE_PASSWORD=mypassword \
SNOWFLAKE_WAREHOUSE=my_wh \
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deploy to Snowflake

```bash
# Set up deployment config (creates snowflake.yml)
snow app setup --app-name="SALES_COMMAND_CENTER"

# Deploy
snow app deploy
```

If your CLI doesn't support `snow app` yet:

```bash
snow __app setup --app-name="SALES_COMMAND_CENTER"
snow __app deploy
```

---

## Project Structure

```
sales-command-center/
├── app/
│   ├── layout.tsx               # Root layout — title, meta, global styles
│   ├── page.tsx                 # Main page — composes all components
│   ├── globals.css              # Dark theme CSS variables + component styles
│   └── api/
│       ├── kpis/route.ts        # GET — revenue, win rate, pipeline aggregates
│       ├── pipeline/route.ts    # GET — deal count + value by stage
│       ├── leaderboard/route.ts # GET — rep performance vs quota
│       └── ask/route.ts         # POST — Cortex AI natural language Q&A
├── components/
│   ├── KPICards.tsx             # KPI metric cards with sparkline bars
│   ├── AISearch.tsx             # Cortex AI search input + response
│   ├── PipelineFunnel.tsx       # Horizontal bar chart by pipeline stage
│   └── RepLeaderboard.tsx       # Ranked rep list with attainment bars
├── lib/
│   └── snowflake.ts             # Snowflake SDK connection pool (DO NOT EDIT)
├── public/
│   └── icon.svg                 # App icon (bar chart)
├── app.yml                      # App metadata (label, description, icon)
├── next.config.mjs              # Next.js config (DO NOT EDIT)
├── package.json                 # Dependencies
└── tsconfig.json                # TypeScript config
```

---

## Data Schema

### `MERIDIAN_SALES.GOLD.Q2_DEALS`

| Column | Type | Description |
|--------|------|-------------|
| DEAL_ID | VARCHAR | Unique deal identifier (OPP-001) |
| ACCOUNT_NAME | VARCHAR | Customer company name |
| SEGMENT | VARCHAR | Enterprise / Mid-Market / SMB |
| REGION | VARCHAR | West / Central / Northeast / Southeast |
| REP_ID | VARCHAR | Sales rep identifier (REP-01) |
| STAGE | VARCHAR | Closed Won / Closed Lost / Negotiation / Proposal / Discovery |
| DEAL_VALUE | NUMBER | Deal amount in USD |
| CLOSE_DATE | DATE | Actual or expected close date |
| CREATED_DATE | DATE | Deal creation date |
| PRODUCT_LINE | VARCHAR | Core Platform / Analytics Add-on |
| LOSS_REASON | VARCHAR | Reason for loss (null if not lost) |

### `MERIDIAN_SALES.GOLD.Q2_REPS`

| Column | Type | Description |
|--------|------|-------------|
| REP_ID | VARCHAR | Sales rep identifier |
| REP_NAME | VARCHAR | Full name |
| SEGMENT | VARCHAR | Enterprise / Mid-Market / SMB |
| REGION | VARCHAR | Territory region |
| QUOTA_Q1_2026 | NUMBER | Q1 quota target |
| QUOTA_Q2_2026 | NUMBER | Q2 quota target |
| MANAGER | VARCHAR | Manager name |
| HIRE_DATE | DATE | Rep hire date |

---

## Key Concepts

- **All queries are read-only** — the app only runs SELECT statements, never modifies data
- **`querySnowflake(sql)`** — server-side helper that returns `Record<string, any>[]`. Import in API routes or server components
- **`export const dynamic = "force-dynamic"`** — required on all pages/routes that query Snowflake (prevents build-time rendering)
- **Client components** cannot call `querySnowflake()` directly — they `fetch()` API routes instead
- **Cortex AI** — uses `SNOWFLAKE.CORTEX.COMPLETE('claude-sonnet-4-6', prompt)` for natural language answers grounded in schema context

---

## Example AI Questions

Try these in the search bar:

- "Which rep is at risk of missing quota?"
- "What's our win rate this quarter?"
- "Which product line drives more revenue?"
- "Compare Enterprise vs Mid-Market performance"
- "What regions are underperforming?"

---

## Built With

This app was entirely vibe-coded using [Cortex Code (CoCo)](https://docs.snowflake.com/en/user-guide/cortex-code/cortex-code) — Snowflake's AI-powered IDE. From idea to working app in a single session.

---

## License

Internal demo — Squadron Data.
