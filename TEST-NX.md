# Testing NX Setup

## 🧪 Quick Test Suite

Run these commands to verify your NX setup is working correctly:

---

### 1. **Test Project Detection**

```bash
# Should show both projects:mechanic-dispatch-site-api and mechanic-dispatch-web
pnpm exec nx show projects
```

**Expected output:**
```
mechanic-dispatch-web
mechanic-dispatch-api
```

---

### 2. **Test Single Project Build**

```bash
# Build API only
pnpm exec nx build mechanic-dispatch-site-api

# Build Web only
pnpm exec nx build mechanic-dispatch-web
```

**Expected:** Both should build successfully ✅

---

### 3. **Test Build All Projects**

```bash
# Build both projects in parallel
pnpm exec nx run-many --target=build --all --parallel=3
```

**Expected output:**
```
✔ Successfully ran target build for 2 projects
```

---

### 4. **Test Caching (Most Important!)**

```bash
# First build (no cache)
pnpm exec nx reset
pnpm exec nx run-many --target=build --all

# Second build (should use cache)
pnpm exec nx run-many --target=build --all
```

**Expected output on second run:**
```
Nx read the output from the cache instead of running the command for 2 out of 2 tasks.
```

---

### 5. **Test Tests with NX**

```bash
# Make sure Docker containers are running
docker compose up -d

# Run all tests
pnpm exec nx run-many --target=test --all
```

**Expected:** All unit and integration tests pass ✅

---

### 6. **Test Lint with NX**

```bash
# Lint all projects
pnpm exec nx run-many --target=lint --all
```

**Expected:** No lint errors ✅

---

### 7. **Test Affected Commands**

```bash
# Make a small change to the API
echo "// test comment" >> src/main.ts

# See which projects are affected
pnpm exec nx affected --target=build --base=main --head=HEAD --dry-run

# Revert the change
git checkout src/main.ts
```

**Expected:** Only `mechanic-dispatch-api` should be affected

---

### 8. **Test Dependency Graph**

```bash
# Generate interactive graph
pnpm exec nx graph --file=graph.html

# Open graph.html in your browser
open graph.html  # macOS
# or
xdg-open graph.html  # Linux
```

**Expected:** Visual graph showing both projects ✅

---

### 9. **Test Package.json Scripts**

```bash
# These should all work via NX now
pnpm run build:nx
pnpm run test:nx
pnpm run lint:nx
```

**Expected:** All commands execute successfully ✅

---

### 10. **Test Parallel Execution**

```bash
# Clear cache
pnpm exec nx reset

# Run tests in parallel (watch terminal for parallel execution)
time pnpm exec nx run-many --target=test --all --parallel=3

# Run tests sequentially (should be slower)
time pnpm exec nx run-many --target=test --all --parallel=1
```

**Expected:** Parallel execution is faster ⚡

---

## 🎯 Full Test Script

Run this comprehensive test:

```bash
#!/bin/bash
set -e

echo "🧪 Testing NX Setup..."
echo ""

echo "1. Testing project detection..."
pnpm exec nx show projects
echo "✅ Projects detected"
echo ""

echo "2. Testing cache reset..."
pnpm exec nx reset
echo "✅ Cache cleared"
echo ""

echo "3. Testing build all (no cache)..."
pnpm exec nx run-many --target=build --all --parallel=3
echo "✅ Build completed"
echo ""

echo "4. Testing build all (with cache)..."
pnpm exec nx run-many --target=build --all --parallel=3 | grep -q "cache"
if [ $? -eq 0 ]; then
  echo "✅ Cache is working!"
else
  echo "⚠️  Cache might not be working"
fi
echo ""

echo "5. Testing lint..."
pnpm exec nx run-many --target=lint --all --parallel=3
echo "✅ Lint passed"
echo ""

echo "6. Starting containers..."
docker compose up -d db
sleep 5
echo "✅ Containers started"
echo ""

echo "7. Testing tests..."
pnpm exec nx run-many --target=test --all --parallel=3
echo "✅ Tests passed"
echo ""

echo "8. Testing dependency graph..."
pnpm exec nx graph --file=graph.html
echo "✅ Graph generated (open graph.html in browser)"
echo ""

echo "🎉 All NX tests passed!"
```

Save as `test-nx.sh` and run:
```bash
chmod +x test-nx.sh
./test-nx.sh
```

---

## 🔍 Verify CI/CD Integration

### Test GitHub Actions Locally (Optional)

Install [act](https://github.com/nektos/act):
```bash
brew install act  # macOS
```

Run workflows locally:
```bash
# Test the test workflow
act pull_request -W .github/workflows/test.yml

# Test the CI workflow
act push -W .github/workflows/ci.yml
```

---

## 📊 Expected Results Summary

| Test | Expected Result |
|------|----------------|
| Project Detection | Shows 2 projects ✅ |
| Single Build | Builds successfully ✅ |
| Build All | Builds both projects ✅ |
| Caching | Second build uses cache ✅ |
| Tests | All tests pass ✅ |
| Lint | No errors ✅ |
| Affected | Only changed project affected ✅ |
| Graph | Generates HTML visualization ✅ |
| Package Scripts | All `*:nx` scripts work ✅ |
| Parallel | Faster than sequential ✅ |

---

## 🐛 Common Issues

### "Could not load plugin @nx/jest/plugin"
**Solution:** Reinstall plugins
```bash
pnpm add -D @nx/jest @nx/eslint
```

### Cache not working
**Solution:** Reset and rebuild
```bash
pnpm exec nx reset
pnpm exec nx run-many --target=build --all
```

### "Unexpected store location" (pnpm error)
**Solution:** Already fixed with `.npmrc` config
```bash
cat .npmrc  # Should show shamefully-hoist=true
```

---

## ✅ Quick Validation Checklist

- [ ] `pnpm exec nx show projects` shows 2 projects
- [ ] `pnpm exec nx run-many --target=build --all` succeeds
- [ ] Second build shows "read from cache"
- [ ] `pnpm exec nx run-many --target=test --all` passes
- [ ] `pnpm exec nx graph` generates HTML
- [ ] `pnpm run build:nx` works
- [ ] `pnpm run test:nx` works
- [ ] `pnpm run lint:nx` works
- [ ] `.nx/cache` directory exists after builds
- [ ] `graph.html` is in `.gitignore`

---

## 🎓 Next Steps

Once all tests pass:
1. Commit the NX configuration
2. Push to GitHub
3. Watch the CI/CD workflows use NX
4. Monitor build times (should be faster!)
5. Enjoy intelligent caching and affected commands! 🚀




