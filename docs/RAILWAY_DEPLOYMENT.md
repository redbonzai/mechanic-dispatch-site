# Railway Deployment Guide

This document covers deploying FixGuide (mechanic-dispatch-site) to [Railway](https://railway.app/) with the frontend on Vercel.

**CI:** To deploy the API from GitHub Actions on merge to `main`, see [GITHUB_DEPLOYMENTS.md](GITHUB_DEPLOYMENTS.md).

## Architecture

| Service | Host | Deployment |
|---------|------|------------|
| **API** | `api.mechanicdispatch.com` | Railway (Dockerfile) |
| **PostgreSQL** | (internal) | Railway PostgreSQL plugin |
| **Frontend** | `mechanicdispatch.com` / `www.mechanicdispatch.com` | Vercel |

---

## Part 1: Railway (API + Database)

### 1. Create a Railway project

1. Go to [railway.app](https://railway.app/) and sign in with GitHub
2. Create a new project
3. Click **+ New** → **Database** → **PostgreSQL**
4. Click **+ New** → **GitHub Repo** → select `mechanic-dispatch-site`

### 2. Connect the API to the database

1. Click the **API** service (the one from GitHub)
2. Go to **Variables** (or **Settings** → **Service Variables**)
3. Click **+ New Variable** → **Add a Reference** (or **Raw Editor** to paste a value)
4. Select the **PostgreSQL** service → choose `DATABASE_URL`
5. Railway injects `DATABASE_URL` automatically. If you see an empty value field, use **Add a Reference** to link the Postgres service’s `DATABASE_URL` variable.

### 3. Configure the API service

- **Root directory:** **`.`** (repository root). This monorepo’s Nest app is **`src/main.ts`** at the root — there is **no** `api/` package folder. Setting Root Directory to `api` builds the wrong context and breaks deploys.
- **Build:** Prefer **Dockerfile** at repo root (`Dockerfile`). In Railway: **Settings → Build** → use **Dockerfile** (not Nixpacks) if auto-detect picks the wrong stack.
- The entrypoint (`scripts/docker-entrypoint.sh`) runs migrations and seed before starting; it uses `DATABASE_URL` when set (Railway) or `db:5432` (Docker Compose)

**PostgreSQL on Railway vs local:** The `docker-compose.yml` and `Dockerfile` are for local development. On Railway, PostgreSQL is a **managed plugin** (add via **+ New** → **Database** → **PostgreSQL**), not a container from your repo. The API connects to Railway’s Postgres via `DATABASE_URL`; you do not configure a Postgres container in the deploy UI.

### 4. Add custom domain `api.mechanicdispatch.com`

1. In the API service, go to **Settings** → **Networking** → **Public Networking**
2. Click **Generate Domain** (or use the existing one)
3. Click **Custom Domain** → add `api.mechanicdispatch.com`
4. Railway will show the CNAME target (e.g. `skuqx4hy.up.railway.app`)

### 5. DNS: Add CNAME for api subdomain

At your DNS provider (or Cloudflare), add:

| Type | Name | Value |
|------|------|-------|
| CNAME | `api` | **Exact** hostname Railway shows for *this* service (e.g. `mechanic-dispatch-api-production.up.railway.app` — **no** `https://`, trailing dot is OK) |
| TXT | `_railway-verify` (or as shown) | **Exact** `railway-verify=...` string from Railway’s “Configure DNS” modal — if you changed services or re-added the domain, the token may change |

**Important:** The CNAME target is **per service** and can differ from an older deploy URL (e.g. `rapffnsk.up.railway.app`). If Railway shows “DNS configuration error,” the CNAME at the registrar must match the **current** value in **Settings → Networking** for `api.mechanicdispatch.com`, not an old screenshot.

### 6. Environment variables (API service)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | From PostgreSQL service reference (see step 2) |
| _(none)_ | **`PORT`** is injected by Railway — the app listens on `PORT` first, then `APP_PORT`, then `3000` for local Docker |
| `APP_PORT` | Optional; used when `PORT` is not set (e.g. local Docker Compose) |
| `APP_URL` | `https://mechanicdispatch.com` |
| `CLIENT_ORIGIN` | `https://mechanicdispatch.com,https://www.mechanicdispatch.com` (include every Vercel production + preview origin that must call the API) |
| `STRIPE_SECRET_KEY` | Stripe key |
| `STRIPE_WEBHOOK_SECRET` | From Stripe webhook for `https://api.mechanicdispatch.com/webhooks/stripe` |
| `STRIPE_PRICE_BASIC` | Stripe Price ID |
| `STRIPE_PRICE_PRO` | Stripe Price ID |
| `STRIPE_PRICE_PREMIUM` | Stripe Price ID |
| `GA4_*`, `SMTP_*` | Optional |

---

## Part 2: Vercel (Frontend)

### 1. Import project

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import `redbonzai/mechanic-dispatch-site`
3. **Root Directory:** `web` (click Edit and set to `web`)

### 2. Build settings

| Field | Value |
|-------|-------|
| **Framework Preset** | Angular |
| **Root Directory** | `web` |
| **Install Command** | Override: `npm install` |
| **Build Command** | Override: `npm run build` |
| **Output Directory** | Override: `dist/mechanic-dispatch-web` |

Vercel's Nx integration overrides `vercel.json` and forces `pnpm install`, causing `ERR_INVALID_THIS`. When Vercel’s Nx detection would otherwise run `pnpm install`. Enable **Override** for Install/Build/Output in Build & Development Settings. Set Node.js to `20.x` in General. See [docs/VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md).

### 3. Environment variables (Vercel)

| Name | Value |
|------|-------|
| `NG_APP_API_URL` | `https://api.mechanicdispatch.com` |

*Note: The Angular app uses `environment.prod.ts` which has `apiUrl: 'https://api.mechanicdispatch.com'` baked in. If you need to override at build time, you'd need a custom build script. For now, the committed value in `environment.prod.ts` is used.*

### 4. Deploy

Click **Deploy**. Vercel will build the Angular app and serve it.

---

## Part 3: CORS and Stripe webhook

- **CORS:** The API's `CLIENT_ORIGIN` must include your Vercel URLs (e.g. `https://mechanicdispatch.com`, `https://www.mechanicdispatch.com`, and any `*.vercel.app` preview URLs if needed)
- **Stripe webhook:** Create a webhook in Stripe for `https://api.mechanicdispatch.com/webhooks/stripe` and set `STRIPE_WEBHOOK_SECRET`

---

## Part 4: GitHub → Railway (main + feature branches)

- **Production on `main`:** In the API service → **Settings** → **Deploy**, keep **Trigger on push** enabled for branch `main`. Merging a PR into `main` should trigger a new deploy.
- **Preview / dev from PRs:** Enable **Deploy on PR** (same screen) so Railway opens environments or preview deploys per PR (Railway UI naming may vary). Alternatively, create a second **environment** or duplicate service with **branch** set to a feature branch for long-lived dev testing.

---

## Troubleshooting

### Railway shows “Not found” / “The train has not arrived at the station” on `api.mechanicdispatch.com`

1. **CNAME points to the wrong `*.up.railway.app` host** — Update registrar to the hostname shown **today** on the API service’s custom domain panel.
2. **TXT verification still pending** — Until ownership verifies, routing may fail; use the latest `_railway-verify` token from Railway (remove stale TXT values if you re-added the domain).
3. **Wrong Root Directory** — This repo’s Nest app lives at the **repository root** (`src/main.ts`, root `Dockerfile`). **Root directory must be `.` (empty)** — not `api/`. A path like `/api` builds the wrong tree and can produce a service that never binds correctly.

### `mechanic-dispatch-api.railway.internal` does not open in a browser

That hostname is **private cluster DNS** between Railway services. Use the public `*.up.railway.app` URL or your custom domain from a normal client.

### App deploys “green” but HTTP fails

Railway sets **`PORT`** (often `8080`). The Nest app must listen on that port — it now prefers `process.env.PORT` over `APP_PORT`.

### Database / seed

Add **PostgreSQL** in the same project, **reference** `DATABASE_URL` on the API service. The Docker image entrypoint runs migrations and seed when `DATABASE_URL` is set — check deploy logs for Prisma errors.

---

## Custom domain: mechanic-dispatch.com

Railway requests two DNS records:

1. **CNAME** — Name: `@`, Value: `xan4eovc.up.railway.app`
2. **TXT** — Name: `_railway-verify`, Value: `railway-verify=...`

### The CNAME problem

**CNAME records cannot be used for the root domain (`@`).** This is a DNS standard limitation (RFC 1034). Many registrars (including GoDaddy/domaincontrol) reject `CNAME` at `@` with "Record data is invalid."

### Solutions

#### Option 1: Use Cloudflare (recommended)

1. Add your domain to [Cloudflare](https://cloudflare.com) (free plan)
2. Change nameservers at your registrar to Cloudflare's
3. In Cloudflare DNS:
   - Add **CNAME** — Name: `@`, Target: `xan4eovc.up.railway.app`
   - Add **TXT** — Name: `_railway-verify`, Value: (Railway's token)
4. Set SSL/TLS to **Full**
5. Cloudflare handles CNAME flattening at the root; Railway will verify within ~1 hour

#### Option 2: Use www only

1. Add **CNAME** — Name: `www`, Value: `xan4eovc.up.railway.app` (this works on any registrar)
2. Add **TXT** — Name: `_railway-verify`, Value: (Railway's token)
3. In Railway, add `www.mechanic-dispatch.com` as the custom domain (not the root)
4. At your registrar, set up **domain forwarding** from `mechanic-dispatch.com` → `www.mechanic-dispatch.com`

#### Option 3: ALIAS/ANAME (if your registrar supports it)

Some registrars (e.g. DNSimple, DNS Made Easy) support **ALIAS** or **ANAME** records at the root. These behave like CNAME but are valid at the apex. Check your registrar's docs.

### Current records at cheap-registrar.com

Your current setup shows:

- **A record** `@` → `Parked` — Remove or replace this; it conflicts with Railway
- **CNAME** `www` → `mechanicdispatch.com.` — Update to `xan4eovc.up.railway.app` for Railway
- **NS** — Leave as-is unless you switch to Cloudflare

**Recommended path:** Use Cloudflare for DNS so you can add the root CNAME. No domain transfer needed — just point nameservers to Cloudflare.
