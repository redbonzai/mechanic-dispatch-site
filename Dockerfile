# =============================================================================
# Base stage: Build dependencies and compile application
# =============================================================================
FROM node:24-bookworm-slim AS base

WORKDIR /app

# Install pnpm and OpenSSL (required for Prisma)
RUN npm install -g pnpm && \
    apt-get update && \
    apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists/*

# Copy dependency files first for better layer caching
COPY package.json nest-cli.json tsconfig.json tsconfig.build.json ./
COPY prisma ./prisma
COPY scripts ./scripts

# Install all dependencies (needed for build)
RUN pnpm install --frozen-lockfile || pnpm install

# Generate Prisma client (must happen before build)
# Note: prebuild hook also runs this, but explicit is clearer
RUN pnpm prisma generate --schema=./prisma/schema.prisma

# Copy source code
COPY src ./src

# Build the application
RUN pnpm build || (echo "❌ Build failed!" && exit 1)

# Verify build output
RUN test -f dist/main.js || (echo "❌ dist/main.js missing!" && ls -la dist/ && exit 1)

# =============================================================================
# Runner stage: Production runtime
# =============================================================================
FROM node:24-bookworm-slim AS runner

WORKDIR /app

# Install pnpm and OpenSSL for runtime (needed for Prisma migrations if run in container)
RUN npm install -g pnpm && \
    apt-get update && \
    apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy package files
COPY package.json ./

# Copy Prisma files (needed for migrations at runtime if required)
COPY --from=base /app/prisma ./prisma

# Copy scripts directory for db:setup
COPY --from=base /app/scripts ./scripts

# Make scripts executable
RUN chmod +x scripts/*.sh

# Install only production dependencies
# Note: tsx is needed for seeding, so it's in dependencies
RUN pnpm install --prod --frozen-lockfile || pnpm install --prod

# Verify tsx is available (needed for seeding)
RUN which tsx || (echo "⚠️  tsx not found, installing..." && pnpm add -g tsx || pnpm add tsx)

# Copy built application from base stage
COPY --from=base /app/dist ./dist

# Create uploads directories with proper permissions
RUN mkdir -p uploads/mechanics uploads/reviews && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Set environment variables
ENV NODE_ENV=production
ENV APP_PORT=3000

# Expose port
EXPOSE 3000

# Note: Healthcheck can be added in docker-compose.yml if needed
# For now, docker-compose handles service dependencies via depends_on

# Start application
CMD ["node", "dist/main.js"]
