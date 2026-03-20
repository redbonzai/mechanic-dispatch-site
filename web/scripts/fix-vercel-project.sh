#!/bin/sh
# Fix web/.vercel/project.json for local builds from web/.
# Run after vercel pull - it overwrites project.json with dashboard settings.
# Dashboard has rootDirectory=web (for Git deployment); locally we need "." when in web/.
# Also ensures npm (not pnpm) to avoid "spawn sh ENOENT".
set -e
cd "$(dirname "$0")/.."
PROJECT_JSON=".vercel/project.json"
[ -f "$PROJECT_JSON" ] || { echo "Missing $PROJECT_JSON (run vercel link first)"; exit 1; }
# Use node to edit JSON (portable)
node -e "
const fs = require('fs');
const p = '.vercel/project.json';
const j = JSON.parse(fs.readFileSync(p, 'utf8'));
j.settings.rootDirectory = '.';
j.settings.installCommand = 'pnpm install --filter mechanic-dispatch-web';
j.settings.buildCommand = 'pnpm run build';
j.settings.nodeVersion = '20.x';
fs.writeFileSync(p, JSON.stringify(j, null, 2));
console.log('Updated', p, 'for local build from web/');
"
