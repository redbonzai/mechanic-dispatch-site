#!/bin/sh
# Docker Entrypoint Script
# Applies database schema and seeds data before starting the application

set -e

echo "Starting Mechanic Dispatch API..."

# Wait for the database TCP port to be reachable
echo "Waiting for database to be ready..."
until node -e "require('net').createConnection(5432, 'db').on('error', () => process.exit(1)).on('connect', () => process.exit(0))"; do
  echo "  Database is unavailable - retrying in 2s"
  sleep 2
done
echo "Database is ready!"

# Apply all pending Prisma migrations
echo "Applying database migrations..."
npx prisma migrate deploy
echo "Migrations complete!"

# Run Prisma seed (failure is non-fatal — data may already exist)
echo "Seeding database..."
npx prisma db seed || echo "Seeding skipped or already seeded"

# Hand off to the application
echo "Starting application..."
exec node dist/main.js
