# Screenshot Evidence Guide

This directory contains test evidence screenshots for the Campus Event Hub testing process.

---

## Directory Structure

```
screenshots/
├── frontend/                  # UI/UX testing screenshots
│   ├── auth/                 # Authentication & Authorization
│   ├── users/                # User Management
│   ├── events/               # Event Management
│   ├── registration/         # Event Registration
│   ├── locations/            # Location Management
│   └── settings/             # Site Settings
└── backend/                   # API testing screenshots
    └── api-responses/        # API response screenshots from Postman/Thunder Client
```

---

## Screenshot Naming Convention

### Format
```
TC-[FEATURE]-[NUMBER]_[STEP]_[DESCRIPTION].png
```

### Examples

**Frontend Screenshots:**
```
TC-LOGIN-001_1_form-filled.png
TC-LOGIN-001_2_dashboard-success.png
TC-LOGIN-001_3_devtools-token.png
```

**Backend Screenshots:**
```
TC-API-LOGIN-001_1_request-body.png
TC-API-LOGIN-001_2_response-200.png
TC-API-LOGIN-001_3_response-data.png
```

**Error Screenshots:**
```
TC-LOGIN-002_1_wrong-password.png
TC-LOGIN-002_2_error-message.png
TC-LOGIN-002_3_network-401.png
```

---

## Screenshot Requirements

### What to Capture

#### ✅ For Positive Tests:
1. **Input State**: Form/request with valid test data
2. **Success Indicator**: Success message, status badge, or confirmation
3. **Result State**: Updated UI showing successful operation
4. **Data Verification**: Database query or list showing new/updated data

#### ❌ For Negative Tests:
1. **Invalid Input**: Form/request with invalid test data
2. **Error Message**: Clear error message displayed
3. **HTTP Status**: Network tab showing correct error status code (400, 401, 403, 404, 409)
4. **No Side Effects**: Verification that no unwanted changes occurred

### Frontend Screenshot Checklist

For each frontend test case, capture:

- [ ] **Browser URL** visible in address bar
- [ ] **User indicator** showing which role is logged in
- [ ] **Form state** with test data filled in
- [ ] **Validation messages** (if applicable)
- [ ] **Success/error notifications** clearly visible
- [ ] **Updated UI state** after action
- [ ] **Browser DevTools** (if needed):
  - Network tab showing API calls and status codes
  - Console tab showing any errors
  - Application → Local Storage showing tokens
  - Application → Cookies (if used)

### Backend Screenshot Checklist

For each API test case, capture:

- [ ] **Request URL** with method (GET, POST, PUT, DELETE)
- [ ] **Request Headers** including Authorization
- [ ] **Request Body** (for POST/PUT/PATCH)
- [ ] **Response Status Code** prominently displayed
- [ ] **Response Headers**
- [ ] **Response Body** with formatted JSON
- [ ] **Response Time** (if significant)

---

## Tools & Setup

### Recommended Screenshot Tools

**Windows:**
- Snipping Tool (Win + Shift + S)
- Greenshot (free, advanced features)

**macOS:**
- Screenshot (Cmd + Shift + 4)
- CleanShot X (paid, professional)

**Linux:**
- Flameshot
- GNOME Screenshot

**Browser Extensions:**
- Awesome Screenshot
- Fireshot
- Nimbus Screenshot

### API Testing Tools

**For Backend Screenshots:**
- Postman (full-featured)
- Thunder Client (VS Code extension)
- Insomnia
- REST Client (VS Code extension)

### Browser Setup for Frontend Testing

1. **Use Consistent Browser**: Stick to one browser (Chrome/Firefox/Edge) for all screenshots
2. **Zoom Level**: Set to 100% (Ctrl/Cmd + 0)
3. **Window Size**: Use consistent window size (e.g., 1920x1080)
4. **DevTools Position**: If capturing DevTools, dock to bottom or side consistently
5. **Hide Personal Data**: Ensure no personal data visible in screenshots

---

## Screenshot Quality Guidelines

### ✅ Good Screenshots:
- Clear and readable text
- Full context visible (URL, headers, navigation)
- Error messages clearly visible
- Status codes prominent
- Properly cropped (no excessive whitespace)
- Consistent formatting across tests
- File size < 5MB

### ❌ Poor Screenshots:
- Blurry or pixelated text
- Important information cut off
- Too much unnecessary content
- Personal/sensitive data visible
- Inconsistent window sizes
- Extremely large file sizes

---

## Example Screenshot Sequences

### Example 1: Login Positive Test (TC-LOGIN-001)

**Screenshot 1: Form Filled**
- Filename: `TC-LOGIN-001_1_form-filled.png`
- Shows: Login form with email and password filled in
- Visible: Browser URL, form fields with test data

**Screenshot 2: Dashboard After Login**
- Filename: `TC-LOGIN-001_2_dashboard-success.png`
- Shows: Dashboard page after successful login
- Visible: User name in header, welcome message, navigation menu

**Screenshot 3: DevTools Token**
- Filename: `TC-LOGIN-001_3_devtools-token.png`
- Shows: Browser DevTools → Application → Local Storage
- Visible: JWT token stored in localStorage

### Example 2: Login Negative Test (TC-LOGIN-002)

**Screenshot 1: Wrong Password**
- Filename: `TC-LOGIN-002_1_wrong-password.png`
- Shows: Login form with incorrect password
- Visible: Form filled with wrong credentials

**Screenshot 2: Error Message**
- Filename: `TC-LOGIN-002_2_error-message.png`
- Shows: Error message displayed
- Visible: Red error text saying "Invalid credentials"

**Screenshot 3: Network 401**
- Filename: `TC-LOGIN-002_3_network-401.png`
- Shows: Network tab in DevTools
- Visible: POST /auth/login request with 401 status code

### Example 3: API Test (TC-API-LOGIN-001)

**Screenshot 1: Request**
- Filename: `TC-API-LOGIN-001_1_request.png`
- Shows: Postman/Thunder Client request setup
- Visible: POST method, URL, headers, request body with test credentials

**Screenshot 2: Response**
- Filename: `TC-API-LOGIN-001_2_response.png`
- Shows: API response
- Visible: 200 status code, response body with user object and token

**Screenshot 3: Response Details**
- Filename: `TC-API-LOGIN-001_3_response-details.png`
- Shows: Detailed response view
- Visible: Response headers, formatted JSON, response time

---

## Organizing Screenshots During Testing

### Real-Time Organization

As you test, immediately:

1. **Take Screenshot** after each test step
2. **Rename Immediately** using naming convention
3. **Move to Correct Folder** (auth/, users/, events/, etc.)
4. **Update Test Script** with screenshot reference
5. **Mark Test Status** in TEST_SCRIPT.md

### Batch Organization

If taking many screenshots:

1. Create a temporary folder per test session
2. Take all screenshots with auto-generated names
3. After session, rename batch following convention
4. Move to appropriate folders
5. Update test script with actual results

---

## Screenshot Annotation (Optional)

For clarity, you may annotate screenshots to highlight:

- Error messages (red box/arrow)
- Success indicators (green box/arrow)
- Important fields (numbered circles)
- Status codes (highlighted)

**Tools for Annotation:**
- Greenshot (built-in editor)
- Snagit
- Paint.NET
- GIMP
- macOS Preview

**Keep it Simple:**
- Use red for errors
- Use green for success
- Use yellow for warnings
- Use numbered markers for sequences

---

## Submitting Test Evidence

### For Week 8-10 Submission

Include in your test report:

1. **TEST_SCRIPT.md** - Filled with actual results and status
2. **Screenshots Folder** - Organized with evidence
3. **TEST_DATA.md** - Reference data used
4. **Summary Document** - Test execution summary

### Folder to Submit

```
docs/
└── testing/
    ├── TEST_SCRIPT.md           ✅ Main test script with results
    ├── TEST_DATA.md             ✅ Test data reference
    ├── screenshots/             ✅ Evidence folder
    │   ├── frontend/
    │   │   ├── auth/            📸 10 screenshots
    │   │   ├── users/           📸 12 screenshots
    │   │   ├── events/          📸 18 screenshots
    │   │   ├── registration/    📸 10 screenshots
    │   │   ├── locations/       📸 8 screenshots
    │   │   └── settings/        📸 6 screenshots
    │   └── backend/
    │       └── api-responses/   📸 ~30 screenshots
    └── README.md                ✅ This file
```

**Estimated Total Screenshots**: 64 test cases × ~3 screenshots each = ~192 screenshots

---

## Tips for Efficient Screenshot Management

### 1. Use Keyboard Shortcuts
- Master your OS screenshot shortcuts
- Use API client shortcuts (Postman: Ctrl+S to save)

### 2. Template Naming
Create a text file with naming templates:
```
TC-LOGIN-001_1_
TC-LOGIN-001_2_
TC-LOGIN-001_3_
TC-LOGIN-002_1_
...
```
Copy-paste when renaming.

### 3. Automated Tools
Consider scripting screenshot capture:
- Selenium for frontend (advanced)
- Newman for Postman collections (CLI)
- Playwright for E2E testing

### 4. Review Before Closing
Before ending a test session:
- ✅ All screenshots captured
- ✅ All files properly named
- ✅ All in correct folders
- ✅ Test script updated
- ✅ No sensitive data visible

---

## Common Mistakes to Avoid

### ❌ Don't:
- Take screenshots with personal data visible
- Use inconsistent naming
- Capture screenshots at different zoom levels
- Include unnecessary chrome/toolbars
- Take blurry or unclear screenshots
- Forget to show status codes for API tests
- Mix test data between screenshots
- Take screenshots of wrong environment (prod instead of test)

### ✅ Do:
- Use consistent test data (from TEST_DATA.md)
- Ensure test environment is clear (dev/test URL)
- Show complete context (URL, user, status)
- Capture error messages in full
- Verify no personal information visible
- Keep consistent window/tool layout
- Document any anomalies in test script

---

## Privacy & Security

### Before Taking Screenshots:

1. **Remove Personal Data**: Clear browser autofill, logout personal accounts
2. **Use Test Data Only**: All data from TEST_DATA.md
3. **Check Environment**: Ensure using test environment, not production
4. **Review Before Saving**: Quick scan for sensitive information
5. **Sanitize Tokens**: If showing full JWT, ensure it's expired/test-only

### What to Redact (if necessary):

- Real email addresses (use test emails only)
- Real phone numbers
- Real addresses
- Personal identifiable information (PII)
- Production database data
- Active security tokens (if accidentally captured)

---

## Questions?

If you have questions about:
- What to screenshot
- How to capture something specific
- Naming conventions
- Organization

Refer to TEST_SCRIPT.md for specific screenshot instructions per test case.

---

**Last Updated:** 2025-11-06
**Version:** 1.0.0

---

*Happy Testing! 🧪📸*
