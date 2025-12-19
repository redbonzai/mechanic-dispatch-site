# GitHub Actions Workflows

This document describes the GitHub Actions workflows configured for this project and how to test them.

## Workflows

### 1. `test.yml` - Pull Request Testing
**Triggers:** Pull requests, manual dispatch

**Steps:**
1. Checkout code
2. Setup Node.js (from `.nvmrc` - Node 20.18.1)
3. Install dependencies with `pnpm ci`
4. Verify conventional commits with commitlint
5. Run semantic-release dry-run to validate release config
6. Build and test the application

**Environment:** Ubuntu latest with pnpm 9

### 2. `release.yml` - Release to Production
**Triggers:** Push to `main` branch, manual dispatch

**Steps:**
1. Checkout code with full history
2. Setup Node.js from `.nvmrc`
3. Install dependencies
4. Build (skip tests)
5. Configure Git with GitHub App credentials
6. Run semantic-release to:
   - Analyze commits
   - Generate changelog
   - Create GitHub release
   - Publish to npm (if public package)

**Required Secrets/Vars:**
- `APP_ID` - GitHub App ID for automated releases
- `APP_PRIVATE_KEY` - GitHub App private key
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions

### 3. `ci.yml` - Continuous Integration
**Triggers:** Push/PR to `main` or `develop`

**Steps:**
1. Run tests with PostgreSQL service container
2. Lint and format check
3. Build application
4. Run unit and e2e tests
5. Upload coverage to Codecov
6. Build and push Docker image (on develop pushes)

**Services:**
- PostgreSQL 15 (for integration tests)

**Environment Variables:**
- `DATABASE_URL` - Test database connection
- `STRIPE_SECRET_KEY` - Mock Stripe key for tests
- `STRIPE_WEBHOOK_SECRET` - Mock webhook secret

### 4. `deploy-dev.yml` - Development Deployment
**Triggers:** Push to `develop`, manual dispatch

**Steps:**
1. Checkout code
2. Deploy to development server (placeholder)
3. Run health check

**Environment:** `development` (GitHub environment)

## Local Testing

### Verified Locally ✅

1. **Build**: `pnpm run build` - ✅ Passes
2. **Semantic Release Config**: `pnpm run release:dry-run` - ✅ Config valid (requires GitHub token for full run)
3. **Node Version**: Updated to `20.18.1` in `.nvmrc` - ✅ Compatible with dependencies

### Using `act` (GitHub Actions Local Runner)

Install act:
```bash
brew install act  # macOS
# or download from https://github.com/nektos/act
```

List all workflows:
```bash
act --list
```

Test the PR workflow:
```bash
# Requires Docker running
act pull_request -W .github/workflows/test.yml

# Or with GitHub token for full testing:
act pull_request -W .github/workflows/test.yml -s GITHUB_TOKEN=ghp_your_token_here
```

Test the release workflow (dry-run):
```bash
act push -W .github/workflows/release.yml -s GITHUB_TOKEN=ghp_your_token_here
```

### Manual Step-by-Step Testing

1. **Install dependencies:**
   ```bash
   nvm use  # Uses version from .nvmrc
   pnpm install
   ```

2. **Run commitlint check:**
   ```bash
   pnpm run commitlint:check
   ```

3. **Run semantic-release dry-run:**
   ```bash
   GITHUB_TOKEN=ghp_your_token pnpm run release:dry-run
   ```

4. **Run build:**
   ```bash
   pnpm run build
   ```

5. **Run tests:**
   ```bash
   # Ensure Docker Compose is running for test database
   docker compose up -d postgres
   
   # Run tests
   pnpm test
   ```

## Semantic Release Configuration

The project uses semantic-release with the following plugins:

- `@semantic-release/commit-analyzer` - Analyzes commits for version bumps
- `@semantic-release/release-notes-generator` - Generates release notes
- `@semantic-release/changelog` - Updates CHANGELOG.md
- `@semantic-release/npm` - Publishes to npm (if public)
- `@semantic-release/git` - Commits changelog and version bumps
- `@semantic-release/github` - Creates GitHub releases

### Commit Message Format

Follow conventional commits:

- `feat: add new feature` - Minor version bump (0.x.0)
- `fix: resolve bug` - Patch version bump (0.0.x)
- `feat!: breaking change` or `feat: xyz\n\nBREAKING CHANGE: ...` - Major version bump (x.0.0)
- `docs:`, `chore:`, `style:`, `refactor:`, `test:`, `ci:` - No version bump

## Commitlint Configuration

Enforces conventional commit messages using `@commitlint/config-conventional`.

Check commits locally:
```bash
pnpm run commitlint:check
```

This checks all commits from `origin/main` to `HEAD`.

## Troubleshooting

### Missing `@jest/test-sequencer` error

This is a pnpm hoisting issue in local environments. The CI environment uses `pnpm ci` which handles this correctly. If you encounter this locally:

```bash
pnpm add -D @jest/test-sequencer@29.7.0
```

### Semantic-release git permission denied

When running `release:dry-run` locally, you may see git SSH errors. This is expected without GitHub tokens. The workflow will work correctly in CI with the configured GitHub App.

### Node version mismatch

Ensure you're using the correct Node version:
```bash
nvm use
node --version  # Should show v20.18.1
```

## Next Steps

1. Configure `APP_ID` and `APP_PRIVATE_KEY` repository variables/secrets for automated releases
2. Update deployment steps in `deploy-dev.yml` with actual deployment commands
3. Configure Codecov token for coverage uploads (optional)
4. Enable required status checks in GitHub branch protection rules

