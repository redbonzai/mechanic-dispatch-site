#!/bin/bash
# Docker Entrypoint Script
# Runs migrations and seeding before starting the application

set -e

echo "🚀 Starting Mechanic Dispatch API..."
echo ""

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until node -e "require('net').createConnection(5432, 'db').on('error', () => process.exit(1)).on('connect', () => process.exit(0))"; do
  echo "   Database is unavailable - sleeping"
  sleep 2
done
echo "✅ Database is ready!"
echo ""

# Run Prisma migrations
echo "📋 Running Prisma migrations..."
npx prisma migrate deploy
echo "✅ Migrations complete!"
echo ""

# Run Prisma seed
echo "🌱 Seeding database..."
npx prisma db seed || echo "⚠️  Seeding failed or already seeded (this is OK if database already has data)"
echo ""

# Start the application
echo "🎯 Starting application..."
echo ""
exec node dist/main.js
