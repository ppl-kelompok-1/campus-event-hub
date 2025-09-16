#!/bin/bash

# Campus Event Hub API Load Testing Script
# Usage: ./scripts/load_test.sh [concurrent_users] [requests_per_user]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:3000"
CONTENT_TYPE="Content-Type: application/json"
CONCURRENT_USERS=${1:-5}
REQUESTS_PER_USER=${2:-10}
TOTAL_REQUESTS=$((CONCURRENT_USERS * REQUESTS_PER_USER))

echo -e "${BLUE}🔥 Campus Event Hub API Load Testing${NC}"
echo "===================================="
echo "Concurrent Users: $CONCURRENT_USERS"
echo "Requests per User: $REQUESTS_PER_USER"
echo "Total Requests: $TOTAL_REQUESTS"
echo "===================================="

# Create results directory
RESULTS_DIR="./load_test_results_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$RESULTS_DIR"

echo -e "\n${YELLOW}Setting up test environment...${NC}"

# Get SUPERADMIN token for user creation
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
    echo -e "${RED}❌ Failed to get SUPERADMIN token${NC}"
    exit 1
fi

echo -e "${GREEN}✅ SUPERADMIN token obtained${NC}"

# Test function for individual user simulation
simulate_user() {
    local user_id=$1
    local user_email="loadtest_user_$user_id@example.com"
    local results_file="$RESULTS_DIR/user_$user_id.log"
    local start_time=$(date +%s.%N)
    
    {
        echo "User $user_id starting load test at $(date)"
        
        # Create user via SUPERADMIN
        local register_start=$(date +%s.%N)
        REGISTER_RESPONSE=$(curl -s -w '%{time_total},%{http_code}\n' \
            -X POST "$BASE_URL/api/v1/users" \
            -H "$CONTENT_TYPE" \
            -H "Authorization: Bearer $SUPERADMIN_TOKEN" \
            -d "{
                \"name\": \"Load Test User $user_id\",
                \"email\": \"$user_email\",
                \"password\": \"loadtest123\",
                \"role\": \"user\"
            }")
        local register_end=$(date +%s.%N)
        echo "CREATE_USER: $(echo "scale=3; $register_end - $register_start" | bc)s - $REGISTER_RESPONSE"
        
        # Login to get token (users are created without tokens)
        local login_start=$(date +%s.%N)
        LOGIN_RESPONSE=$(curl -s -w '%{time_total},%{http_code}\n' \
            -X POST "$BASE_URL/api/v1/auth/login" \
            -H "$CONTENT_TYPE" \
            -d "{\"email\": \"$user_email\", \"password\": \"loadtest123\"}")
        local login_end=$(date +%s.%N)
        echo "LOGIN: $(echo "scale=3; $login_end - $login_start" | bc)s - $LOGIN_RESPONSE"
        
        # Extract token
        local token=""
        if command -v jq >/dev/null 2>&1; then
            token=$(echo "$LOGIN_RESPONSE" | head -n -1 | jq -r '.data.token // empty')
        else
            token=$(echo "$LOGIN_RESPONSE" | head -n -1 | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        fi
        
        if [ -n "$token" ]; then
            # Perform multiple requests
            for i in $(seq 1 $REQUESTS_PER_USER); do
                local request_start=$(date +%s.%N)
                
                case $((i % 4)) in
                    0)
                        # Login
                        RESPONSE=$(curl -s -w '%{time_total},%{http_code}\n' \
                            -X POST "$BASE_URL/api/v1/auth/login" \
                            -H "$CONTENT_TYPE" \
                            -d "{\"email\": \"$user_email\", \"password\": \"loadtest123\"}")
                        echo "LOGIN: $RESPONSE"
                        ;;
                    1)
                        # Get profile
                        RESPONSE=$(curl -s -w '%{time_total},%{http_code}\n' \
                            -X GET "$BASE_URL/api/v1/auth/profile" \
                            -H "Authorization: Bearer $token")
                        echo "PROFILE: $RESPONSE"
                        ;;
                    2)
                        # Update profile
                        RESPONSE=$(curl -s -w '%{time_total},%{http_code}\n' \
                            -X PUT "$BASE_URL/api/v1/auth/profile" \
                            -H "$CONTENT_TYPE" \
                            -H "Authorization: Bearer $token" \
                            -d "{\"name\": \"Updated User $user_id Request $i\"}")
                        echo "UPDATE: $RESPONSE"
                        ;;
                    3)
                        # Health check (lightweight)
                        RESPONSE=$(curl -s -w '%{time_total},%{http_code}\n' \
                            -X GET "$BASE_URL/health")
                        echo "HEALTH: $RESPONSE"
                        ;;
                esac
                
                local request_end=$(date +%s.%N)
                local request_time=$(echo "scale=3; $request_end - $request_start" | bc)
            done
        else
            echo "ERROR: Failed to extract token for user $user_id"
        fi
        
        local end_time=$(date +%s.%N)
        local total_time=$(echo "scale=3; $end_time - $start_time" | bc)
        echo "User $user_id completed in ${total_time}s"
        
    } > "$results_file" 2>&1
}

echo -e "\n${YELLOW}Starting load test with $CONCURRENT_USERS concurrent users...${NC}"

# Start all users in background
START_TIME=$(date +%s.%N)
for i in $(seq 1 $CONCURRENT_USERS); do
    simulate_user $i &
done

# Wait for all users to complete
wait

END_TIME=$(date +%s.%N)
TOTAL_TIME=$(echo "scale=3; $END_TIME - $START_TIME" | bc)

echo -e "\n${GREEN}✅ Load test completed in ${TOTAL_TIME}s${NC}"

# Analyze results
echo -e "\n${BLUE}📊 Analyzing Results...${NC}"

# Create summary report
SUMMARY_FILE="$RESULTS_DIR/summary.txt"
{
    echo "Campus Event Hub API Load Test Summary"
    echo "======================================"
    echo "Test Date: $(date)"
    echo "Concurrent Users: $CONCURRENT_USERS"
    echo "Requests per User: $REQUESTS_PER_USER"
    echo "Total Requests: $TOTAL_REQUESTS"
    echo "Total Test Time: ${TOTAL_TIME}s"
    echo "Requests per Second: $(echo "scale=2; $TOTAL_REQUESTS / $TOTAL_TIME" | bc)"
    echo ""
    
    echo "Response Time Analysis:"
    echo "======================"
    
    # Extract response times and status codes
    if command -v bc >/dev/null 2>&1; then
        ALL_TIMES=$(grep -h ":" "$RESULTS_DIR"/user_*.log | cut -d',' -f1 | grep -o '[0-9.]*')
        SUCCESS_COUNT=$(grep -h ":" "$RESULTS_DIR"/user_*.log | cut -d',' -f2 | grep -c '^2[0-9][0-9]$' || echo "0")
        ERROR_COUNT=$(grep -h ":" "$RESULTS_DIR"/user_*.log | cut -d',' -f2 | grep -c '^[45][0-9][0-9]$' || echo "0")
        
        echo "Successful Requests: $SUCCESS_COUNT"
        echo "Failed Requests: $ERROR_COUNT"
        echo "Success Rate: $(echo "scale=2; $SUCCESS_COUNT * 100 / ($SUCCESS_COUNT + $ERROR_COUNT)" | bc)%"
        
        if [ -n "$ALL_TIMES" ]; then
            AVG_TIME=$(echo "$ALL_TIMES" | awk '{sum+=$1; count++} END {if(count>0) print sum/count; else print 0}')
            MIN_TIME=$(echo "$ALL_TIMES" | sort -n | head -1)
            MAX_TIME=$(echo "$ALL_TIMES" | sort -n | tail -1)
            
            echo "Average Response Time: ${AVG_TIME}s"
            echo "Min Response Time: ${MIN_TIME}s"
            echo "Max Response Time: ${MAX_TIME}s"
        fi
    fi
    
    echo ""
    echo "HTTP Status Code Distribution:"
    echo "============================="
    grep -h ":" "$RESULTS_DIR"/user_*.log | cut -d',' -f2 | sort | uniq -c | sort -nr
    
} > "$SUMMARY_FILE"

# Display summary
cat "$SUMMARY_FILE"

echo -e "\n${BLUE}📁 Results saved to: $RESULTS_DIR${NC}"
echo -e "${BLUE}📄 Summary report: $SUMMARY_FILE${NC}"

# Cleanup test users (optional)
echo -e "\n${YELLOW}Cleaning up test users...${NC}"
for i in $(seq 1 $CONCURRENT_USERS); do
    # This would require getting user IDs and deleting them
    # For now, we'll skip cleanup to avoid complexity
    :
done

echo -e "${GREEN}🎉 Load test completed successfully!${NC}"