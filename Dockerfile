# =============================================================================
# Base stage: install deps, generate Prisma client, build, prune to prod deps
# =============================================================================
FROM node:24-bookworm-slim AS base

WORKDIR /app

# Install pnpm and OpenSSL (required for Prisma)
RUN npm install -g pnpm && \
    apt-get update && \
    apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists/*

# Copy dependency files first for better layer caching
# IMPORTANT: include pnpm-lock.yaml (and pnpm-workspace.yaml if you have it)
COPY package.json pnpm-lock.yaml ./
# If you use workspaces, keep this line; otherwise remove it.
# COPY pnpm-workspace.yaml ./

COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY prisma ./prisma
COPY scripts ./scripts

# Install all dependencies (needed for build)
RUN pnpm install --frozen-lockfile

# Generate Prisma client (must happen before build)
RUN pnpm exec prisma generate --schema=./prisma/schema.prisma

# Copy source code
COPY src ./src

# Build the application
RUN pnpm run build

# Verify build output
RUN test -f dist/main.js || (echo "❌ dist/main.js missing!" && ls -la dist/ && exit 1)

# Prune dev deps so node_modules becomes production-only
RUN pnpm prune --prod


# =============================================================================
# Runner stage: Production runtime (no pnpm install here)
# =============================================================================
FROM node:24-bookworm-slim AS runner

WORKDIR /app

# OpenSSL for Prisma runtime
RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy only what runtime needs
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/node_modules ./node_modules
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

CMD ["node", "dist/main.js"]
