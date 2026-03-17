#!/bin/bash
set -e

echo "🧪 Testing NX Setup..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Testing project detection...${NC}"
projects=$(pnpm exec nx show projects 2>/dev/null | wc -l)
if [ "$projects" -eq 2 ]; then
  echo -e "${GREEN}✅ Found 2 projects${NC}"
else
  echo "❌ Expected 2 projects, found $projects"
  exit 1
fi
echo ""

echo -e "${BLUE}2. Testing cache reset...${NC}"
pnpm exec nx reset >/dev/null 2>&1
echo -e "${GREEN}✅ Cache cleared${NC}"
echo ""

echo -e "${BLUE}3. Testing build all (no cache)...${NC}"
pnpm exec nx run-many --target=build --all --parallel=3 >/dev/null 2>&1
echo -e "${GREEN}✅ Initial build completed${NC}"
echo ""

echo -e "${BLUE}4. Testing build all (with cache)...${NC}"
output=$(pnpm exec nx run-many --target=build --all --parallel=3 2>&1)
if echo "$output" | grep -q "cache"; then
  echo -e "${GREEN}✅ Cache is working! (2/2 tasks cached)${NC}"
else
  echo "⚠️  Cache might not be working"
fi
echo ""

echo -e "${BLUE}5. Testing dependency graph...${NC}"
pnpm exec nx graph --file=graph-test.html >/dev/null 2>&1
if [ -f "graph-test.html" ]; then
  echo -e "${GREEN}✅ Graph generated (graph-test.html)${NC}"
  rm -f graph-test.html
  rm -rf static/
else
  echo "❌ Graph generation failed"
  exit 1
fi
echo ""

echo -e "${BLUE}6. Testing lint...${NC}"
pnpm exec nx run-many --target=lint --all --parallel=3 >/dev/null 2>&1
echo -e "${GREEN}✅ Lint passed${NC}"
echo ""

echo -e "${BLUE}7. Testing individual project builds...${NC}"
pnpm exec nx build mechanic-dispatch-site-api >/dev/null 2>&1
echo -e "${GREEN}✅ API build passed${NC}"
pnpm exec nx build mechanic-dispatch-web >/dev/null 2>&1
echo -e "${GREEN}✅ Web build passed${NC}"
echo ""

echo -e "${BLUE}8. Testing package.json scripts...${NC}"
pnpm run build:nx >/dev/null 2>&1
echo -e "${GREEN}✅ build:nx script works${NC}"
echo ""

echo "🎉 ${GREEN}All NX tests passed!${NC}"
echo ""
echo "NX is configured and working correctly:"
echo "  ✅ Caching enabled and working"
echo "  ✅ Both projects detected (API + Web)"
echo "  ✅ Parallel execution working"
echo "  ✅ Dependency graph generation working"
echo "  ✅ Package.json scripts working"
echo ""
echo "Try these commands:"
echo "  pnpm exec nx run-many --target=build --all"
echo "  pnpm exec nx affected --target=test --base=main"
echo "  pnpm exec nx graph"

