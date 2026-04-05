# =============================================================================
# Base stage: install deps, generate Prisma client, build, prune to prod deps
# =============================================================================
FROM node:24-alpine3.23 AS base

WORKDIR /app

# Install pnpm and OpenSSL (required for Prisma) — Alpine uses apk, not apt-get
RUN apk add --no-cache openssl && \
    npm install -g pnpm

# Copy dependency files first for better layer caching
COPY package.json pnpm-lock.yaml ./

COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma
COPY scripts ./scripts

# Install all dependencies (needed for build)
# --no-frozen-lockfile allows the lockfile to be updated when new deps are added;
# the build context controls exactly which packages are installed.
RUN pnpm install --no-frozen-lockfile

# Generate Prisma client (must happen before build)
RUN pnpm exec prisma generate

# Copy source code
COPY src ./src

# Build the application
RUN pnpm run build

# Verify build output
RUN test -f dist/main.js || (echo "dist/main.js missing!" && ls -la dist/ && exit 1)

# Prune dev deps so node_modules becomes production-only.
# CI=true skips postinstall's prisma generate (prisma may be removed mid-prune before deps are settled).
RUN CI=true pnpm prune --prod


# =============================================================================
# Runner stage: Production runtime (no pnpm install here)
# =============================================================================
FROM node:24-alpine3.23 AS runner

WORKDIR /app

# OpenSSL for Prisma runtime — Alpine uses apk
RUN apk add --no-cache openssl

# Create non-root user for security — Alpine uses addgroup/adduser
RUN addgroup -S appuser && adduser -S -G appuser appuser

# Copy only what runtime needs
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/node_modules ./node_modules
# Prisma 7+: migrate deploy / db seed read datasource URL from prisma.config.ts (not schema.prisma)
COPY --from=base /app/prisma.config.ts ./prisma.config.ts
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/scripts ./scripts
COPY --from=base /app/dist ./dist

# Make scripts executable
RUN chmod +x scripts/*.sh

# Create uploads directories with proper permissions
RUN mkdir -p uploads/mechanics uploads/reviews && \
    chown -R appuser:appuser /app

USER appuser

ENV NODE_ENV=production
ENV APP_PORT=3000

EXPOSE 3000

# Use entrypoint script to run migrations and seeding before starting the app
ENTRYPOINT ["/app/scripts/docker-entrypoint.sh"]
