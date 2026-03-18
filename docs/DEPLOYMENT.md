# Deployment Guide

This document describes how to deploy the Mechanic Dispatch API to different environments.

## Environments

- **Development**: `develop` branch
- **Staging**: `staging` branch (if configured)
- **Production**: `main` branch (if configured)

## Development Deployment

### Using Docker Compose

```bash
# Start development environment
docker compose -f docker-compose.dev.yml up --build

# Or use the standard compose file
docker compose up --build
```

### Manual Deployment

1. **Build the application**:
   ```bash
   pnpm install
   pnpm build
   ```

2. **Set up the database**:
   ```bash
   pnpm db:setup
   ```

3. **Start the server**:
   ```bash
   pnpm start:prod
   ```

## CI/CD Pipeline

### GitHub Actions

The project includes GitHub Actions workflows:

- **`.github/workflows/ci.yml`**: Runs tests, linting, and builds on every push/PR
- **`.github/workflows/deploy-dev.yml`**: Deploys to development environment

### Automatic Deployment

When code is pushed to `develop`:
1. CI pipeline runs tests
2. Docker image is built and pushed to registry
3. Deployment workflow triggers (if configured)

### Manual Deployment

You can trigger deployment manually:

```bash
gh workflow run deploy-dev.yml
```

## Environment Variables

Required environment variables:

```bash
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NODE_ENV=production
APP_PORT=3000
CLIENT_ORIGIN=https://your-frontend.com
```

## Docker Deployment

### Build Image

```bash
docker build -t mechanic-dispatch-site-api .
```

### Run Container

```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL=... \
  -e STRIPE_SECRET_KEY=... \
  -e STRIPE_WEBHOOK_SECRET=... \
 mechanic-dispatch-site-api
```

### Using Docker Compose

```bash
docker compose up -d
```

## Health Checks

After deployment, verify the API is running:

```bash
curl http://your-server:3000/mechanics
```

## Rollback

If deployment fails:

1. Revert to previous Docker image tag
2. Or rollback database migrations:
   ```bash
   pnpm prisma migrate resolve --rolled-back <migration_name>
   ```

## Monitoring

Set up monitoring for:
- API response times
- Error rates
- Database connection health
- Stripe webhook delivery

## Security Checklist

- [ ] Environment variables are secured (not in code)
- [ ] Database credentials are rotated regularly
- [ ] Stripe keys are in test mode for dev, live for prod
- [ ] CORS is configured correctly
- [ ] Rate limiting is enabled (if applicable)
- [ ] SSL/TLS is enabled in production





