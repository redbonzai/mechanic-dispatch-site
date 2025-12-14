# Domain-Driven Design Restructure Plan

## Current Structure (Incorrect)
```
src/
├── application/          # Application services
├── domain/               # Domain entities & repositories
├── infrastructure/       # Infrastructure implementations
├── interfaces/           # HTTP controllers & DTOs
└── modules/              # NestJS modules
```

## Target Structure (Correct DDD)
```
src/
├── domains/
│   ├── database/         # Database domain
│   │   ├── database.module.ts
│   │   └── prisma.service.ts
│   ├── mechanics/        # Mechanics domain
│   │   ├── mechanics.module.ts
│   │   ├── mechanics.service.ts
│   │   ├── mechanics.controller.ts
│   │   ├── reviews.controller.ts
│   │   ├── entities/
│   │   ├── repositories/
│   │   ├── dto/
│   │   └── interfaces/
│   └── requests/         # Requests domain
│       ├── requests.module.ts
│       ├── requests.service.ts
│       ├── requests.controller.ts
│       ├── stripe-webhook.controller.ts
│       ├── entities/
│       ├── repositories/
│       ├── dto/
│       └── interfaces/
└── shared/               # Shared resources (if needed)
    └── payments/
        └── stripe/
```

## Migration Steps

### 1. Database Domain ✅
- [x] Create `domains/database/`
- [x] Move `infrastructure/database/database.module.ts` → `domains/database/database.module.ts`
- [x] Move `infrastructure/database/prisma.service.ts` → `domains/database/prisma.service.ts`

### 2. Mechanics Domain
- [ ] Create `domains/mechanics/` structure
- [ ] Move `modules/mechanics/mechanics.module.ts` → `domains/mechanics/mechanics.module.ts`
- [ ] Move `application/mechanics/mechanics.service.ts` → `domains/mechanics/mechanics.service.ts`
- [ ] Move `interfaces/http/mechanics.controller.ts` → `domains/mechanics/mechanics.controller.ts`
- [ ] Move `interfaces/http/admin.controller.ts` → `domains/mechanics/admin.controller.ts` (if mechanics-related)
- [ ] Move `domain/mechanics/entities/` → `domains/mechanics/entities/`
- [ ] Move `domain/mechanics/repositories/` → `domains/mechanics/repositories/`
- [ ] Move `infrastructure/mechanics/` → `domains/mechanics/infrastructure/`
- [ ] Move mechanics DTOs → `domains/mechanics/dto/`

### 3. Requests Domain
- [ ] Create `domains/requests/` structure
- [ ] Move `modules/requests/requests.module.ts` → `domains/requests/requests.module.ts`
- [ ] Move `application/requests/requests.service.ts` → `domains/requests/requests.service.ts`
- [ ] Move `interfaces/http/requests.controller.ts` → `domains/requests/requests.controller.ts`
- [ ] Move `interfaces/http/stripe-webhook.controller.ts` → `domains/requests/stripe-webhook.controller.ts`
- [ ] Move `domain/requests/entities/` → `domains/requests/entities/`
- [ ] Move `domain/requests/repositories/` → `domains/requests/repositories/`
- [ ] Move `infrastructure/requests/` → `domains/requests/infrastructure/`
- [ ] Move requests DTOs → `domains/requests/dto/`
- [ ] Move `infrastructure/payments/stripe/` → `domains/requests/infrastructure/stripe/` (or shared if used by multiple domains)

### 4. Update Imports
- [ ] Update all imports in mechanics domain files
- [ ] Update all imports in requests domain files
- [ ] Update `app.module.ts` to import from `domains/`
- [ ] Update `main.ts` if needed

### 5. Cleanup
- [ ] Remove old `application/`, `domain/`, `infrastructure/`, `interfaces/`, `modules/` folders
- [ ] Verify build works
- [ ] Test all endpoints

## Notes
- Stripe is only used by requests domain, so it should move to `domains/requests/infrastructure/stripe/`
- DatabaseModule is Global, so it can be imported once in app.module.ts
- Each domain module should be self-contained with all its dependencies





