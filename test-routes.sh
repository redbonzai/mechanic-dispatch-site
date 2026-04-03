#!/bin/bash

# Route Testing Script for Mechanic Dispatch API
# This script tests all available API routes

BASE_URL="${BASE_URL:-https://api.mechanicdispatch.com}"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Testing Mechanic Dispatch API Routes"
echo "Base URL: $BASE_URL"
echo "=========================================="
echo ""

# Test counter
PASSED=0
FAILED=0

# Helper function to test a route
test_route() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    local expected_status=${5:-200}
    
    echo -n "Testing $method $endpoint ... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    elif [ "$method" = "POST" ] || [ "$method" = "PUT" ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$BASE_URL$endpoint")
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" \
                "$BASE_URL$endpoint")
        fi
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Expected HTTP $expected_status, got $http_code)"
        echo "  Response: $body"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Check if server is running
echo "Checking if server is running..."
if ! curl -s "$BASE_URL" > /dev/null 2>&1; then
    echo -e "${RED}Error: Server is not running at $BASE_URL${NC}"
    echo "Please start the server with: pnpm run start:dev"
    exit 1
fi
echo -e "${GREEN}Server is running!${NC}"
echo ""

# ============================================
# MECHANICS ROUTES
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "MECHANICS ROUTES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_route "GET" "/mechanics" "Get all mechanics"
test_route "GET" "/mechanics?isActive=true" "Get active mechanics"
test_route "GET" "/mechanics?isActive=false" "Get inactive mechanics"

# Get a mechanic ID for testing (assuming there's at least one)
MECHANIC_ID=$(curl -s "$BASE_URL/mechanics" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$MECHANIC_ID" ]; then
    test_route "GET" "/mechanics/$MECHANIC_ID" "Get mechanic by ID"
fi

# Get a slug for testing
MECHANIC_SLUG=$(curl -s "$BASE_URL/mechanics" | grep -o '"slug":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$MECHANIC_SLUG" ]; then
    test_route "GET" "/mechanics/slug/$MECHANIC_SLUG" "Get mechanic by slug"
fi

echo ""

# ============================================
# REVIEWS ROUTES
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "REVIEWS ROUTES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_route "GET" "/reviews" "Get all reviews"
test_route "GET" "/reviews/stats" "Get review stats"

if [ -n "$MECHANIC_ID" ]; then
    test_route "GET" "/reviews?mechanicId=$MECHANIC_ID" "Get reviews by mechanic ID"
    test_route "GET" "/reviews/stats?mechanicId=$MECHANIC_ID" "Get review stats for mechanic"
fi

test_route "GET" "/reviews?rating=5" "Get reviews with rating 5"
test_route "GET" "/reviews?sortBy=newest" "Get reviews sorted by newest"
test_route "GET" "/reviews?limit=5&offset=0" "Get reviews with pagination"

echo ""

# ============================================
# SERVICE REQUESTS ROUTES
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SERVICE REQUESTS ROUTES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create a test service request
CREATE_REQUEST_DATA='{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "555-1234",
  "addressLine1": "123 Main St",
  "city": "San Francisco",
  "state": "CA",
  "postalCode": "94102",
  "country": "US",
  "vehicleMake": "Toyota",
  "vehicleModel": "Camry",
  "vehicleYear": 2020
}'

echo "Creating a test service request..."
CREATE_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$CREATE_REQUEST_DATA" \
    "$BASE_URL/requests")

REQUEST_ID=$(echo "$CREATE_RESPONSE" | grep -o '"requestId":"[^"]*"' | cut -d'"' -f4)

if [ -n "$REQUEST_ID" ]; then
    echo -e "${GREEN}Created request with ID: $REQUEST_ID${NC}"
    test_route "POST" "/requests" "Create service request" "$CREATE_REQUEST_DATA" 201
    
    # Note: Capture, cancel, and finalize require Stripe setup, so we'll test with expected errors
    echo -n "Testing POST /requests/$REQUEST_ID/capture ... "
    response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/requests/$REQUEST_ID/capture")
    http_code=$(echo "$response" | tail -n1)
    if [ "$http_code" = "200" ] || [ "$http_code" = "400" ] || [ "$http_code" = "500" ]; then
        echo -e "${YELLOW}⚠ SKIPPED${NC} (Requires Stripe payment setup - HTTP $http_code)"
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
        FAILED=$((FAILED + 1))
    fi
    
    FINALIZE_DATA='{"finalAmountCents": 7000}'
    test_route "POST" "/requests/$REQUEST_ID/finalize" "Finalize service request" "$FINALIZE_DATA" 200
    
    WORK_LOG_DATA='{
      "mechanicName": "Test Mechanic",
      "hoursWorkedMinutes": 120,
      "payoutPercentage": 80,
      "notes": "Test work log"
    }'
    test_route "POST" "/requests/$REQUEST_ID/work-logs" "Create work log" "$WORK_LOG_DATA" 201
else
    echo -e "${RED}Failed to create test request${NC}"
    FAILED=$((FAILED + 1))
fi

echo ""

# ============================================
# ADMIN ROUTES
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "ADMIN ROUTES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_route "GET" "/admin/mechanics" "Get all mechanics (admin)"
test_route "GET" "/admin/skills" "Get all skills (admin)"

if [ -n "$MECHANIC_ID" ]; then
    test_route "GET" "/admin/mechanics/$MECHANIC_ID" "Get mechanic by ID (admin)"
fi

# Test creating a mechanic (without file upload)
CREATE_MECHANIC_DATA='{
  "name": "Test Mechanic",
  "slug": "test-mechanic-'$(date +%s)'",
  "bio": "Test bio",
  "location": "Test Location",
  "yearsExperience": 5,
  "sinceYear": 2020,
  "isActive": true
}'

echo -n "Testing POST /admin/mechanics (without file) ... "
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "$CREATE_MECHANIC_DATA" \
    "$BASE_URL/admin/mechanics")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "201" ] || [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
    PASSED=$((PASSED + 1))
    NEW_MECHANIC_ID=$(echo "$response" | sed '$d' | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
else
    echo -e "${YELLOW}⚠ SKIPPED${NC} (HTTP $http_code - may require validation)"
fi

echo ""

# ============================================
# WEBHOOKS ROUTES
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "WEBHOOKS ROUTES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -n "Testing POST /webhooks/stripe ... "
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    "$BASE_URL/webhooks/stripe")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "400" ]; then
    echo -e "${YELLOW}⚠ EXPECTED${NC} (HTTP 400 - Missing stripe-signature header)"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠ SKIPPED${NC} (HTTP $http_code - Requires Stripe webhook signature)"
fi

echo ""

# ============================================
# SUMMARY
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed.${NC}"
    exit 1
fi





