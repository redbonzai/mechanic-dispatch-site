# GitHub Actions: Railway & Vercel

Workflows run on **push to `main`** (including merges) and can be run manually via **Actions → … → Run workflow**.

| Workflow | File | Purpose |
|----------|------|---------|
| Deploy API (Railway) | [.github/workflows/railway-deploy.yml](../.github/workflows/railway-deploy.yml) | `railway up --ci` from repo root |
| Deploy Frontend (Vercel) | [.github/workflows/vercel-deploy.yml](../.github/workflows/vercel-deploy.yml) | Production deploy via Vercel CLI |

## Railway — required GitHub secrets

| Secret | Required | Description |
|--------|----------|-------------|
| `RAILWAY_TOKEN` | Yes | **Project token** (Railway → your project → environment → **Settings → Tokens**). Not the same as a personal API token for all flows — prefer the project token from the docs. |
| `RAILWAY_SERVICE` | If multiple services | Exact **service name** (e.g. `mechanic-dispatch-api`). Omit only when the token/environment has a single deployable service. |

Project tokens are scoped to a **specific Railway environment** (e.g. production). No extra `DATABASE_URL` is needed in GitHub — those stay in Railway.

### Avoid deploying twice

If the **same** Railway service is also connected to **GitHub** in the Railway dashboard (auto-deploy on push), a push to `main` will trigger **both** Railway’s integration and this workflow. Disable one of them.

## Vercel — required GitHub secrets

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel account token (**Account Settings → Tokens**). |
| `VERCEL_ORG_ID` | Project **Team / Personal** ID (Project → Settings → General). |
| `VERCEL_PROJECT_ID` | **Project ID** (same screen). |

Vercel **project** settings should match [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) (root directory `web`, pnpm install/build overrides, Node 20).

### Overlap with Vercel Git integration

If the repo is already connected to Vercel with **production branch = main**, pushes to `main` may deploy from **both** Vercel’s Git integration and this workflow. Keep only one production path unless you intend duplicate deploys.
