# Campus Event Hub - Testing Documentation

**Testing Report for Software Project - Week 8-10**

---

## 📋 Overview

This directory contains comprehensive testing documentation for the Campus Event Hub application, including positive and negative test scripts, test data references, and screenshot evidence.

**Testing Methodology:** Positive & Negative Testing
**Total Test Cases:** 64
**Coverage:** Core Features (Authentication, User Management, Events, Registration, Locations, Settings)

---

## 📁 Directory Structure

```
docs/testing/
├── README.md                    # This file - Testing documentation overview
├── TEST_SCRIPT.md              # Complete test cases with execution tracking
├── TEST_DATA.md                # Pre-defined test data and reference values
├── postman/                    # Postman collection & Newman setup ⭐ NEW!
│   ├── Campus-Event-Hub.postman_collection.json  # API test collection
│   ├── Campus-Event-Hub.postman_environment.json # Environment variables
│   ├── newman-config.json      # Newman CLI configuration
│   └── README.md               # Postman usage guide
├── scripts/                    # Automation scripts ⭐ NEW!
│   └── run-api-tests.sh        # Automated test runner
├── reports/                    # Generated test reports ⭐ NEW!
│   └── api-test-report.html    # HTML test report (auto-generated)
└── screenshots/                # Test evidence and screenshots
    ├── README.md               # Screenshot guide and conventions
    ├── frontend/               # UI testing screenshots
    │   ├── auth/              # Authentication tests
    │   ├── users/             # User management tests
    │   ├── events/            # Event management tests
    │   ├── registration/      # Event registration tests
    │   ├── locations/         # Location management tests
    │   └── settings/          # Site settings tests
    └── backend/               # API testing screenshots
        └── api-responses/     # API response captures
```

---

## 📚 Document Guide

### 1. [TEST_SCRIPT.md](./TEST_SCRIPT.md)

**Main Testing Document** - Contains all test cases with detailed execution instructions.

**Includes:**
- ✅ 64 comprehensive test cases (26 positive, 38 negative)
- ✅ Test case matrices (Frontend UI + Backend API)
- ✅ Detailed test scenarios with expected results
- ✅ Specific screenshot instructions per test
- ✅ Test execution tracking (Passed/Failed/Blocked)
- ✅ Defect reporting template
- ✅ Test summary and statistics

**Test Categories:**
1. **Authentication & Authorization** (10 tests)
2. **User Management** (12 tests)
3. **Event Management** (18 tests)
4. **Event Registration** (10 tests)
5. **Location Management** (8 tests)
6. **Site Settings** (6 tests)

### 2. [TEST_DATA.md](./TEST_DATA.md)

**Test Data Reference** - Pre-defined data sets for consistent testing.

**Includes:**
- ✅ Test user accounts for all roles (Superadmin, Admin, Approver, User)
- ✅ Sample event data templates
- ✅ Location test data
- ✅ Valid and invalid input examples
- ✅ Boundary value test cases
- ✅ SQL setup scripts
- ✅ API testing collection structure
- ✅ Quick reference commands

**Quick Access:**
- User credentials with default passwords
- API endpoints and sample requests
- Database queries for verification
- Environment variables for testing

### 3. [postman/README.md](./postman/README.md) ⭐ NEW!

**Postman Collection & Automated API Testing** - Automated testing setup with Newman.

**Includes:**
- ✅ Complete Postman collection (38 API test cases)
- ✅ Environment configuration with test data
- ✅ Newman CLI setup and usage guide
- ✅ Automated test execution scripts
- ✅ HTML report generation
- ✅ Screenshot capture instructions

**Quick Start:**
```bash
# Install Newman
npm install -g newman newman-reporter-htmlextra

# Run all API tests
pnpm test:api

# View professional HTML report
pnpm test:api:report
```

**What You Get:**
- ✅ Automated test execution (1-2 minutes)
- ✅ Beautiful HTML reports with request/response details
- ✅ Pass/fail statistics
- ✅ Response time metrics
- ✅ Ready-to-screenshot professional documentation

### 4. [screenshots/README.md](./screenshots/README.md)

**Screenshot Evidence Guide** - Standards for capturing test evidence.

**Includes:**
- ✅ Screenshot naming conventions
- ✅ Quality guidelines
- ✅ Folder organization structure
- ✅ Example screenshot sequences
- ✅ Tools and setup recommendations
- ✅ Privacy and security considerations

---

## 🚀 Quick Start Guide

### Step 1: Environment Setup

1. **Ensure Application is Running:**
   ```bash
   # From project root
   cd packages/server
   npm run dev          # Start backend on http://localhost:3000

   cd packages/client
   npm run dev          # Start frontend on http://localhost:5173
   ```

2. **Verify Database:**
   ```bash
   # Check if test users exist
   sqlite3 packages/server/data/app.db "SELECT id, name, email, role FROM users;"
   ```

3. **Setup Test Data:**
   - Follow SQL scripts in [TEST_DATA.md](./TEST_DATA.md)
   - Create test user accounts
   - Create sample events and locations

### Step 2: Prepare Testing Tools

**For Frontend Testing:**
- ✅ Browser (Chrome/Firefox/Edge)
- ✅ Browser DevTools (F12)
- ✅ Screenshot tool (Snipping Tool, Greenshot, etc.)

**For Backend Testing - Choose ONE:**

**Option A: Automated (Recommended) ⭐**
```bash
# Install Newman CLI
npm install -g newman newman-reporter-htmlextra

# Run all API tests automatically
pnpm test:api

# View beautiful HTML report
pnpm test:api:report
```

**Option B: Manual (Postman UI)**
- ✅ Install Postman Desktop App
- ✅ Import `docs/testing/postman/Campus-Event-Hub.postman_collection.json`
- ✅ Import `docs/testing/postman/Campus-Event-Hub.postman_environment.json`
- ✅ Run tests manually in Postman UI

**Option C: Other API Client**
- ✅ Thunder Client / Insomnia / REST Client
- ✅ Manual API testing following TEST_SCRIPT.md

### Step 3: Execute Tests

1. **Open TEST_SCRIPT.md**
2. **Start from Test Case 1 (TC-LOGIN-001)**
3. **For each test:**
   - Read test scenario and test data
   - Perform the test steps
   - Capture screenshots as instructed
   - Compare actual result with expected result
   - Mark status (Passed ✅ / Failed ❌)
   - Document any defects

4. **Save Screenshots:**
   - Follow naming convention: `TC-[FEATURE]-[NUMBER]_[STEP]_[DESCRIPTION].png`
   - Place in correct folder: `screenshots/frontend/` or `screenshots/backend/`

5. **Update Test Script:**
   - Fill "Actual Result" column
   - Update "Status" column
   - Add screenshot links/references

### Step 4: Report Results

1. **Complete Test Execution Summary:**
   - Update pass/fail counts
   - Calculate pass rates
   - Document defects found

2. **Review Evidence:**
   - Verify all screenshots captured
   - Ensure proper naming and organization
   - Check for sensitive data

3. **Submit Documentation:**
   - TEST_SCRIPT.md (completed)
   - TEST_DATA.md (reference)
   - screenshots/ (evidence)
   - README.md (guide)

---

## 🎯 Testing Best Practices

### From PDF Reference (Bambang Widoyono - Fatisda)

1. **Start from requirements, not from ideas**
   - Positive tests prove requirements work
   - Negative tests prove rules are enforced

2. **Use test case pair pattern**
   - Every positive test has a "negative twin"
   - Example: Valid login ↔ Invalid password

3. **Define "valid" and "invalid" precisely**
   - Break one rule at a time in negative tests
   - Document exact validation rules

4. **Focus negative tests on risk areas**
   - User input forms
   - File uploads
   - Numbers, money, dates
   - Security-related features
   - Integration/API calls

5. **Check 3 things in every negative test**
   - ✅ Right error message (user knows what to fix)
   - ✅ Right status code (400, 401, 403, not 500)
   - ✅ No side effects (no records created)

6. **Make expected results specific**
   - ❌ Bad: "System shows error"
   - ✅ Good: "System displays 'Email is required' in red text below email field, form is not submitted, HTTP 400 status"

7. **Include boundary tests**
   - Min/max values
   - Edge cases
   - Zero, negative, very large numbers

8. **Include role/permission tests**
   - Test access control
   - Verify authorization
   - Check forbidden operations

---

## 📊 Test Coverage Matrix

| Feature Area | Test Cases | Positive | Negative | Coverage |
|--------------|------------|----------|----------|----------|
| **Authentication** | 10 | 4 | 6 | Login, Profile, Token validation |
| **User Management** | 12 | 5 | 7 | CRUD, Role assignment, Permissions |
| **Event Management** | 18 | 8 | 10 | CRUD, Approval workflow, Status changes |
| **Event Registration** | 10 | 4 | 6 | Register, Unregister, Capacity, Periods |
| **Location Management** | 8 | 3 | 5 | CRUD, Active/Inactive, Usage validation |
| **Site Settings** | 6 | 2 | 4 | View, Update, Logo upload, Permissions |
| **TOTAL** | **64** | **26** | **38** | **Core Features** |

---

## 🔍 Testing Scope

### ✅ In Scope

**Frontend UI Testing:**
- User authentication flows
- Form validation and error handling
- Role-based UI access control
- Event creation and management workflows
- Registration processes
- Admin panels and settings

**Backend API Testing:**
- All REST API endpoints
- Request/response validation
- HTTP status codes
- Authentication and authorization
- Business logic validation
- Data integrity checks

**Test Types:**
- ✅ Positive Testing (happy path)
- ✅ Negative Testing (error handling)
- ✅ Boundary Testing (edge cases)
- ✅ Authorization Testing (role-based access)

### ❌ Out of Scope

- Performance testing (load, stress)
- Security penetration testing
- Automated test scripts
- Cross-browser compatibility (testing in one browser only)
- Mobile responsive testing
- Accessibility (WCAG) testing
- Integration with external systems
- Database backup/recovery testing

---

## 🛠️ Tools & Technologies

### Testing Tools

| Tool | Purpose | Usage |
|------|---------|-------|
| **Browser DevTools** | Frontend debugging, network inspection | F12 in Chrome/Firefox/Edge |
| **Postman/Thunder Client** | API testing, request management | Install extension/app |
| **SQLite Browser** | Database inspection | Query test data directly |
| **Screenshot Tool** | Capture test evidence | OS native or third-party |
| **Text Editor** | Update test documentation | VS Code, Notepad++, etc. |

### Application Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + Express + TypeScript
- **Database:** SQLite
- **Authentication:** JWT (JSON Web Tokens)
- **API:** RESTful API (JSON)

---

## 📝 Test Execution Checklist

### Before Testing

- [ ] Application is running (frontend + backend)
- [ ] Database has test data loaded
- [ ] Test user accounts created
- [ ] API testing tool configured
- [ ] Screenshot tool ready
- [ ] TEST_SCRIPT.md opened

### During Testing

- [ ] Follow test cases in order
- [ ] Use exact test data from TEST_DATA.md
- [ ] Capture all required screenshots
- [ ] Rename screenshots immediately
- [ ] Document actual results
- [ ] Mark test status
- [ ] Note any defects

### After Testing

- [ ] All test cases executed
- [ ] All screenshots captured and organized
- [ ] TEST_SCRIPT.md completed
- [ ] Test summary updated
- [ ] Defects documented
- [ ] Evidence reviewed
- [ ] Ready for submission

---

## 🐛 Defect Reporting

If you find bugs during testing, document them in TEST_SCRIPT.md:

### Defect Template

```markdown
| Defect ID | Test Case | Severity | Description | Steps to Reproduce | Expected | Actual | Status |
|-----------|-----------|----------|-------------|-------------------|----------|--------|--------|
| DEF-001 | TC-LOGIN-002 | High | Error message not displayed | 1. Open login page<br>2. Enter wrong password<br>3. Click login | Error: "Invalid credentials" | No error shown | Open |
```

### Severity Levels

- **Critical:** System crash, data loss, security breach
- **High:** Major functionality broken, no workaround
- **Medium:** Feature partially works, workaround available
- **Low:** Minor issue, cosmetic problem, typo

---

## 📈 Test Metrics

Track these metrics during testing:

### Execution Metrics

- **Total Test Cases:** 64
- **Test Cases Executed:** [To be filled]
- **Test Cases Passed:** [To be filled]
- **Test Cases Failed:** [To be filled]
- **Test Cases Blocked:** [To be filled]
- **Pass Rate:** [To be calculated]

### Coverage Metrics

- **Features Covered:** 6 core features
- **API Endpoints Covered:** ~30 endpoints
- **User Roles Tested:** 4 roles (Superadmin, Admin, Approver, User)
- **Test Types:** Positive + Negative + Boundary + Authorization

### Quality Metrics

- **Defects Found:** [To be filled]
- **Critical Defects:** [To be filled]
- **High Priority Defects:** [To be filled]
- **Defect Density:** Defects per test case

---

## 🎓 Learning Resources

### Understanding Testing Concepts

- **Positive Testing:** Validates the system works correctly with valid input
- **Negative Testing:** Validates the system handles invalid input gracefully
- **Boundary Testing:** Tests limits and edge cases (min, max, zero)
- **Authorization Testing:** Verifies role-based access control

### Key Testing Principles

1. **Test Early, Test Often:** Catch bugs early in development
2. **Test with Real Data:** Use realistic test scenarios
3. **Test Edge Cases:** Don't just test happy paths
4. **Test Security:** Verify authentication and authorization
5. **Document Everything:** Good documentation helps debugging

### HTTP Status Codes Reference

- **200 OK:** Request succeeded
- **201 Created:** Resource created successfully
- **400 Bad Request:** Invalid input/validation error
- **401 Unauthorized:** Missing or invalid authentication
- **403 Forbidden:** Valid auth but insufficient permissions
- **404 Not Found:** Resource doesn't exist
- **409 Conflict:** Duplicate or constraint violation
- **500 Internal Server Error:** Server-side error (bug)

---

## 💡 Tips for Success

### Testing Efficiency

1. **Use Browser Profiles:** Create separate profile for testing to avoid mixing personal data
2. **Keep Test Data Handy:** Have TEST_DATA.md open in another tab
3. **Batch Similar Tests:** Do all login tests, then all user management tests, etc.
4. **Take Breaks:** Testing can be repetitive, take breaks to stay focused
5. **Document As You Go:** Don't wait until the end to update test script

### Common Pitfalls to Avoid

- ❌ Not following exact test data
- ❌ Skipping screenshot instructions
- ❌ Testing in production environment
- ❌ Not verifying no side effects in negative tests
- ❌ Not checking HTTP status codes
- ❌ Poor screenshot quality or missing context
- ❌ Not documenting defects immediately

### Quality Assurance

- ✅ Every test uses consistent test data
- ✅ Every screenshot is clear and properly named
- ✅ Every actual result is documented
- ✅ Every defect has reproduction steps
- ✅ Every status code is verified
- ✅ Every negative test checks for no side effects

---

## 📞 Support & Questions

### Common Questions

**Q: What if a test is blocked (can't execute)?**
A: Mark status as "Blocked", document the blocker, and continue with next test.

**Q: Should I fix bugs I find?**
A: No, this is testing phase. Document bugs and continue testing.

**Q: What if I find a bug not covered by test cases?**
A: Document it as an additional defect with steps to reproduce.

**Q: How many screenshots should I take per test?**
A: Follow TEST_SCRIPT.md instructions. Typically 2-3 per test (before, result, verification).

**Q: Can I test in a different order?**
A: Yes, but follow feature groupings. Some tests may depend on previous test data.

**Q: What if test data changes during testing?**
A: Reset database to initial state or create new test data as needed.

### Need Help?

- 📖 Review [TEST_SCRIPT.md](./TEST_SCRIPT.md) for detailed instructions
- 📊 Check [TEST_DATA.md](./TEST_DATA.md) for data references
- 📸 See [screenshots/README.md](./screenshots/README.md) for screenshot guidance
- 🔍 Search TEST_SCRIPT.md for specific test cases

---

## 📅 Testing Schedule

### Week 8-10 Deliverable

According to Software Project requirements:

- **Week 8:** Begin test execution (Authentication, User Management)
- **Week 9:** Continue testing (Events, Registration)
- **Week 10:** Complete testing (Locations, Settings), compile report
- **Submission:** Complete test script with evidence (5% of grade)

### Recommended Timeline

**Day 1-2: Setup & Preparation**
- Environment setup
- Test data creation
- Tool configuration

**Day 3-5: Core Testing**
- Execute authentication tests
- Execute user management tests
- Execute event management tests

**Day 6-7: Additional Testing**
- Execute registration tests
- Execute location tests
- Execute settings tests

**Day 8-9: Documentation & Review**
- Complete test script
- Organize screenshots
- Review all evidence

**Day 10: Final Submission**
- Quality check
- Export/package documentation
- Submit

---

## ✅ Submission Checklist

Before submitting Week 8-10 deliverable:

### Documentation Complete

- [ ] TEST_SCRIPT.md completed with all results
- [ ] Test execution summary filled
- [ ] All test statuses marked (Passed/Failed/Blocked)
- [ ] Actual results documented
- [ ] Defects recorded (if any)

### Evidence Complete

- [ ] All screenshots captured
- [ ] Screenshots properly named
- [ ] Screenshots organized in folders
- [ ] No sensitive data in screenshots
- [ ] Screenshot quality verified

### Quality Check

- [ ] All 64 test cases executed
- [ ] Pass/Fail counts calculated
- [ ] Pass rate calculated
- [ ] Defect reports complete
- [ ] No placeholder values (e.g., "[To be filled]")

### Final Package

- [ ] docs/testing/ folder complete
- [ ] All files present (README, TEST_SCRIPT, TEST_DATA, screenshots)
- [ ] File sizes reasonable
- [ ] Ready for submission

---

## 🎉 Success Criteria

Your testing is successful when:

✅ **Coverage:** All 64 test cases executed
✅ **Evidence:** All screenshots captured and organized
✅ **Documentation:** TEST_SCRIPT.md completely filled
✅ **Quality:** Clear, specific results documented
✅ **Defects:** All bugs found and reported
✅ **Submission:** Ready for Week 8-10 deliverable (5% grade)

---

## 📄 License & Attribution

**Created for:** Universitas Sebelas Maret (UNS)
**Course:** Software Project
**Instructor:** Bambang Widoyono (Fatisda)
**Week:** 8-10 (Testing Script Deliverable - 5%)
**Document Version:** 1.0.0
**Last Updated:** 2025-11-06

---

## 🙏 Acknowledgments

Testing methodology and best practices based on:
- Software Project Week 8-10 Testing Script requirements
- Industry-standard positive and negative testing approaches
- REST API testing best practices
- Test documentation standards

---

**Barangsiapa yang berangkat menimba ilmu untuk mengamalkan ilmu, niscaya ilmu yang sedikit pun akan bermanfaat baginya.**

---

**Ready to start testing? Open [TEST_SCRIPT.md](./TEST_SCRIPT.md) and begin with TC-LOGIN-001!**

---

*Happy Testing! 🧪✨*
