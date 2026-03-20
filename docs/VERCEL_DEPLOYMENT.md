# Vercel Deployment Guide (Angular Frontend)

This guide covers deploying the Angular app (`web/`) to Vercel using **pnpm** (the project's package manager for both API and web).

**CI:** To deploy from GitHub Actions on merge to `main`, see [GITHUB_DEPLOYMENTS.md](GITHUB_DEPLOYMENTS.md).

## Requirements

- **Node.js 20.x** – Required to avoid `ERR_INVALID_THIS` with older pnpm versions. Set in Vercel → Settings → General.
- **pnpm 9+** – The root `package.json` has `"packageManager": "pnpm@9.15.0"` for compatibility.

## Dashboard Settings

### Project Settings → General

- **Node.js Version:** `20.x`

### Project Settings → Build & Development Settings

| Setting           | Override | Value                                    |
|-------------------|----------|------------------------------------------|
| Root Directory    | ✅ On    | `web`                                    |
| Install Command   | ✅ On    | `pnpm install --filter mechanic-dispatch-web` |
| Build Command     | ✅ On    | `pnpm run build`                         |
| Output Directory  | ✅ On    | `dist/mechanic-dispatch-web`             |

## How It Works

- **Install:** Runs from repo root. `pnpm install --filter mechanic-dispatch-web` installs only the web package and its dependencies.
- **Build:** Runs from `web/` (Root Directory). `pnpm run build` runs the Angular build.
- **`.vercelignore`:** Excludes `node_modules`, `.nx`, `dist`, etc. The full repo is uploaded so the pnpm workspace is intact.

## Local `vercel build` and `vercel deploy`

Run from the **repo root** (pnpm workspace root):

```bash
# From repo root
vercel build
vercel --prod
```

If you run from `web/`, use `./web/scripts/vercel-deploy.sh` or run `vercel pull` from `web/` then `./scripts/fix-vercel-project.sh` to adjust `project.json` for local builds.

**"spawn sh ENOENT"** – Known Vercel CLI issue when using pnpm from `web/`. Running from the repo root usually avoids it.

**File limit:** If `vercel --prod` fails with "more than 15000 items", use `vercel --prod --archive=tgz`.

## If It Still Fails

1. Confirm **Node.js Version** is 20.x
2. Confirm **Override** is enabled for Install, Build, and Output Directory
3. Clear the build cache and redeploy
4. Ensure `pnpm-lock.yaml` and `pnpm-workspace.yaml` exist at the repo root
