# Vercel Deployment Guide (Angular Frontend)

This guide covers deploying the Angular app (`web/`) to Vercel when the repo is an Nx monorepo.

## The Problem

When Vercel detects Nx (via `nx.json` at the repo root), it **overrides** your project settings and runs `pnpm install` from the monorepo root. That causes:

- `ERR_INVALID_THIS` / `ERR_PNPM_META_FETCH_FAIL` (pnpm + Node 24 compatibility bug)
- `Ignoring not compatible lockfile` warnings

The `web/vercel.json` and Root Directory = `web` are ignored by the Nx integration.

## The Solution: Dashboard Overrides

You **must** override the build settings in the Vercel dashboard so they take precedence over the Nx integration.

### Step 1: Project Settings → General

1. Go to your Vercel project → **Settings** → **General**
2. Under **Node.js Version**, select **20.x** (not 24.x)
   - Node 20 avoids the pnpm `ERR_INVALID_THIS` bug
   - Reverting to Node 20 is **not** a mistake; it's required until pnpm/Vercel fix the Node 24 issue

### Step 2: Project Settings → Build & Development Settings

1. Go to **Settings** → **Build & Development Settings**
2. Set **Root Directory** to `web`
3. Enable **Override** for each of these and set:

| Setting           | Override | Value                          |
|-------------------|----------|--------------------------------|
| Install Command   | ✅ On    | `npm install --include=dev`    |
| Build Command     | ✅ On    | `npm run build`                |
| Output Directory  | ✅ On    | `dist/mechanic-dispatch-web`  |

The Override toggle is critical—it forces Vercel to use your values instead of the Nx defaults.

### Step 3: Redeploy

1. Clear the build cache: **Settings** → **General** → **Build Cache** → **Clear**
2. Trigger a new deployment (push a commit or click **Redeploy**)

## Why This Works

- **`npm install --include=dev`** ensures devDependencies (e.g. `@angular/cli`) are installed; Vercel may set `NODE_ENV=production` which would otherwise skip them
- **Node 20** is the recommended runtime until the upstream issue is fixed
- **Dashboard overrides** take precedence over Nx auto-configuration
- **Root Directory = `web`** ensures the build runs from the Angular app directory

## Files in This Repo

| File                | Purpose                                                |
|---------------------|--------------------------------------------------------|
| `web/vercel.json`   | Config for when overrides aren't used (Nx overrides it) |
| `web/.nvmrc`       | Pins Node 20 for local/dev                             |
| `web/package.json`  | `engines.node` and `packageManager: npm`               |

## If It Still Fails

1. Confirm **Override** is enabled for Install Command, Build Command, and Output Directory
2. Confirm **Node.js Version** is 20.x
3. If you see `Cannot find module '.../web/node_modules/@angular/cli/bin/ng.js'`, the Nx integration may be running install from the repo root. Try changing Install Command to: `cd web && npm install --include=dev`
4. Clear the build cache and redeploy
5. Check the build logs—you should see `npm install` and `npm run build`, not `pnpm install`
