# Postman Collection & Newman Setup Guide

**Campus Event Hub - Automated API Testing**

This guide explains how to use the Postman collection for API testing, both manually in Postman UI and automatically with Newman CLI.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Postman UI Setup](#postman-ui-setup)
3. [Newman CLI Setup](#newman-cli-setup)
4. [Running Tests](#running-tests)
5. [Understanding Test Results](#understanding-test-results)
6. [Generating Reports](#generating-reports)
7. [Test Coverage](#test-coverage)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites

- ✅ **Postman Desktop App** installed (https://www.postman.com/downloads/)
- ✅ **Node.js & npm** installed
- ✅ **Backend server** running on `http://localhost:3000`
- ✅ **Database** with test data loaded

### 5-Minute Setup

```bash
# 1. Install Newman globally
npm install -g newman newman-reporter-htmlextra

# 2. Navigate to project root
cd /path/to/campus-event-hub

# 3. Run all API tests
pnpm test:api

# 4. View results
open docs/testing/reports/api-test-report.html
```

**Done!** You now have a professional API test report! 🎉

---

## 🎨 Postman UI Setup

### Step 1: Import Collection

1. **Open Postman Desktop App**

2. **Import Collection:**
   - Click **Import** button (top left)
   - Select **File** tab
   - Choose: `docs/testing/postman/Campus-Event-Hub.postman_collection.json`
   - Click **Import**

3. **Import Environment:**
   - Click **Import** again
   - Select **File** tab
   - Choose: `docs/testing/postman/Campus-Event-Hub.postman_environment.json`
   - Click **Import**

### Step 2: Select Environment

- In the top-right corner, select **"Campus Event Hub - Test Environment"** from the dropdown

### Step 3: Verify Setup

1. **Check Environment Variables:**
   - Click the "eye" icon (Environment Quick Look)
   - Verify `base_url` is `http://localhost:3000/api/v1`
   - Verify user credentials are present

2. **Test Connection:**
   - Open any request (e.g., "TC-API-SETTINGS-001 ✅ Get Settings")
   - Click **Send**
   - Should receive 200 OK response

---

## ⚙️ Newman CLI Setup

Newman is Postman's command-line runner for automated testing.

### Installation

```bash
# Install Newman globally
npm install -g newman

# Install HTML Extra reporter (for beautiful reports)
npm install -g newman-reporter-htmlextra
```

### Verify Installation

```bash
# Check Newman version
newman --version
# Should show: newman/6.x.x or higher

# Check htmlextra reporter
newman run --reporters htmlextra --version
```

### Environment Setup

Ensure your backend server is running:

```bash
# Terminal 1: Start backend
cd packages/server
pnpm run dev
# Server should be running on http://localhost:3000

# Terminal 2: Run tests (from project root)
pnpm test:api
```

---

## 🧪 Running Tests

### Option 1: Using npm Scripts (Recommended)

The easiest way to run tests:

```bash
# Run ALL API tests
pnpm test:api

# Run specific test categories
pnpm test:api:auth           # Authentication tests
pnpm test:api:users          # User Management tests
pnpm test:api:events         # Event Management tests
pnpm test:api:registration   # Event Registration tests
pnpm test:api:locations      # Location Management tests
pnpm test:api:settings       # Site Settings tests

# Open HTML report
pnpm test:api:report
```

### Option 2: Using Shell Script

For more control and options:

```bash
# Make script executable (first time only)
chmod +x docs/testing/scripts/run-api-tests.sh

# Run all tests
./docs/testing/scripts/run-api-tests.sh

# Run specific folder
./docs/testing/scripts/run-api-tests.sh --auth
./docs/testing/scripts/run-api-tests.sh --events

# Run and automatically open report
./docs/testing/scripts/run-api-tests.sh --all --report

# Show help
./docs/testing/scripts/run-api-tests.sh --help
```

### Option 3: Using Newman Directly

For advanced usage:

```bash
# Basic run
newman run docs/testing/postman/Campus-Event-Hub.postman_collection.json \
  -e docs/testing/postman/Campus-Event-Hub.postman_environment.json

# With HTML report
newman run docs/testing/postman/Campus-Event-Hub.postman_collection.json \
  -e docs/testing/postman/Campus-Event-Hub.postman_environment.json \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export docs/testing/reports/api-test-report.html

# Run specific folder
newman run docs/testing/postman/Campus-Event-Hub.postman_collection.json \
  -e docs/testing/postman/Campus-Event-Hub.postman_environment.json \
  --folder "Authentication"

# With detailed output
newman run docs/testing/postman/Campus-Event-Hub.postman_collection.json \
  -e docs/testing/postman/Campus-Event-Hub.postman_environment.json \
  --verbose
```

### Option 4: Run in Postman UI

1. Open Postman Desktop App
2. Select **Campus Event Hub - API Testing** collection
3. Click **Run** button (blue button with play icon)
4. **Collection Runner** window opens:
   - Select **Campus Event Hub - Test Environment**
   - Choose which requests to run (or select all)
   - Click **Run Campus Event Hub - API Testing**
5. View results in real-time

---

## 📊 Understanding Test Results

### CLI Output

When you run tests, you'll see:

```bash
┌─────────────────────────┬─────────────┬─────────────┐
│                         │    executed │      failed │
├─────────────────────────┼─────────────┼─────────────┤
│              iterations │           1 │           0 │
├─────────────────────────┼─────────────┼─────────────┤
│                requests │          38 │           0 │
├─────────────────────────┼─────────────┼─────────────┤
│            test-scripts │          76 │           0 │
├─────────────────────────┼─────────────┼─────────────┤
│      prerequest-scripts │           2 │           0 │
├─────────────────────────┼─────────────┼─────────────┤
│              assertions │         152 │           0 │
├─────────────────────────┴─────────────┴─────────────┤
│ total run duration: 3.2s                            │
├─────────────────────────────────────────────────────┤
│ total data received: 12.5kB (approx)                │
├─────────────────────────────────────────────────────┤
│ average response time: 85ms [min: 23ms, max: 241ms] │
└─────────────────────────────────────────────────────┘
```

**Key Metrics:**
- ✅ **Requests**: Total API calls made
- ✅ **Assertions**: Number of test checks performed
- ✅ **Failed**: Should be 0 for all passing tests
- ✅ **Response Time**: Performance metrics

### HTML Report

Open the generated report: `docs/testing/reports/api-test-report.html`

**Report Sections:**

1. **Summary Dashboard:**
   - Total requests
   - Pass/fail rate
   - Total response time
   - Test distribution by folder

2. **Request Details:**
   - ✅ Green checkmark: Passed
   - ❌ Red X: Failed
   - Request URL, method, headers
   - Request body (JSON formatted)
   - Response status, headers, body
   - All test assertions with results

3. **Test Results:**
   - Each assertion listed
   - Expected vs. actual values
   - Error messages for failures

4. **Environment Data:**
   - All variables used (passwords hidden)
   - API base URL
   - Test data IDs

---

## 📈 Generating Reports

### Standard HTML Report

```bash
# Run tests and generate HTML report
pnpm test:api

# Report saved to:
docs/testing/reports/api-test-report.html
```

### Custom Report Configuration

Edit `docs/testing/postman/newman-config.json`:

```json
{
  "reporter": {
    "htmlextra": {
      "export": "docs/testing/reports/api-test-report.html",
      "title": "Your Custom Title",
      "darkTheme": true,           // Enable dark mode
      "testPaging": true,          // Paginate test results
      "showEnvironmentData": true, // Show env variables
      "timezone": "Asia/Jakarta"   // Your timezone
    }
  }
}
```

### Multiple Report Formats

```bash
# Generate HTML + JSON + JUnit
newman run docs/testing/postman/Campus-Event-Hub.postman_collection.json \
  -e docs/testing/postman/Campus-Event-Hub.postman_environment.json \
  --reporters cli,htmlextra,json,junit \
  --reporter-htmlextra-export docs/testing/reports/report.html \
  --reporter-json-export docs/testing/reports/report.json \
  --reporter-junit-export docs/testing/reports/report.xml
```

### Taking Screenshots of Reports

#### Option 1: Manual Screenshots

1. Open `docs/testing/reports/api-test-report.html` in browser
2. Use browser's screenshot tool:
   - **Chrome/Edge**: DevTools (F12) → Capture full size screenshot
   - **Firefox**: Right-click → Take Screenshot → Save Full Page
3. Save to: `docs/testing/screenshots/backend/api-responses/`

#### Option 2: Automated (Advanced)

Using Puppeteer to convert HTML to PNG:

```javascript
// save-report-screenshots.js
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('file:///path/to/api-test-report.html');
  await page.screenshot({
    path: 'docs/testing/screenshots/backend/api-test-full.png',
    fullPage: true
  });
  await browser.close();
})();
```

---

## ✅ Test Coverage

### API Endpoints Covered

| Category | Endpoints | Tests |
|----------|-----------|-------|
| **Authentication** | 3 | 5 tests |
| **User Management** | 4 | 7 tests |
| **Events** | 6 | 5 tests |
| **Event Registration** | 3 | 5 tests |
| **Locations** | 3 | 3 tests |
| **Settings** | 2 | 3 tests |
| **TOTAL** | **21** | **38 tests** |

### Test Types

- ✅ **Positive Tests** (18): Verify features work with valid input
- ❌ **Negative Tests** (20): Verify proper error handling
- 🔒 **Authorization Tests**: Role-based access control
- 🔍 **Validation Tests**: Input validation and business rules

### What's Tested

For each endpoint, tests verify:

1. ✅ **HTTP Status Code** (200, 201, 400, 401, 403, 404, 409)
2. ✅ **Response Structure** (JSON format, required fields)
3. ✅ **Response Time** (< 1000ms for most requests)
4. ✅ **Data Validation** (correct data returned)
5. ✅ **Error Messages** (clear, specific error messages)
6. ✅ **No Side Effects** (negative tests don't create data)
7. ✅ **Authentication** (token required where appropriate)
8. ✅ **Authorization** (role-based access enforced)

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "Newman is not installed"

**Solution:**
```bash
npm install -g newman newman-reporter-htmlextra
```

#### 2. "Backend server is not running"

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:3000`

**Solution:**
```bash
# Start backend server
cd packages/server
pnpm run dev
```

#### 3. "401 Unauthorized" on authenticated requests

**Cause:** Token expired or not set

**Solution:**
1. In Postman, run "TC-API-LOGIN-001" request first
2. This will automatically store the token
3. Then run other requests

Or in CLI:
```bash
# The collection automatically handles token storage
# Just ensure you run authentication tests first or run the full collection
pnpm test:api
```

#### 4. "Cannot find collection file"

**Solution:**
```bash
# Ensure you're in project root directory
cd /path/to/campus-event-hub

# Verify file exists
ls docs/testing/postman/Campus-Event-Hub.postman_collection.json
```

#### 5. Tests failing due to missing test data

**Solution:**

Run the SQL setup script from TEST_DATA.md:

```bash
sqlite3 packages/server/data/app.db < docs/testing/scripts/setup-test-data.sql
```

Or manually create test users and data.

#### 6. "htmlextra reporter not found"

**Solution:**
```bash
npm install -g newman-reporter-htmlextra
```

#### 7. Wrong environment selected in Postman

**Solution:**
- Top-right corner dropdown
- Select: "Campus Event Hub - Test Environment"
- Click the "eye" icon to verify base_url

---

## 📝 Tips & Best Practices

### For Manual Testing (Postman UI)

1. **Run Login First**: Always run login request before testing authenticated endpoints
2. **Check Environment**: Verify correct environment selected
3. **View Console**: Enable Console (View → Show Postman Console) for debugging
4. **Save Responses**: Use "Save Response" to keep examples
5. **Test One by One**: Run individual requests to debug specific issues

### For Automated Testing (Newman CLI)

1. **CI/CD Integration**: Add `pnpm test:api` to your CI/CD pipeline
2. **Scheduled Runs**: Use cron jobs to run tests periodically
3. **Report Archiving**: Archive reports with timestamps:
   ```bash
   newman run ... --reporter-htmlextra-export \
     docs/testing/reports/report-$(date +%Y%m%d-%H%M%S).html
   ```
4. **Fail Fast**: Use `--bail` flag to stop on first failure:
   ```bash
   newman run ... --bail
   ```

### Best Practices

1. ✅ **Reset Test Data**: Ensure database is in known state before testing
2. ✅ **Run Sequentially**: Some tests depend on previous test data
3. ✅ **Check Server Logs**: Monitor server console for errors
4. ✅ **Update Collection**: Keep collection in sync with API changes
5. ✅ **Version Control**: Commit collection and environment files

---

## 📚 Additional Resources

### Newman Documentation
- Official Docs: https://learning.postman.com/docs/running-collections/using-newman-cli/command-line-integration-with-newman/
- Newman API Reference: https://www.npmjs.com/package/newman
- HTML Extra Reporter: https://www.npmjs.com/package/newman-reporter-htmlextra

### Postman Learning
- Postman Learning Center: https://learning.postman.com/
- Writing Tests: https://learning.postman.com/docs/writing-scripts/test-scripts/
- Variables: https://learning.postman.com/docs/sending-requests/variables/

### Campus Event Hub Docs
- Main Testing Guide: `../TEST_SCRIPT.md`
- Test Data Reference: `../TEST_DATA.md`
- Screenshot Guide: `../screenshots/README.md`

---

## 🎯 Next Steps

### After Setup

1. ✅ Import collection and environment to Postman
2. ✅ Install Newman CLI
3. ✅ Run tests to verify setup
4. ✅ Review HTML report
5. ✅ Take screenshots for documentation

### For Week 8-10 Deliverable

1. **Run All Tests:**
   ```bash
   pnpm test:api
   ```

2. **Generate Report:**
   - Report auto-generated at: `docs/testing/reports/api-test-report.html`

3. **Take Screenshots:**
   - Open report in browser
   - Screenshot request/response examples
   - Save to `docs/testing/screenshots/backend/api-responses/`
   - Name format: `TC-API-LOGIN-001_1_request.png`

4. **Update TEST_SCRIPT.md:**
   - Fill "Actual Result" column
   - Mark "Status" (Passed/Failed)
   - Add screenshot links

5. **Submit:**
   - TEST_SCRIPT.md (completed)
   - screenshots/ (evidence)
   - Postman collection (reusable)
   - HTML report (professional documentation)

---

## 💬 Support

Need help? Check these resources:

1. **📖 README Files:**
   - `/docs/testing/README.md` - Main testing guide
   - `/docs/testing/TEST_DATA.md` - Test data reference

2. **🐛 Issues:**
   - Check server logs: `packages/server/logs/`
   - Enable Newman verbose mode: `--verbose`
   - Check Postman console

3. **💡 Questions:**
   - Review TEST_SCRIPT.md for expected results
   - Check environment variables
   - Verify test data exists in database

---

## ✨ Quick Reference

### Essential Commands

```bash
# Setup
npm install -g newman newman-reporter-htmlextra

# Run tests
pnpm test:api                  # All tests
pnpm test:api:auth             # Auth only
pnpm test:api:events           # Events only

# View report
pnpm test:api:report           # Opens HTML report

# Custom run
./docs/testing/scripts/run-api-tests.sh --events --report
```

### File Locations

```
docs/testing/
├── postman/
│   ├── Campus-Event-Hub.postman_collection.json  # Import this
│   ├── Campus-Event-Hub.postman_environment.json # And this
│   └── newman-config.json                         # Newman settings
├── reports/
│   └── api-test-report.html                       # Generated report
└── screenshots/
    └── backend/api-responses/                     # Save screenshots here
```

---

**Created for:** Software Project Week 8-10 Testing Deliverable
**Version:** 1.0.0
**Last Updated:** 2025-11-06

---

**Happy Testing! 🚀**
