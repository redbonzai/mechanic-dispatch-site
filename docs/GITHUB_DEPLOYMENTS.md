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

## Vercel — GitHub secrets (where to find each value)

The **Deploy Frontend (Vercel)** workflow uses the GitHub Environment named **`production`** (see `environment: production` in the workflow). Store secrets here unless you prefer repository-wide secrets:

**GitHub:** Repository → **Settings** → **Environments** → **production** (create the environment if needed) → **Environment secrets** → add each name below **exactly** (not `VERSEL_TOKEN`).

You can instead add the same names under **Settings → Secrets and variables → Actions → Repository secrets** — GitHub merges them; if both exist, the environment value wins for jobs that declare `environment: production`.

### Where each value comes from (Vercel dashboard)

| GitHub secret | Where to get it in Vercel |
|---------------|---------------------------|
| **`VERCEL_TOKEN`** | **Vercel dashboard** → click your profile (top right) → **Account Settings** → **Tokens** → **Create** (scope: full account or enough to deploy — typical is a personal access token for CLI). Copy the token once; Vercel won’t show it again. |
| **`VERCEL_PROJECT_ID`** | Open your **frontend project** → **Settings** → **General** → **Project ID** (copy the value). |
| **`VERCEL_ORG_ID`** | Same **Settings → General** page: look for **Team / Personal ID** or the scope your project lives under. **If you only see Project ID:** open **Team Settings** for that team (or Hobby “Personal Account”) → **General** — the **Team ID** is your `VERCEL_ORG_ID`. |

**CLI alternative (local):** From the repo, run `pnpm dlx vercel@latest link` (log in when prompted), then read **`.vercel/project.json`** in the directory you linked — it contains `"orgId"` and `"projectId"`. Those map to **`VERCEL_ORG_ID`** and **`VERCEL_PROJECT_ID`**. Don’t commit that folder (it’s gitignored).

Vercel **project** settings should match [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) (root directory `web`, pnpm install/build overrides, Node 20).

### Overlap with Vercel Git integration

If the repo is already connected to Vercel with **production branch = main**, pushes to `main` may deploy from **both** Vercel’s Git integration and this workflow. Keep only one production path unless you intend duplicate deploys.
