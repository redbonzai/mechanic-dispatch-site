#!/bin/sh
# Run Vercel CLI from web/ (app directory).
# Usage: ./scripts/vercel-deploy.sh [vercel args...]
# Example: ./scripts/vercel-deploy.sh build
# Example: ./scripts/vercel-deploy.sh --prod
# Note: project.json must use npm (not pnpm) to avoid "spawn sh ENOENT".
cd "$(dirname "$0")/.." && exec vercel "$@"
