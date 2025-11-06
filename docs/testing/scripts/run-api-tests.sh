#!/bin/bash

###############################################################################
# Campus Event Hub - Automated API Testing Script
#
# This script runs Newman to execute Postman collection tests and generate
# professional HTML reports
#
# Usage:
#   ./run-api-tests.sh [options]
#
# Options:
#   --all           Run all tests (default)
#   --auth          Run only Authentication tests
#   --users         Run only User Management tests
#   --events        Run only Events tests
#   --registration  Run only Event Registration tests
#   --locations     Run only Locations tests
#   --settings      Run only Settings tests
#   --report        Open HTML report in browser after completion
#   --help          Show this help message
#
###############################################################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directories
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../" && pwd)"
POSTMAN_DIR="$PROJECT_ROOT/docs/testing/postman"
REPORTS_DIR="$PROJECT_ROOT/docs/testing/reports"

# Files
COLLECTION="$POSTMAN_DIR/Campus-Event-Hub.postman_collection.json"
ENVIRONMENT="$POSTMAN_DIR/Campus-Event-Hub.postman_environment.json"
NEWMAN_CONFIG="$POSTMAN_DIR/newman-config.json"

# Options
FOLDER=""
OPEN_REPORT=false

###############################################################################
# Functions
###############################################################################

print_header() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║       Campus Event Hub - API Automated Testing                   ║"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "${GREEN}➜${NC} $1"
}

print_error() {
    echo -e "${RED}✖${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_success() {
    echo -e "${GREEN}✔${NC} $1"
}

check_requirements() {
    print_step "Checking requirements..."

    # Check if Newman is installed
    if ! command -v newman &> /dev/null; then
        print_error "Newman is not installed!"
        echo ""
        echo "Install Newman globally:"
        echo "  npm install -g newman newman-reporter-htmlextra"
        echo ""
        exit 1
    fi

    # Check if htmlextra reporter is installed
    if ! newman run --reporters htmlextra 2>&1 | grep -q "htmlextra"; then
        print_warning "Newman HTML Extra reporter not found, installing..."
        npm install -g newman-reporter-htmlextra
    fi

    # Check if collection file exists
    if [ ! -f "$COLLECTION" ]; then
        print_error "Postman collection not found: $COLLECTION"
        exit 1
    fi

    # Check if environment file exists
    if [ ! -f "$ENVIRONMENT" ]; then
        print_error "Postman environment not found: $ENVIRONMENT"
        exit 1
    fi

    # Create reports directory if it doesn't exist
    mkdir -p "$REPORTS_DIR"

    print_success "All requirements met!"
}

check_server() {
    print_step "Checking if server is running..."

    if ! curl -s http://localhost:3000/api/v1/settings > /dev/null; then
        print_error "Backend server is not running on http://localhost:3000"
        echo ""
        echo "Start the server first:"
        echo "  cd packages/server && pnpm run dev"
        echo ""
        exit 1
    fi

    print_success "Server is running!"
}

run_tests() {
    local folder_option=""

    if [ -n "$FOLDER" ]; then
        folder_option="--folder $FOLDER"
        print_step "Running tests for folder: $FOLDER"
    else
        print_step "Running all tests..."
    fi

    echo ""

    # Run Newman
    newman run "$COLLECTION" \
        --environment "$ENVIRONMENT" \
        $folder_option \
        --reporters cli,htmlextra,json \
        --reporter-htmlextra-export "$REPORTS_DIR/api-test-report.html" \
        --reporter-htmlextra-title "Campus Event Hub - API Test Report" \
        --reporter-htmlextra-darkTheme \
        --reporter-htmlextra-testPaging \
        --reporter-htmlextra-browserTitle "Campus Event Hub API Tests" \
        --reporter-htmlextra-showEnvironmentData \
        --reporter-htmlextra-skipEnvironmentVars "superadmin_password,admin_password,approver_password,user_password" \
        --reporter-htmlextra-skipHeaders "Authorization" \
        --reporter-htmlextra-timezone "Asia/Jakarta" \
        --reporter-json-export "$REPORTS_DIR/api-test-results.json" \
        --bail false \
        --timeout 10000 \
        --timeout-request 5000 \
        --delay-request 100 \
        --color on

    local exit_code=$?

    echo ""

    if [ $exit_code -eq 0 ]; then
        print_success "All tests passed!"
    else
        print_error "Some tests failed. Check the report for details."
    fi

    return $exit_code
}

show_results() {
    echo ""
    print_step "Test results saved to:"
    echo "  HTML Report: $REPORTS_DIR/api-test-report.html"
    echo "  JSON Results: $REPORTS_DIR/api-test-results.json"
    echo ""

    if [ "$OPEN_REPORT" = true ]; then
        print_step "Opening HTML report in browser..."

        # Detect OS and open browser
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            open "$REPORTS_DIR/api-test-report.html"
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            xdg-open "$REPORTS_DIR/api-test-report.html" 2>/dev/null || \
            firefox "$REPORTS_DIR/api-test-report.html" 2>/dev/null || \
            chromium "$REPORTS_DIR/api-test-report.html" 2>/dev/null
        elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
            # Windows (Git Bash)
            start "$REPORTS_DIR/api-test-report.html"
        fi
    fi
}

show_help() {
    cat << EOF
Campus Event Hub - Automated API Testing Script

USAGE:
    ./run-api-tests.sh [options]

OPTIONS:
    --all           Run all tests (default)
    --auth          Run only Authentication tests
    --users         Run only User Management tests
    --events        Run only Events tests
    --registration  Run only Event Registration tests
    --locations     Run only Locations tests
    --settings      Run only Settings tests
    --report        Open HTML report in browser after completion
    --help          Show this help message

EXAMPLES:
    # Run all tests
    ./run-api-tests.sh

    # Run only authentication tests
    ./run-api-tests.sh --auth

    # Run all tests and open report
    ./run-api-tests.sh --all --report

    # Run event tests
    ./run-api-tests.sh --events

REQUIREMENTS:
    - Node.js and npm installed
    - Newman installed globally: npm install -g newman newman-reporter-htmlextra
    - Backend server running on http://localhost:3000

EOF
}

###############################################################################
# Main Script
###############################################################################

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --all)
            FOLDER=""
            shift
            ;;
        --auth)
            FOLDER="Authentication"
            shift
            ;;
        --users)
            FOLDER="User Management"
            shift
            ;;
        --events)
            FOLDER="Events"
            shift
            ;;
        --registration)
            FOLDER="Event Registration"
            shift
            ;;
        --locations)
            FOLDER="Locations"
            shift
            ;;
        --settings)
            FOLDER="Settings"
            shift
            ;;
        --report)
            OPEN_REPORT=true
            shift
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Run the test workflow
print_header
check_requirements
check_server
run_tests
TEST_EXIT_CODE=$?
show_results

# Exit with the same code as newman
exit $TEST_EXIT_CODE
