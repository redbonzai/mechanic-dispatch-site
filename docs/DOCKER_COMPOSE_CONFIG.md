# Docker Compose Configuration

## Overview

The `docker-compose.yml` file orchestrates two services:
1. **db**: PostgreSQL 15 database
2. **api**: NestJS API application

## Service Configuration

### Database Service (`db`)

- **Image**: Custom build from `docker/postgres/Dockerfile`
- **Port**: `15432:5432` (host:container)
- **Healthcheck**: Uses `pg_isready` to verify database is ready
- **Volume**: Persistent storage for database data
- **Restart Policy**: `unless-stopped` (restarts automatically)

### API Service (`api`)

- **Image**: Custom build from root `Dockerfile`
- **Port**: `3000:3000` (host:container)
- **Dependencies**: Waits for database to be healthy before starting
- **Environment**: 
  - Loads from `.env` file
  - `DATABASE_URL` overridden to use Docker service name (`db`)
- **Volume**: Persistent storage for uploads directory
- **Restart Policy**: `unless-stopped`

## Environment Variables

### Required in `.env` file:

```bash
# Stripe (required - app will fail to start without these)
STRIPE_SECRET_KEY=sk_test_replace_me
STRIPE_WEBHOOK_SECRET=whsec_replace_me

# Optional (have defaults)
APP_PORT=3000
CLIENT_ORIGIN=http://localhost:4200
```

### Automatically Set:

- `DATABASE_URL`: Set in docker-compose.yml to use Docker service name
- `NODE_ENV`: Set to `production` in Dockerfile

## Network

Services communicate via a custom bridge network (`mechanic-network`), providing:
- Service name resolution (e.g., `db` resolves to database container)
- Network isolation from other Docker containers
- Better security and organization

## Volumes

### `db_data`
- Stores PostgreSQL data files
- Persists across container restarts
- Location: Docker managed volume

### `uploads_data`
- Stores uploaded files (mechanic images, review photos)
- Persists across container restarts
- Location: Docker managed volume

## Health Checks

### Database Healthcheck
- **Command**: `pg_isready -U postgres -d mechanic`
- **Interval**: 10 seconds
- **Timeout**: 5 seconds
- **Retries**: 5
- **Start Period**: 10 seconds (allows time for initial startup)

The API service waits for the database to be healthy before starting, ensuring the database is ready to accept connections.

## Restart Policies

Both services use `unless-stopped`:
- Automatically restart if container exits
- Does not restart if manually stopped
- Useful for development and production

## Usage

### Start Services
```bash
docker compose up -d
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f db
```

### Stop Services
```bash
docker compose down
```

### Stop and Remove Volumes
```bash
docker compose down -v
```

### Rebuild Services
```bash
docker compose up --build
```

## Troubleshooting

### API fails to start
- Check if database is healthy: `docker compose ps`
- Verify `.env` file exists and has required variables
- Check API logs: `docker compose logs api`

### Database connection issues
- Verify `DATABASE_URL` in docker-compose.yml uses `db` as hostname
- Check database health: `docker compose logs db`
- Ensure database volume is not corrupted

### Missing environment variables
- Create `.env` file in project root
- Include all required variables (see Environment Variables section)
- Restart services: `docker compose restart api`






