#!/bin/bash
# Cleanup script to remove old directory structure
# Run this after verifying the new structure is working

set -e

cd "$(dirname "$0")/.."

echo "🧹 Cleaning up old directory structure..."

# Remove old root-level directories
rm -rf src/application
rm -rf src/domain
rm -rf src/modules
rm -rf src/interfaces
rm -rf src/infrastructure

# Remove old subdirectories from domains
rm -rf src/domains/mechanics/{dto,entities,repositories,infrastructure}
rm -rf src/domains/requests/{dto,entities,enums,repositories,infrastructure}

# Move stripe out of infrastructure if it's still there
if [ -d "src/domains/requests/infrastructure/stripe" ]; then
  mv src/domains/requests/infrastructure/stripe src/domains/requests/
  rm -rf src/domains/requests/infrastructure
fi

# Remove stripe-webhook.controller.ts from domains/requests if it exists there
if [ -f "src/domains/requests/stripe-webhook.controller.ts" ]; then
  rm src/domains/requests/stripe-webhook.controller.ts
fi

echo "✅ Cleanup complete!"
echo ""
echo "Current structure:"
echo "  src/"
echo "    app.module.ts"
echo "    main.ts"
echo "    stripe-webhook.controller.ts"
echo "    domains/"
echo "      database/"
echo "      mechanics/"
echo "        - *.module.ts, *.service.ts, *.controller.ts"
echo "        - prisma-*.service.ts"
echo "        - interfaces/"
echo "      requests/"
echo "        - *.module.ts, *.service.ts, *.controller.ts"
echo "        - prisma-*.service.ts"
echo "        - stripe/"
echo "        - interfaces/"






