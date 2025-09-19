#!/bin/bash

# Campus Event Hub API Test Script
# Usage: ./scripts/test_api.sh

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:3000"
CONTENT_TYPE="Content-Type: application/json"

echo -e "${BLUE}🚀 Campus Event Hub API Testing Script${NC}"
echo "=================================================="

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_success="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "\n${YELLOW}Test $TOTAL_TESTS: $test_name${NC}"
    
    if eval "$test_command"; then
        if [ "$expected_success" = "true" ]; then
            echo -e "${GREEN}✅ PASSED${NC}"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            echo -e "${RED}❌ FAILED (Expected failure but got success)${NC}"
        fi
    else
        if [ "$expected_success" = "false" ]; then
            echo -e "${GREEN}✅ PASSED (Expected failure)${NC}"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            echo -e "${RED}❌ FAILED${NC}"
        fi
    fi
}

# Test helper function
test_endpoint() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local headers="$4"
    local expected_status="$5"
    
    local curl_cmd="curl -s -w '%{http_code}' -o /tmp/api_response.json"
    
    if [ -n "$headers" ]; then
        curl_cmd="$curl_cmd $headers"
    fi
    
    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -d '$data'"
    fi
    
    curl_cmd="$curl_cmd -X $method $BASE_URL$endpoint"
    
    local status_code=$(eval "$curl_cmd")
    local response_body=$(cat /tmp/api_response.json)
    
    if [ "$status_code" = "$expected_status" ]; then
        return 0
    else
        echo "Expected status: $expected_status, Got: $status_code"
        echo "Response: $response_body"
        return 1
    fi
}

echo -e "\n${BLUE}Phase 1: Basic Connectivity Tests${NC}"
echo "=================================="

run_test "Health Check" \
    "test_endpoint GET /health '' '' 200" \
    "true"

run_test "API Root" \
    "test_endpoint GET / '' '' 200" \
    "true"

run_test "API v1 Info" \
    "test_endpoint GET /api/v1 '' '' 200" \
    "true"

echo -e "\n${BLUE}Phase 2: Authentication Tests${NC}"
echo "=============================="

# Get SUPERADMIN token first
SUPERADMIN_LOGIN_DATA='{
  "email": "superadmin@campus-event-hub.local",
  "password": "SuperAdmin123!"
}'

SUPERADMIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
    -H "$CONTENT_TYPE" \
    -d "$SUPERADMIN_LOGIN_DATA")

if command -v jq >/dev/null 2>&1; then
    SUPERADMIN_TOKEN=$(echo "$SUPERADMIN_RESPONSE" | jq -r '.data.token // empty')
else
    SUPERADMIN_TOKEN=$(echo "$SUPERADMIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$SUPERADMIN_TOKEN" ]; then
    echo -e "${RED}❌ Failed to get SUPERADMIN token - cannot continue tests${NC}"
    exit 1
fi

# Create a test user via SUPERADMIN
TEST_USER_DATA='{
  "name": "Test User",
  "email": "test@example.com",
  "password": "testpass123",
  "role": "user"
}'

run_test "Create User (SUPERADMIN)" \
    "test_endpoint POST /api/v1/users '$TEST_USER_DATA' '-H \"$CONTENT_TYPE\" -H \"Authorization: Bearer $SUPERADMIN_TOKEN\"' 201" \
    "true"

# Create another test user for token extraction
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/users" \
    -H "$CONTENT_TYPE" \
    -H "Authorization: Bearer $SUPERADMIN_TOKEN" \
    -d '{
        "name": "Test User 2", 
        "email": "test2@example.com", 
        "password": "testpass123",
        "role": "user"
    }')

# Login as the created user to get token
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
    -H "$CONTENT_TYPE" \
    -d '{
        "email": "test2@example.com", 
        "password": "testpass123"
    }')

if command -v jq >/dev/null 2>&1; then
    USER_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token // empty')
else
    USER_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi

if [ -n "$USER_TOKEN" ]; then
    echo -e "${GREEN}✅ User token extracted${NC}"
else
    echo -e "${RED}❌ Failed to extract user token${NC}"
    exit 1
fi

# Login test
LOGIN_DATA='{
  "email": "test2@example.com",
  "password": "testpass123"
}'

run_test "User Login" \
    "test_endpoint POST /api/v1/auth/login '$LOGIN_DATA' '-H \"$CONTENT_TYPE\"' 200" \
    "true"

# Profile access test
run_test "Profile Access" \
    "test_endpoint GET /api/v1/auth/profile '' '-H \"Authorization: Bearer $USER_TOKEN\"' 200" \
    "true"

echo -e "\n${BLUE}Phase 3: User Management Tests${NC}"
echo "==============================="

if [ -n "$SUPERADMIN_TOKEN" ]; then
    echo -e "${GREEN}✅ Using existing SUPERADMIN token${NC}"
    
    # Test user creation as SUPERADMIN
    ADMIN_USER_DATA='{
      "name": "Test Admin",
      "email": "testadmin@example.com",
      "password": "adminpass123",
      "role": "admin"
    }'
    
    run_test "Create Admin User" \
        "test_endpoint POST /api/v1/users '$ADMIN_USER_DATA' '-H \"$CONTENT_TYPE\" -H \"Authorization: Bearer $SUPERADMIN_TOKEN\"' 201" \
        "true"
    
    # Test user listing
    run_test "List Users (SUPERADMIN)" \
        "test_endpoint GET '/api/v1/users?page=1&limit=10' '' '-H \"Authorization: Bearer $SUPERADMIN_TOKEN\"' 200" \
        "true"
        
else
    echo -e "${RED}❌ Failed to login as SUPERADMIN - skipping SUPERADMIN tests${NC}"
fi

echo -e "\n${BLUE}Phase 4: Permission Tests${NC}"
echo "========================="

# Test unauthorized access
run_test "Unauthorized Access to Users" \
    "test_endpoint GET /api/v1/users '' '' 401" \
    "true"

# Test regular user trying to access admin endpoint
run_test "Regular User Accessing Admin Endpoint" \
    "test_endpoint GET /api/v1/users '' '-H \"Authorization: Bearer $USER_TOKEN\"' 403" \
    "true"

echo -e "\n${BLUE}Phase 5: Error Tests${NC}"
echo "==================="

# Invalid token test
run_test "Invalid Token" \
    "test_endpoint GET /api/v1/auth/profile '' '-H \"Authorization: Bearer invalid_token\"' 401" \
    "true"

# Duplicate user creation test
run_test "Duplicate Email User Creation" \
    "test_endpoint POST /api/v1/users '$TEST_USER_DATA' '-H \"$CONTENT_TYPE\" -H \"Authorization: Bearer $SUPERADMIN_TOKEN\"' 409" \
    "true"

# Invalid login test
INVALID_LOGIN_DATA='{
  "email": "test@example.com",
  "password": "wrongpassword"
}'

run_test "Invalid Login Credentials" \
    "test_endpoint POST /api/v1/auth/login '$INVALID_LOGIN_DATA' '-H \"$CONTENT_TYPE\"' 401" \
    "true"

# Missing required fields test
INCOMPLETE_USER_DATA='{
  "name": "Incomplete User"
}'

run_test "Incomplete User Creation Data" \
    "test_endpoint POST /api/v1/users '$INCOMPLETE_USER_DATA' '-H \"$CONTENT_TYPE\" -H \"Authorization: Bearer $SUPERADMIN_TOKEN\"' 400" \
    "true"

echo -e "\n${BLUE}Test Results Summary${NC}"
echo "===================="
echo -e "Total Tests: ${YELLOW}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$((TOTAL_TESTS - PASSED_TESTS))${NC}"

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "\n${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Check the output above for details.${NC}"
    exit 1
fi

# Cleanup
rm -f /tmp/api_response.json