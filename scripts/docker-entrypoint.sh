#!/bin/sh
# Docker Entrypoint Script
# Applies database schema and seeds data before starting the application

set -e

echo "Starting Mechanic Dispatch API..."

# Wait for the database TCP port to be reachable
# Uses DATABASE_URL when set (Railway), otherwise db:5432 (Docker Compose)
echo "Waiting for database to be ready..."
if [ -n "$DATABASE_URL" ]; then
  until node -e "
    const url = process.env.DATABASE_URL;
    if (!url) process.exit(1);
    const m = url.match(/@([^:\/]+):(\d+)/);
    if (!m) process.exit(1);
    const host = m[1];
    const port = parseInt(m[2], 10);
    require('net').createConnection(port, host).on('error', () => process.exit(1)).on('connect', () => process.exit(0));
  "; do
    echo "  Database is unavailable - retrying in 2s"
    sleep 2
  done
else
  until node -e "require('net').createConnection(5432, 'db').on('error', () => process.exit(1)).on('connect', () => process.exit(0))"; do
    echo "  Database is unavailable - retrying in 2s"
    sleep 2
  done
fi
echo "Database is ready!"

# Apply all pending Prisma migrations (use local CLI — runner image has no pnpm; npx spams npm notices)
echo "Applying database migrations..."
node node_modules/prisma/build/index.js migrate deploy
echo "Migrations complete!"

# Run Prisma seed (failure is non-fatal — data may already exist)
echo "Seeding database..."
node node_modules/prisma/build/index.js db seed || echo "Seeding skipped or already seeded"

# Hand off to the application
echo "Starting application..."
exec node dist/main.js
