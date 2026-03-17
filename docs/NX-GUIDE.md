# NX Monorepo Guide

## 📚 Overview

This project uses **NX v22.3.3** as a build tool to manage the monorepo containing:
- **API** (`mechanic-dispatch-api`) - NestJS backend
- **Web** (`mechanic-dispatch-web`) - Angular frontend

---

## 🚀 Key Features Enabled

### 1. **Intelligent Caching**
NX caches build, test, and lint outputs. If nothing changed, it reuses cached results.

```bash
# First run: builds everything
pnpm exec nx run-many --target=build --all

# Second run: instant (uses cache)
pnpm exec nx run-many --target=build --all
```

### 2. **Affected Commands**
Only run tasks on projects affected by your changes.

```bash
# Only build/test projects affected by changes since main
pnpm exec nx affected --target=build --base=main --head=HEAD
pnpm exec nx affected --target=test --base=main --head=HEAD
```

### 3. **Parallel Execution**
Run tasks across multiple projects simultaneously.

```bash
# Build both API and Web in parallel
pnpm exec nx run-many --target=build --all --parallel=3
```

### 4. **Dependency Graph**
Visualize project dependencies.

```bash
# Generate interactive graph
pnpm exec nx graph

# View affected projects
pnpm exec nx graph --affected --base=main
```

---

## 📋 Available Commands

### Run Single Project

```bash
# Build API
pnpm exec nx build mechanic-dispatch-site-api

# Test API
pnpm exec nx test mechanic-dispatch-site-api

# Lint API
pnpm exec nx lint mechanic-dispatch-site-api

# Build Web
pnpm exec nx build mechanic-dispatch-site-web
```

### Run All Projects

```bash
# Build all
pnpm exec nx run-many --target=build --all

# Test all
pnpm exec nx run-many --target=test --all

# Lint all
pnpm exec nx run-many --target=lint --all
```

### Run Affected Projects

```bash
# Build only affected projects
pnpm exec nx affected --target=build

# Test only affected projects
pnpm exec nx affected --target=test

# Specify base branch
pnpm exec nx affected --target=build --base=main --head=HEAD
```

---

## 🔧 Configuration Files

### `nx.json` (Root)
Global NX configuration:
- **Caching**: Enabled for `build`, `test`, `lint`
- **Plugins**: `@nx/jest`, `@nx/eslint`
- **Named Inputs**: Defines what files trigger cache invalidation

### `project.json` (API)
API-specific NX targets:
- `build` - Runs `nest build`
- `serve` - Runs `nest start --watch`
- `test` - Runs `jest`
- `lint` - Runs `eslint`

### `web/project.json` (Web)
Web-specific NX targets:
- `build` - Runs Angular build
- `serve` - Runs Angular dev server
- `test` - Runs Angular tests
- `lint` - Runs ESLint

---

## 🎯 CI/CD Integration

### GitHub Actions Workflows

**`ci.yml`** (Push to main/develop):
```yaml
- name: Build (NX affected)
  run: pnpm exec nx affected --target=build --base=origin/main --head=HEAD --parallel=3
```

**`test.yml`** (Pull Requests):
```yaml
- name: Build (NX all)
  run: pnpm exec nx run-many --target=build --all --parallel=3
```

**Benefits:**
- ✅ **Faster CI**: Only builds/tests affected projects
- ✅ **Caching**: NX cache is stored in GitHub Actions
- ✅ **Parallel**: Multiple projects run simultaneously

---

## 📊 Project Structure

```
mechanic-dispatch/
├── nx.json                    # Global NX config
├── project.json               # API project config
├── src/                       # API source code
│   └── domains/               # DDD structure
├── web/                       # Angular frontend
│   ├── project.json           # Web project config
│   └── src/                   # Web source code
├── .nx/                       # NX cache (gitignored)
└── graph.html                 # Dependency graph (gitignored)
```

---

## 🔍 Useful Commands

### View Project Info
```bash
# List all projects
pnpm exec nx show projects

# Show project details
pnpm exec nx show projectmechanic-dispatch-site-api --json
```

### Clear Cache
```bash
# Clear NX cache
pnpm exec nx reset
```

### Run with Verbose Output
```bash
# See detailed execution logs
pnpm exec nx build --verbose
```

### Skip Cache
```bash
# Force rebuild (ignore cache)
pnpm exec nx build --skip-nx-cache
```

---

## 🎨 Dependency Graph

Generate and view the project dependency graph:

```bash
# Generate HTML graph
pnpm exec nx graph --file=graph.html

# View affected graph
pnpm exec nx graph --affected --base=main
```

---

## 💡 Best Practices

### 1. **Use Affected Commands in CI**
```bash
# Only test what changed
nx affected --target=test --base=origin/main
```

### 2. **Run Tasks in Parallel**
```bash
# Faster builds
nx run-many --target=build --all --parallel=3
```

### 3. **Leverage Caching**
- NX automatically caches task outputs
- Cache is shared across team via GitHub Actions
- Use `--skip-nx-cache` only when debugging

### 4. **Keep Dependencies Clear**
- API and Web are independent projects
- Shared code should be in a library (future enhancement)

---

## 🐛 Troubleshooting

### Cache Issues
```bash
# Clear cache and rebuild
pnpm exec nx reset
pnpm exec nx run-many --target=build --all
```

### Plugin Errors
```bash
# Reinstall NX plugins
pnpm add -D @nx/jest @nx/eslint
```

### Global NX Version Mismatch
```bash
# Update global NX
pnpm add -g nx@latest

# Or use local version
pnpm exec nx <command>
```

---

## 📚 Resources

- [NX Documentation](https://nx.dev)
- [NX Caching](https://nx.dev/concepts/how-caching-works)
- [NX Affected Commands](https://nx.dev/concepts/affected)
- [NX CI/CD](https://nx.dev/ci/intro/ci-with-nx)

---

## 🎯 Summary

**NX provides:**
- ✅ **Intelligent caching** (faster builds)
- ✅ **Affected commands** (only build/test what changed)
- ✅ **Parallel execution** (faster CI)
- ✅ **Dependency graph** (visualize relationships)
- ✅ **Monorepo management** (API + Web in one repo)

**All NX commands are available via:**
```bash
pnpm exec nx <command>
```

**Or use the convenience scripts in `package.json`:**
```bash
pnpm run build:nx
pnpm run test:nx
pnpm run lint:nx
```

