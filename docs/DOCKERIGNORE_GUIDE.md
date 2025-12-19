# .dockerignore Guide

## Purpose

The `.dockerignore` file tells Docker which files and directories to exclude from the build context. This:
- **Reduces build time** by excluding unnecessary files
- **Reduces image size** by not copying files that won't be used
- **Improves security** by excluding sensitive files (like `.env`)
- **Speeds up context transfer** to Docker daemon

## What's Excluded

### Build Artifacts
- `node_modules/` - Dependencies installed in Docker
- `dist/` - Built application (rebuilt in Docker)
- `build/` - Build output
- `coverage/` - Test coverage reports

### Frontend (Web)
- `web/` - Angular frontend not needed for API build

### Environment Files
- `.env*` - Environment variables (loaded via docker-compose)
- Exceptions: `.env.example` (if needed for reference)

### Development Files
- `test/` - Test files
- `*.spec.ts`, `*.test.ts` - Test files
- `*.e2e-spec.ts` - E2E test files
- Jest configs (not needed in production)

### IDE Files
- `.vscode/`, `.idea/` - IDE settings
- Editor swap files, project files

### OS Files
- `.DS_Store` - macOS metadata
- `Thumbs.db` - Windows thumbnails
- Other OS-specific files

### Logs and Temporary Files
- `*.log` - Log files
- `*.tmp`, `.temp/` - Temporary files

### Git Files
- `.git/` - Git repository (not needed in image)
- `.gitignore` - Git ignore rules

### Documentation
- `docs/` - Documentation files
- `*.md` - Markdown files (except package.json which may have markdown)

### Scripts
- `scripts/` - Utility scripts (not needed in runtime image)

### Old SQL Files
- `*.sql` - Old SQL migration files
- Exception: `prisma/migrations/**/*.sql` (needed for Prisma)

### Docker Files
- `docker-compose.yml` - Not needed in image
- `Dockerfile` - Not needed in image
- `docker/` - Docker configuration files

### CI/CD
- `.github/` - GitHub Actions
- CI/CD configuration files

## What's Included

### Required Files
- `package.json` - Dependencies and scripts
- `tsconfig.json`, `tsconfig.build.json` - TypeScript config
- `nest-cli.json` - NestJS CLI config
- `prisma/` - Prisma schema and migrations
- `prisma.config.ts` - Prisma configuration
- `src/` - Source code

### Why These Are Included

1. **Source code** (`src/`) - Needed to build the application
2. **Prisma files** - Needed for migrations and client generation
3. **Config files** - Needed for build process
4. **Package files** - Needed for dependency installation

## Best Practices

1. **Be specific**: Use patterns that match exactly what you want to exclude
2. **Test your build**: After updating `.dockerignore`, test that the build still works
3. **Keep it updated**: Add new directories/files that shouldn't be in the image
4. **Security first**: Always exclude `.env` and other sensitive files
5. **Size matters**: Exclude large directories like `node_modules` and `web/`

## Verification

To see what Docker will include in the build context:

```bash
# Check what would be sent to Docker
docker build --no-cache -t test-image . 2>&1 | grep "Sending build context"
```

Or use a tool to analyze:
```bash
# See build context size
du -sh .
```

## Common Issues

### "File not found" errors
- **Cause**: File excluded but needed for build
- **Fix**: Remove from `.dockerignore` or use negation pattern (`!file`)

### Large build context
- **Cause**: Not excluding large directories
- **Fix**: Add directories like `web/`, `node_modules/`, `dist/` to `.dockerignore`

### Sensitive data in image
- **Cause**: `.env` or secrets not excluded
- **Fix**: Ensure `.env*` is in `.dockerignore` (use environment variables in docker-compose instead)






