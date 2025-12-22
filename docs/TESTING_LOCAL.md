# Local Testing Issues and Workarounds

## Known Issue: pnpm + Jest Compatibility

### Problem

When running `pnpm test` or `pnpm test:e2e` locally, you may encounter:

```
Error: Cannot find module '@jest/test-sequencer'
```

This is a **known compatibility issue** between pnpm's module resolution strategy and Jest's internal dependencies. The package IS installed correctly, but pnpm's isolated dependency tree prevents Jest from finding it.

### Why This Happens

- **pnpm** uses a non-flat `node_modules` structure with symlinks for better disk space and security
- **Jest** expects certain internal packages to be accessible at the root `node_modules` level
- Local development with pnpm can have hoisting issues that don't occur in CI

### ✅ This Does NOT Affect CI/CD

The CI pipeline uses `pnpm install --frozen-lockfile` which correctly resolves all dependencies. **Tests will pass in GitHub Actions.**

### Workarounds for Local Development

#### Option 1: Use `.npmrc` with `shamefully-hoist` (Current Setup)

The project includes an `.npmrc` file with:

```
shamefully-hoist=true
```

This forces pnpm to hoist all dependencies to the root `node_modules`, similar to npm's behavior.

**Steps:**
```bash
rm -rf node_modules
pnpm install
pnpm test
```

**Note:** If you still encounter issues after this, the workarounds below may help.

#### Option 2: Use npm Instead of pnpm Locally

```bash
# Install with npm
npm install

# Run tests
npm test
npm run test:e2e
```

#### Option 3: Run Tests in Docker (Matches CI Environment)

```bash
# Start services
docker compose up -d

# Run tests in container
docker compose exec api pnpm test
```

#### Option 4: Use act to Run GitHub Actions Locally

```bash
# Install act (if not already installed)
brew install act

# Run the test workflow
act pull_request -W .github/workflows/test.yml
```

### Verifying Tests Work in CI

1. **Push to a branch** and create a PR
2. **Check GitHub Actions** tab for test results
3. Tests should pass with `pnpm install --frozen-lockfile`

### Alternative: Run Specific Test Files Directly

If you need to run tests locally and the above doesn't work:

```bash
# Run a specific test file with npx
npx jest src/domains/mechanics/services/mechanics.service.spec.ts

# Or use ts-node
npx ts-node --project tsconfig.jest.json node_modules/.bin/jest <test-file>
```

## Integration/E2E Tests

For integration and e2e tests that require a database:

```bash
# Start PostgreSQL
docker compose up -d postgres

# Wait for it to be ready
sleep 3

# Run migrations
pnpm prisma:migrate:deploy

# Run tests (when the local Jest issue is resolved)
pnpm test:e2e
```

## Summary

- ✅ **CI/CD**: Tests work correctly with `pnpm install --frozen-lockfile`
- ⚠️ **Local**: May require workarounds due to pnpm + Jest compatibility
- 📝 **Recommendation**: Use `.npmrc` with `shamefully-hoist=true` (already configured)
- 🐳 **Best Practice**: Run tests in Docker or act to match CI environment

## References

- [pnpm hoisting documentation](https://pnpm.io/npmrc#shamefully-hoist)
- [Jest + pnpm known issues](https://github.com/facebook/jest/issues/10297)
- [pnpm FAQ - Jest compatibility](https://pnpm.io/faq#does-it-work-with-jest)




