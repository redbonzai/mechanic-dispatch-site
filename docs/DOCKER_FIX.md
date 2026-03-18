# Docker Build Fix

## Problem

Docker build appears to succeed but container can't find `/app/dist/main.js` at runtime.

## Root Cause

The build might be failing silently or the dist folder structure is incorrect.

## Solution

### Step 1: Verify Local Build Works

```bash
# Clean and build locally first
rm -rf dist
pnpm prisma generate
pnpm build

# Verify output
test -f dist/main.js && echo "✅ Build works" || echo "❌ Build failed"
```

### Step 2: Rebuild Docker with No Cache

```bash
docker compose build --no-cache api
```

### Step 3: Check Build Output

The Dockerfile now includes verification steps that will fail the build if:
- Build command fails
- dist directory is missing
- dist/main.js is missing

### Step 4: Inspect Built Image

```bash
# Check what's actually in the image
docker run --rm --entrypoint sh mechanic-dispatch-site-api -c "ls -la /app/dist/"
```

## Updated Dockerfile

The Dockerfile now includes build verification:

```dockerfile
# Build the application
RUN pnpm build || (echo "Build failed!" && exit 1)
RUN ls -la dist/ || (echo "dist directory missing!" && exit 1)
RUN test -f dist/main.js || (echo "dist/main.js missing!" && ls -la dist/ && exit 1)
RUN echo "✅ Build successful, main.js exists"
```

This will cause the Docker build to fail immediately if there's a problem, rather than silently succeeding.

## Diagnostic Script

Run the diagnostic script to check everything:

```bash
./scripts/diagnose-docker.sh
```

This will:
1. Build the Docker image
2. Check for errors in build logs
3. Inspect the built image
4. Compare with local build

## Common Issues

### Build Fails in Docker but Works Locally

**Cause:** Prisma client not generated or missing dependencies

**Fix:**
```bash
# Ensure Prisma client is generated in Docker
# The Dockerfile already does this, but verify:
docker compose build api 2>&1 | grep -i "prisma generate"
```

### dist/main.js Missing

**Cause:** Build output directory mismatch or build failing silently

**Fix:**
1. Check nest-cli.json output directory
2. Verify tsconfig.json outDir
3. Check build logs for TypeScript errors

### Container Starts but Crashes

**Cause:** Missing dependencies or runtime errors

**Fix:**
```bash
# Check container logs
docker compose logs api

# Check if all node_modules are copied
docker run --rm --entrypoint sh mechanic-dispatch-site-api -c "ls node_modules/.prisma/client"
```

