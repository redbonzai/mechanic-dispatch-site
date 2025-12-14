#!/bin/bash
# Restructure to domain-driven design
# This script moves files to the correct domain structure

set -e

cd "$(dirname "$0")/.."

echo "🔄 Restructuring to domain-driven design..."

# Create domain directories
mkdir -p src/domains/database
mkdir -p src/domains/mechanics/{repositories,entities,infrastructure,dto,interfaces}
mkdir -p src/domains/requests/{repositories,entities,enums,infrastructure,dto,interfaces}

# Database domain (already created, but ensure it's correct)
echo "📦 Setting up database domain..."
# Already done

# Mechanics domain
echo "🔧 Setting up mechanics domain..."

# Move module
cp src/modules/mechanics/mechanics.module.ts src/domains/mechanics/mechanics.module.ts

# Move service
cp src/application/mechanics/mechanics.service.ts src/domains/mechanics/mechanics.service.ts

# Move controllers
cp src/interfaces/http/mechanics.controller.ts src/domains/mechanics/mechanics.controller.ts
cp src/interfaces/http/admin.controller.ts src/domains/mechanics/admin.controller.ts

# Move entities
cp -r src/domain/mechanics/entities/* src/domains/mechanics/entities/

# Move repositories (interfaces)
cp -r src/domain/mechanics/repositories/* src/domains/mechanics/repositories/

# Move infrastructure (implementations)
cp -r src/infrastructure/mechanics/* src/domains/mechanics/infrastructure/

# Move DTOs
cp src/interfaces/http/dto/create-mechanic.dto.ts src/domains/mechanics/dto/
cp src/interfaces/http/dto/create-review.dto.ts src/domains/mechanics/dto/

# Requests domain
echo "📋 Setting up requests domain..."

# Move module
cp src/modules/requests/requests.module.ts src/domains/requests/requests.module.ts

# Move service
cp src/application/requests/requests.service.ts src/domains/requests/requests.service.ts

# Move controllers
cp src/interfaces/http/requests.controller.ts src/domains/requests/requests.controller.ts
cp src/interfaces/http/stripe-webhook.controller.ts src/domains/requests/stripe-webhook.controller.ts

# Move entities
cp -r src/domain/requests/entities/* src/domains/requests/entities/

# Move enums
cp -r src/domain/requests/enums/* src/domains/requests/enums/

# Move repositories (interfaces)
cp -r src/domain/requests/repositories/* src/domains/requests/repositories/

# Move infrastructure (implementations)
cp -r src/infrastructure/requests/* src/domains/requests/infrastructure/

# Move Stripe (only used by requests)
mkdir -p src/domains/requests/infrastructure/stripe
cp -r src/infrastructure/payments/stripe/* src/domains/requests/infrastructure/stripe/

# Move DTOs
cp src/interfaces/http/dto/create-request.dto.ts src/domains/requests/dto/
cp src/interfaces/http/dto/create-work-log.dto.ts src/domains/requests/dto/
cp src/interfaces/http/dto/finalize-request.dto.ts src/domains/requests/dto/

echo "✅ File structure created!"
echo ""
echo "⚠️  Next steps:"
echo "  1. Update all import paths in the moved files"
echo "  2. Update app.module.ts to import from domains/"
echo "  3. Remove old directories after verification"





