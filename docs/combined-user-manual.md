# Campus Event Hub - User Manual

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [For All Users](#for-all-users)
3. [For Event Creators](#for-event-creators)
4. [For Approvers](#for-approvers)
5. [For Administrators](#for-administrators)
6. [For Superadministrators](#for-superadministrators)
7. [Troubleshooting](#troubleshooting)

---

# Getting Started

### Logging In

**What it does:**
Allows you to access the Campus Event Hub platform with your credentials.

**Who can use it:**
All registered users (User, Approver, Admin, Superadmin)

**Step-by-step guide:**
1. Navigate to the login page
2. Enter your email address in the "Email" field
3. Enter your password in the "Password" field
4. Click the "Login" button
5. You will be redirected to the dashboard/home page

**What you'll see:**
- Upon successful login, you'll be redirected to the dashboard
- Your name will appear in the header navigation
- A JWT authentication token will be stored in your browser's local storage

**Screenshots:**

![Login Form](/docs/user-manual/getting-started/images/login-1.png)
*Figure 1: Login form with email and password fields*

![Dashboard After Login](/docs/user-manual/getting-started/images/login-2.png)

*Figure 2: Dashboard showing successful login with user name displayed*

![Token Storage](/docs/user-manual/getting-started/images/login-3.png)

*Figure 3: Browser DevTools showing JWT token in Local Storage*

**Tips:**
- Make sure you use the correct email format (e.g., user@campus-event-hub.local)
- Passwords are case-sensitive
- If you forget your password, contact your administrator

---

## For All Users


---

### Forgot Password

**What it does:** Allows you to reset your password if you've forgotten it by receiving a password reset link via email.

**Who can use it:** Anyone with a registered account on Campus Event Hub.

**Step-by-step guide:**

1. **Navigate to the Forgot Password page**
   - Go to the login page
   - Click on "Forgot Password?" link below the login button

2. **Enter your email address**
   - Type your registered email in the **Email** field (e.g., your.email@example.com)
   - Make sure the email format is correct

3. **Submit the form**
   - Click the **Send Reset Link** button
   - The button will show "Sending..." while processing

**What you'll see:**
- A success message: "If this email exists in our system, a password reset link has been sent."
- You'll be automatically redirected to the login page
- Check your email inbox for the reset link

![Forgot Password page with email field highlighted](/docs/user-manual/getting-started/images/forgot-password-1.png)

![Success message displayed after submission](/docs/user-manual/getting-started/images/forgot-password-2.png)

**Tips:**
✓ Check your spam/junk folder if you don't see the email within a few minutes
✓ The success message appears for both existing and non-existing emails for security reasons
✓ Make sure you enter the exact email address you used when registering
✗ Don't refresh the page while the form is submitting

**Common Errors:**

**"Please enter a valid email address"**
- **Cause:** The email format is incorrect (missing @ symbol, no domain, etc.)
- **Solution:** Check your email format and ensure it follows the pattern: name@domain.com

**"Email is required"**
- **Cause:** You submitted the form without entering an email address
- **Solution:** Enter your email address in the Email field before clicking Send Reset Link

**Important Security Note:**
The system will always show a success message regardless of whether the email exists in our database. This prevents malicious users from discovering which email addresses are registered in the system.

---

### Reset Password

**What it does:** Allows you to set a new password after requesting a password reset via the Forgot Password feature.

**Who can use it:** Anyone who has received a password reset link via email.

**Prerequisites:** You must have requested a password reset from the Forgot Password page and received the reset link in your email.

**Step-by-step guide:**

1. **Open the reset link from your email**
   - Check your email inbox for the password reset email
   - Click on the reset link in the email
   - The link will take you to the Reset Password page

2. **Enter your new password**
   - Type your new password in the **New Password** field
   - Password must be at least 8 characters long
   - Use a strong password with a mix of letters, numbers, and symbols

3. **Confirm your new password**
   - Re-enter the same password in the **Confirm Password** field
   - Make sure both passwords match exactly

4. **Submit the form**
   - Click the **Reset Password** button
   - The button will show "Resetting..." while processing

**What you'll see:**
- A success message confirming your password has been reset
- You'll be redirected to the login page
- You can now login with your new password
- The old password will no longer work

![Reset Password page with password fields](/docs/user-manual/getting-started/images/reset-password-1.png)

![Success message after password reset](/docs/user-manual/getting-started/images/reset-password-2.png)

**Tips:**
✓ Use a strong password with at least 8 characters
✓ Include a mix of uppercase, lowercase, numbers, and special characters
✓ Don't reuse passwords from other websites
✓ Reset links are valid for 24 hours only
✗ Don't share your password reset link with anyone
✗ Don't use simple passwords like "password123"

**Common Errors:**

**"Password must be at least 8 characters long"**
- **Cause:** Your new password is too short (less than 8 characters)
- **Solution:** Create a password with at least 8 characters

**"Passwords do not match"**
- **Cause:** The password in the New Password field doesn't match the Confirm Password field
- **Solution:** Make sure you type exactly the same password in both fields

**"Invalid reset link. No token found."** or **"Failed to reset password. The link may be invalid or expired."**
- **Cause:** The reset link is invalid, expired (older than 24 hours), or has already been used
- **Solution:** Request a new password reset from the Forgot Password page

**Important Password Requirements:**
- Minimum 8 characters
- Both New Password and Confirm Password must match exactly
- Reset links expire after 24 hours
- Each reset link can only be used once

---

### Using Pagination

**What it does:** Helps you navigate through large lists of items (events, users, etc.) by splitting them into multiple pages.

**Who can use it:** All users viewing paginated lists (Events page, Users page, etc.).

**Where you'll find it:** At the bottom of any page displaying a list of items (events, users, registrations, etc.).

**Step-by-step guide:**

**Navigating Between Pages:**

1. **Click Next or Previous buttons**
   - Click **Next** to move to the next page
   - Click **Previous** to go back to the previous page
   - Previous button is disabled on page 1
   - Next button is disabled on the last page

2. **Jump to a specific page**
   - Click on any page number to jump directly to that page
   - The current page is highlighted in blue

**Changing Items Per Page:**

1. **Adjust the number of items displayed**
   - Locate the "Show [number] per page" dropdown at the bottom left
   - Click on the dropdown
   - Select from options: 10, 20, 50, or 100 items per page
   - The page will reload showing the selected number of items

**What you'll see:**
- Page information: "Showing 1-10 of 45 results" (example)
- Current page highlighted with blue background
- Disabled Previous/Next buttons shown in gray when not available
- Page numbers with "..." ellipsis if there are many pages
- URL updates to reflect current page (e.g., ?page=2)

![Pagination controls at bottom of list](/docs/user-manual/getting-started/images/using-pagination-1.jpeg)

![Items per page dropdown menu](/docs/user-manual/getting-started/images/using-pagination-2.png)

![Page indicator showing current results range](/docs/user-manual/getting-started/images/using-pagination-3.png)

**Tips:**
✓ Use higher items per page (50 or 100) if you want to see more results at once
✓ Use lower items per page (10 or 20) for faster page loading
✓ Use specific page numbers to jump quickly to a known page
✓ The page information shows exactly which items you're viewing
✗ Don't click disabled Previous/Next buttons (they won't work)

**Pagination Behavior:**

**When you change items per page:**
- You'll automatically return to page 1
- The total number of pages will adjust accordingly
- Your selection is saved during your session

**Page display logic:**
- If there are 7 or fewer pages, all pages are shown
- If there are more than 7 pages:
  - First page is always shown
  - Last page is always shown
  - Current page and neighboring pages are shown
  - "..." indicates skipped pages

**Example:**
- **Few pages:** 1 2 3 4 5 (all shown)
- **Many pages:** 1 ... 5 6 7 ... 20 (current page is 6)

---


# For All Users

---

### Viewing Your Profile

**What it does:**
Displays your account information and allows you to update your personal details.

**Who can use it:**
All authenticated users

**Step-by-step guide:**
1. After logging in, click on the three horizontal lines on top left to open the menu
2. Select "Profile" from the dropdown menu
3. View your current profile information

**Screenshots:**

![Name on header](/docs/user-manual/users/images/viewing-profile-1.png)
*Figure 1: Three horizontal lines menu*

![Select Profile](/docs/user-manual/users/images/viewing-profile-2.png)
*Figure 2: Click profile from the dropdown menu*

![View Profile Info](/docs/user-manual/users/images/viewing-profile-3.png)
*Figure 3: Profile information display*
---

### Updating Your Profile

**What it does:**
Allows you to change your name and password.

**Who can use it:**
All authenticated users

**Step-by-step guide:**
1. Navigate to your profile page
2. Click the "Edit Profile" button
3. Update your name in the "Name" field
4. (Optional) Enter a new password if you want to change it
5. Click "Save Changes"

**What you'll see:**
- A success notification will appear briefly
- Your updated name will be displayed in the header
- Changes will persist after page refresh

**Screenshots:**

![Profile Edit Form](/docs/user-manual/users/images/updating-profile-1.png)
*Figure 1: Profile edit form with name field*

![Success Notification](/docs/user-manual/users/images/updating-profile-2.png)
*Figure 2: Brief success notification after update*

![Updated Header](/docs/user-manual/users/images/updating-profile-3.png)
*Figure 3-4: Header showing updated name after profile changes*

**Tips:**
- If changing your password, make sure it's at least 8 characters long
- Your new name will be visible to other users on events you create or register for


---

### Registering for Events

**What it does:**
Allows you to register for published events that interest you.

**Who can use it:**
All authenticated users

**Step-by-step guide:**
1. Browse the published events list on the home page or events page
2. Click on an event to view its details
3. Review the event information (date, time, location, description)
4. Click the "Register" button
5. The button will change to "Leave" indicating successful registration

**What you'll see:**
- The "Register" button changes to "Leave"
- Your name appears in the attendees list
- The registration count increases by one
- You can now view this event in your "My Registrations" page

**Screenshots:**

![Event Detail with Register Button](/docs/user-manual/users/images/registering-events-1.png)
*Figure 1: Event detail page showing Register button*

![After Registration](/docs/user-manual/users/images/registering-events-2.png)
*Figure 2: Button changed to "Leave" and updated registration count*

![Attendees List](/docs/user-manual/users/images/registering-events-3.png)
*Figure 3: Your name appearing in the attendees list*

**Tips:**
- You can only register if the event is published and within the registration period
- Check the available slots before registering
- If the event is full, you may be added to a waitlist


---

### Unregistering from Events

**What it does:**
Allows you to cancel your registration for an event you previously registered for.

**Who can use it:**
Users who are registered for an event

**Step-by-step guide:**
1. Navigate to the event detail page
2. Click the "Leave" button
3. The button will change back to "Register"
4. You will be removed from the attendees list

**What you'll see:**
- The "Leave" button changes back to "Register"
- Your name is removed from the attendees list
- The registration count decreases by one

**Screenshots:**

![Leave Button](/docs/user-manual/users/images/unregistering-events-1.png)
*Figure 1: Event detail showing "Leave" button for registered users*

![After Unregistration](/docs/user-manual/users/images/unregistering-events-2.png)
*Figure 2: Button changed back to "Register" with decreased count*

![Updated Attendees List](/docs/user-manual/users/images/unregistering-events-3.png)
*Figure 3: Your name removed from attendees list*

**Tips:**
- You can re-register for the event if you change your mind (as long as slots are available)
- Unregistering frees up a slot for other users

---

## For Event Creators

Event creators are users who can create, manage, and publish campus events.


---

### Exporting Events List to CSV

**What it does:** Exports a list of all published events to a CSV file that can be opened in Excel or Google Sheets.

**Who can use it:** All authenticated users (students, faculty, staff, administrators).

**Where to find it:** On the main Events page, look for the "📥 Export to CSV" button (green button).

**Step-by-step guide:**

1. **Navigate to the Events page**
   - Click on "Events" in the main navigation
   - You'll see the list of all published events

2. **Locate the Export button**
   - Look for the **📥 Export to CSV** button (green background)
   - It appears at the top of the events list
   - Only visible when you're logged in

3. **Export the events**
   - Click the **📥 Export to CSV** button
   - The CSV file will automatically download to your device
   - The filename is: `events.csv`

4. **Open the CSV file**
   - Find the downloaded file in your Downloads folder
   - Open with Excel, Google Sheets, or any spreadsheet application
   - The file contains all published events with their details

**What you'll see:**
- CSV file with event data
- Columns include: ID, Title, Event Date, Event Time, Location, Status, Creator
- File automatically downloaded to your default downloads folder
- All published events from the system

![Export to CSV button on Events page and downloaded .csv file](/docs/user-manual/users/images/exporting-events-1,2.png)

![CSV file opened in Excel showing events list](/docs/user-manual/users/images/exporting-events-3.png)

**CSV File Contents:**
- **ID:** Event ID number
- **Title:** Event name/title
- **Event Date:** Date of the event
- **Event Time:** Time of the event
- **Location:** Venue/location name
- **Status:** Event status (published, cancelled, etc.)
- **Creator:** Name of person who created the event

**Example Use Cases:**

**For students:**
- Export to see all upcoming events at a glance
- Plan your semester event attendance
- Share with classmates via spreadsheet

**For administrators:**
- Generate reports on campus events
- Analyze event trends and statistics
- Archive event records

**For event organizers:**
- Check competition (other events on same dates)
- Reference past events for planning
- Export for presentation purposes

**Tips:**
✓ Export regularly to keep a local backup of events
✓ Use Excel/Sheets filtering to find specific events
✓ Sort by date to see upcoming vs past events
✓ Use for offline reference when internet isn't available
✓ Share filtered lists with specific groups
✗ Don't try to export when not logged in (button won't appear)

**Common Scenarios:**

**Logged in user:**
- See Export to CSV button
- Click to download events.csv
- All published events included

**Guest user (not logged in):**
- Export to CSV button is NOT visible
- Feature requires authentication
- Log in first to access export functionality

**Empty events list:**
- Export button may still be visible
- CSV might be empty or contain only headers
- Indicates no published events in the system

**Important Notes:**
- Only published events are included in the export
- Draft, cancelled, or pending approval events are not exported
- The export includes all events visible on the Events page
- The feature requires you to be logged in
- CSV format is compatible with all major spreadsheet applications

---


# For Event Creators

---

### Creating a New Event

**What it does:**
Allows you to create a new event that can be submitted for approval or published (depending on your role).

**Who can use it:**
All authenticated users (User, Approver, Admin, Superadmin)

**Step-by-step guide:**
1. Click "Create Event" in the navigation menu
2. Fill in the event details:
   - **Title**: Enter a descriptive event name
   - **Description**: Provide detailed information about the event
   - **Event Date**: Select the date when the event will take place (YYYY-MM-DD format)
   - **Event Time**: Choose the start time (HH:MM format)
   - **Registration Start Date & Time**: When registration opens
   - **Registration End Date & Time**: When registration closes
   - **Location**: Select from available locations
   - **Max Attendees**: Set the maximum number of participants (e.g., 100)
3. Click "Create Event" button
4. The event will be created with "Draft" status

**What you'll see:**
- A success message confirming event creation
- The event appears in your "My Events" list with "Draft" status
- You can view the event detail page
- All your entered data is saved correctly

**Screenshots:**

![Create Event Form](/docs/user-manual/event-creators/images/creating-event-1.png)

*Figure 1: Create event form with all required fields filled*

![Event in My Events](/docs/user-manual/event-creators/images/creating-event-2.png)

*Figure 2: Newly created event showing in "My Events" with Draft status*

![Event Detail Page](/docs/user-manual/event-creators/images/creating-event-3.png)

*Figure 3: Event detail page showing all saved information*

**Tips:**
- Make sure registration end date is before the event date
- Registration start date must be before registration end date
- The date picker automatically uses the correct format (YYYY-MM-DD)
- Choose an appropriate max attendees number based on location capacity

**Important Date Validation:**
- ❌ Registration end date cannot be after event date
- ❌ Registration start date cannot be after registration end date
- ✅ Use the date picker to ensure correct format


---

### Editing Your Draft Event

**What it does:**
Allows you to modify event details before submitting for approval.

**Who can use it:**
Event creators (for their own draft events)

**Step-by-step guide:**
1. Navigate to "My Events"
2. Select your draft event
3. Click the "Edit Event" button
4. Modify any fields you want to change (e.g., title, description, dates)
5. Click "Save Changes"

**What you'll see:**
- A success message confirming the update
- Updated event details displayed immediately
- Event status remains "Draft"
- The updated timestamp changes

**Screenshots:**

![Edit Event Form](/docs/user-manual/event-creators/images/editing-event-1.png)

*Figure 1: Edit form showing current event data with modified title*

![Success and Updated Details](/docs/user-manual/event-creators/images/editing-event-2.png)

*Figure 2: Success message and event detail showing updated information*

**Tips:**
- You can only edit draft events or events returned for revision
- You cannot edit published or pending approval events
- Make sure to save your changes before leaving the page


---

### Submitting an Event for Approval

**What it does:**
Submits your draft event to approvers for review and approval before it can be published.

**Who can use it:**
Users with "User" role

**Step-by-step guide:**
1. Go to "My Events" and select your draft event
2. On the event detail page, click "Submit for Approval" button
3. The event status will change from "Draft" to "Pending Approval"
4. Wait for an approver to review your event

**What you'll see:**
- A success message: "Event submitted for approval"
- The "Submit for Approval" button is no longer visible
- Event status changes to "Pending Approval"
- The event now appears in the approver's pending list

**Screenshots:**

![Draft Event Detail](/docs/user-manual/event-creators/images/submitting-event-1.png)

*Figure 1: Draft event detail page with "Submit for Approval" button*

![Success Message](/docs/user-manual/event-creators/images/submitting-event-2.png)

*Figure 2-4: Success message and updated status showing "Pending Approval"*

![Approver's Queue](/docs/user-manual/event-creators/images/submitting-event-3.png)

*Figure 5: Event appearing in approver's pending approval list*

**Tips:**
- Review all event details before submitting
- Once submitted, you cannot edit the event until it's returned for revision
- Approvers may request revisions if details need to be updated


---

### Managing Event Capacity

**What it does:** Allows you to set the maximum number of attendees for your event based on the venue's capacity.

**Who can use it:** Event creators when creating or editing events.

**Where to find it:** In the Create Event form under the location selection, in the **Maximum Attendees** field.

**Step-by-step guide:**

1. **Select an event location first**
   - In the Create Event form, choose a location from the **Location** dropdown
   - The system will display the location's maximum capacity

2. **Set the maximum attendees**
   - Find the **Maximum Attendees** field
   - Below the field, you'll see "Location capacity: [X] attendees"
   - Enter the maximum number of people who can attend your event

3. **Follow capacity guidelines**
   - The number you enter must be less than or equal to the location's capacity
   - Leave empty for unlimited attendees (up to location capacity)
   - The system will validate your input automatically

4. **View validation feedback**
   - If you enter a number within capacity: no error, can proceed
   - If you exceed capacity: red error message appears
   - The input field will have a red border if there's an error

**What you'll see:**
- Maximum Attendees input field
- Capacity hint below: "Location capacity: [X] attendees"
- Real-time validation as you type
- Error message in red if capacity exceeded
- Input field dynamically limited to location maximum

![Maximum Attendees field with capacity hint](/docs/user-manual/event-creators/images/managing-capacity-1.png)

![Validation error when exceeding capacity](/docs/user-manual/event-creators/images/managing-capacity-2.png)

![Success state with valid capacity](/docs/user-manual/event-creators/images/managing-capacity-3.png)

**Example Scenarios:**

**Scenario 1: Within Capacity**
- Location: Main Hall (capacity: 200)
- You enter: 150 attendees
- Result: ✓ Valid, event can be created

**Scenario 2: Exceeding Capacity**
- Location: Small Room (capacity: 50)
- You enter: 100 attendees
- Result: ✗ Error "Maximum attendees cannot exceed location capacity"

**Scenario 3: Exact Capacity**
- Location: Conference Room (capacity: 100)
- You enter: 100 attendees
- Result: ✓ Valid, using full capacity

**Tips:**
✓ Check the location capacity hint before entering a number
✓ Consider leaving some buffer space for comfort
✓ Set capacity based on expected attendance, not just maximum
✓ Leave the field empty if you want unlimited registration (up to venue max)
✓ Update capacity if you change to a different location
✗ Don't exceed the location's maximum capacity
✗ Don't enter 0 or negative numbers (minimum is 1)

**Common Errors:**

**"Maximum attendees cannot exceed location capacity"**
- **Cause:** The number you entered is greater than the selected location's capacity
- **Solution:** Enter a number equal to or less than the location capacity shown in the hint

**"Maximum attendees cannot exceed location capacity (X)"**
- **Cause:** Specific validation showing the exact capacity limit
- **Solution:** Reduce your maximum attendees to X or less

**"Maximum attendees must be at least 1"**
- **Cause:** You entered 0 or a negative number
- **Solution:** Enter a positive number (1 or greater)

**Important Capacity Rules:**
- Maximum attendees must not exceed the location's capacity
- Minimum value is 1 (if specified)
- Capacity validation happens in real-time as you type
- The hint always shows your selected location's maximum capacity
- If you change location, make sure to update max attendees accordingly
- Empty field = unlimited registration up to location capacity

---

### Uploading Event Attachments

**What it does:** Allows you to upload files (documents, images, presentations) to your event that attendees can download.

**Who can use it:** Event creators when creating or editing events.

**Where to find it:** In the Create Event form under the "Event Attachments" section.

**Step-by-step guide:**

1. **Navigate to Create Event**
   - Go to the Events page
   - Click the **Create Event** button (blue button with ➕ icon)

2. **Scroll to the Event Attachments section**
   - Fill in the required event details (title, date, location, etc.)
   - Find the **Event Attachments *** section

3. **Upload your files**
   - Click the file upload area or drag and drop files
   - Select one or more files from your device
   - You can upload multiple files at once

4. **Review uploaded files**
   - Check the "Selected files (X):" section
   - Each file shows its name and size
   - Click **Remove** next to any file to delete it
   - You must have at least one file before submitting

5. **Submit the event**
   - Ensure at least one file is uploaded
   - Complete other required fields
   - Click **Create Event** button

**What you'll see:**
- File upload section with accepted formats listed
- File counter showing "Selected files (X):"
- Each uploaded file displayed with name, size, and Remove button
- File sizes shown in B, KB, or MB format
- Validation error in red if requirements aren't met

![Event Attachments section in create event form](/docs/user-manual/event-creators/images/uploading-attachments-1.png)

![Selected files list with remove buttons](/docs/user-manual/event-creators/images/uploading-attachments-2.png)

![Validation error for missing attachments](/docs/user-manual/event-creators/images/uploading-attachments-3.png)

**Accepted File Formats:**
- Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT
- Images: JPG, PNG, GIF, WEBP

**File Size Limits:**
- Maximum file size: 10MB per file
- You can upload multiple files as long as each is under 10MB

**Tips:**
✓ Upload clear, high-quality files that are relevant to your event
✓ Include event schedules, maps, or presentation slides
✓ Compress large files if they exceed the 10MB limit
✓ Use descriptive file names so attendees know what they're downloading
✓ Check all files before submitting to ensure they're the correct versions
✗ Don't upload files larger than 10MB (they'll be rejected)
✗ Don't submit the event without any attachments (it's required)

**Common Errors:**

**"At least one attachment is required"**
- **Cause:** You tried to submit the event without uploading any files
- **Solution:** Upload at least one file before clicking Create Event

**"Some files exceed 10MB limit: [filename]"**
- **Cause:** One or more of your files are larger than 10MB
- **Solution:**
  - Compress the large file(s) to reduce size
  - Use online compression tools for PDFs or images
  - Remove the file and upload a smaller version

**Important Requirements:**
- At least one file is mandatory
- Each file must be under 10MB
- Only supported file formats are accepted
- Total number of files is not limited, but each must meet size requirements

---

### Canceling a Published Event

**What it does:**
Marks a published event as cancelled while preserving registration data.

**Who can use it:**
Event creators (for their own published events)

**Step-by-step guide:**
1. Navigate to your published event
2. Click the "Cancel Event" button
3. Confirm the cancellation
4. The event status changes to "Cancelled"

**What you'll see:**
- Event status changes to "Cancelled"
- The event is still visible but marked as cancelled
- All registration data is preserved
- New registrations are not allowed
- Registered attendees receive cancellation email notifications

**Screenshots:**

![Cancel Confirmation](/docs/user-manual/event-creators/images/canceling-event-1.png)
*Figure 1: Confirmation dialog for canceling the event*

![Cancelled Event Display](/docs/user-manual/event-creators/images/canceling-event-2.png)
*Figure 2-3: Event showing "Cancelled" status and badge*

![Registration Disabled](/docs/user-manual/event-creators/images/canceling-event-3.png)
*Figure 4: Registration button disabled for cancelled event*

**Tips:**
- Cancelled events remain visible in the system for historical records
- Registered users will be notified via email about the cancellation
- You cannot un-cancel an event once it's cancelled

---

## For Approvers

Approvers are responsible for reviewing and approving events submitted by users.


---

### Sending Messages to Event Attendees

**What it does:** Allows event creators to send email messages and updates to all registered attendees of their event.

**Who can use it:** Only the event creator or administrators for events they manage.

**Where to find it:** On your event's details page, accessible only if you are the event creator.

**Step-by-step guide:**

1. **Navigate to your event**
   - Go to the Events page or My Events
   - Click on one of your created events
   - Look for the message form on the event details page

2. **Access the message form**
   - Scroll to the "Send Message to Attendees" section
   - You'll see the instruction: "Send a message to all registered attendees. They will receive an email notification."
   - Non-creators will not see this form

3. **Compose your message**
   - **Subject field:** Enter a clear subject (maximum 200 characters)
   - Character counter shows "X/200" as you type
   - **Message field:** Write your message content (maximum 2000 characters)
   - Character counter shows "X/2000" as you type

4. **Review your message**
   - Check the subject and message for typos
   - Ensure the content is appropriate and informative
   - The Send Message button is disabled until both fields are filled

5. **Send the message**
   - Click the **Send Message** button
   - The button changes to "Sending..." while processing
   - Wait for the success confirmation

**What you'll see:**
- Success notification: "Message sent successfully to [X] attendee(s)!"
- The form clears automatically after 5 seconds
- Character counters reset to 0
- All registered attendees receive an email with your message

![Send Message to Attendees form](/docs/user-manual/event-creators/images/sending-messages-1.png)

![Success notification with recipient count](/docs/user-manual/event-creators/images/sending-messages-2.png)

**Field Requirements:**

**Subject:**
- Required field (marked with *)
- Maximum 200 characters
- Real-time character counter
- Cannot be empty

**Message:**
- Required field (marked with *)
- Maximum 2000 characters
- Real-time character counter
- Cannot be empty

**Tips:**
✓ Write clear, concise subject lines
✓ Include important updates like time changes, location updates, or reminders
✓ Proofread before sending (you cannot unsend messages)
✓ Keep messages professional and relevant to the event
✓ Use the character counter to ensure you don't exceed limits
✓ Send test messages to yourself first if unsure about content
✗ Don't spam attendees with unnecessary messages
✗ Don't exceed the character limits (form won't submit)
✗ Don't send messages if you're not the event creator (form won't be visible)

**Common Errors:**

**"Subject is required"**
- **Cause:** You tried to send a message without entering a subject
- **Solution:** Enter a subject before clicking Send Message

**"Message is required"**
- **Cause:** You tried to send a message without entering message content
- **Solution:** Enter message text before clicking Send Message

**"Subject must be 200 characters or less"**
- **Cause:** Your subject exceeds the 200 character limit
- **Solution:** Shorten your subject to 200 characters or fewer (check the counter)

**"Message must be 2000 characters or less"**
- **Cause:** Your message exceeds the 2000 character limit
- **Solution:** Shorten your message to 2000 characters or fewer (check the counter)

**Send Message button not visible:**
- **Cause:** You are not the event creator
- **Solution:** Only event creators can send messages to attendees. You can only send messages for events you created.

**Important Notes:**
- Only registered attendees (not waitlisted) receive the email
- Messages are sent immediately and cannot be recalled
- The success notification shows how many attendees received the message
- Attendees receive the email at their registered email address
- The form clears after successful sending (after 5 seconds)

---

### Exporting Attendees to CSV

**What it does:** Exports a list of all registered attendees for your event as a downloadable CSV file that can be opened in Excel or Google Sheets.

**Who can use it:** Only the event creator (the person who created the event).

**Where to find it:** On your event's details page, look for the "📥 Export Attendees" button (teal background).

**Step-by-step guide:**

1. **Navigate to your event**
   - Go to the Events page or My Events
   - Click on one of your created events to view details

2. **Locate the Export button**
   - Scroll to find the **📥 Export Attendees** button
   - The button has a teal background and download icon
   - Only visible if you are the event creator

3. **Export attendees**
   - Click the **📥 Export Attendees** button
   - The CSV file will automatically download to your device
   - The filename format is: `{event-title}_attendees.csv`

4. **Open the CSV file**
   - Locate the downloaded file in your Downloads folder
   - Open with Excel, Google Sheets, or any spreadsheet application
   - The file contains attendee information in columns

**What you'll see:**
- CSV file with attendee data
- Columns include: name, email, registration status, registration date
- File automatically downloaded to your default downloads folder
- Filename uses your event title (non-alphanumeric characters replaced with underscores)

![Export Attendees button on event details page](/docs/user-manual/event-creators/images/export-attendees.png)

**CSV File Contents:**
- **Name:** Attendee's full name
- **Email:** Attendee's email address
- **Status:** Registration status (registered/waitlisted)
- **Registration Date:** When they registered for the event

**Example Scenarios:**

**Event with attendees:**
- Click Export Attendees button
- CSV file downloads with all attendee information
- File named: "Campus_Workshop_2024_attendees.csv"

**Event with no attendees:**
- Click Export Attendees button
- You may receive:
  - An empty CSV with headers only, or
  - A message indicating no attendees to export

**Non-creator viewing event:**
- Export Attendees button is NOT visible
- Only the event creator can export attendee lists

**Tips:**
✓ Export attendee lists for record-keeping or check-in purposes
✓ Use the CSV for email campaigns or follow-ups
✓ Open in Excel/Sheets for easy sorting and filtering
✓ Export before the event for check-in lists
✓ Keep attendee data secure and respect privacy
✗ Don't share the exported file publicly (contains personal information)
✗ Don't export if you're not the event creator (button won't be visible)

**Common Errors:**

**"Failed to export attendees. Please try again."**
- **Cause:** Server error or network issue during export
- **Solution:**
  - Check your internet connection
  - Refresh the page and try again
  - Contact support if the issue persists

**Export button not visible:**
- **Cause:** You are not the event creator
- **Solution:** Only event creators can export attendee lists. This is a security feature to protect attendee privacy.

**Empty CSV file:**
- **Cause:** The event has no registered attendees yet
- **Result:** Either an empty CSV with headers, or a notification message
- **Note:** This is normal behavior for events with no attendees

**Important Privacy Notes:**
- The exported file contains personal information (names and emails)
- Handle attendee data responsibly and in compliance with privacy policies
- Use exported data only for event-related purposes
- Delete exported files after they're no longer needed
- Do not share attendee information with unauthorized third parties

---

### Deleting Your Draft Event

**What it does:**
Permanently removes a draft event from the system.

**Who can use it:**
Event creators (for their own draft events only)

**Step-by-step guide:**
1. Go to "My Events" and select your draft event
2. Click the "Delete Event" button
3. Confirm the deletion in the dialog that appears
4. The event will be permanently removed

**What you'll see:**
- A confirmation dialog asking if you're sure you want to delete
- The event is removed from your "My Events" list
- The event no longer exists in the database

**Screenshots:**

![Delete Confirmation Dialog](/docs/user-manual/event-creators/images/deleting-event-1.png)
*Figure 1: Confirmation dialog before deleting the event*

![Event Removed from List](/docs/user-manual/event-creators/images/deleting-event-2.png)
*Figure 2: "My Events" page showing the event has been removed*

![Database Confirmation](/docs/user-manual/event-creators/images/deleting-event-3.png)
*Figure 3: Database query showing the event has been deleted*

**Tips:**
- You can only delete events with "Draft" status
- Deletion is permanent and cannot be undone
- If the event has been submitted for approval, you cannot delete it


---


# For Approvers

---

### Approving an Event

**What it does:**
Reviews and approves a pending event, making it visible to all users for registration.

**Who can use it:**
Users with "Approver" role or higher

**Step-by-step guide:**
1. Navigate to "Pending Approvals" section
2. Review the list of events awaiting approval
3. Click on an event to view its details
4. Review all event information carefully
5. Click the "Approve" button
6. The event status changes to "Published"

**What you'll see:**
- A success notification confirming the approval
- Event status changes from "Pending Approval" to "Published"
- The event appears on the public events page for all users
- The approval is recorded in the event's approval history
- The event creator may receive a notification (if enabled)

**Screenshots:**

![Pending Approvals List](/docs/user-manual/approvers/images/approving-event-1.png)
*Figure 1: List of events pending approval*

![Event Detail with Approve Button](/docs/user-manual/approvers/images/approving-event-2.png)

*Figure 2: Event detail page showing "Approve" button*

![Success Notification](/docs/user-manual/approvers/images/approving-event-3.png)

*Figure 3: Success notification after approval*

![Published Status](/docs/user-manual/approvers/images/approving-event-4.png)

*Figure 4: Event now showing "Published" status*

![Public Events Page](/docs/user-manual/approvers/images/approving-event-5.png)

*Figure 5: Approved event appearing on public events page*

**Tips:**
- Carefully review all event details before approving
- Check that dates, times, and location are correct
- Verify that the max attendees number is appropriate
- Approved events become immediately visible to all users


---

### Requesting Event Revision

**What it does:**
Returns an event to the creator with comments requesting changes or additional information.

**Who can use it:**
Users with "Approver" role or higher

**Step-by-step guide:**
1. Navigate to "Pending Approvals"
2. Click on an event that needs revision
3. Click the "Request Revision" button
4. Enter your comments explaining what needs to be changed or added (e.g., "Please add more details to description")
5. Click "Submit"

**What you'll see:**
- Event status changes to "Revision Requested"
- Your comments are saved and visible to the event creator
- The creator can now edit the event and resubmit
- The action is logged in the event's approval history

**Screenshots:**

![Request Revision Form](/docs/user-manual/approvers/images/requesting-revision-1.png)

*Figure 1: Request revision form with comment field*

![Updated Status and Comments](/docs/user-manual/approvers/images/requesting-revision-2.png)

*Figure 2-4: Event status updated and comments visible to creator*

**Tips:**
- Be specific in your revision comments to help the creator understand what needs to change
- Creators can view your comments when they edit their event
- After revisions are made, the event will be resubmitted for your review


---

### Publishing an Event Directly

**What it does:**
Allows approvers to create and publish events immediately without going through the approval workflow.

**Who can use it:**
Users with "Approver" role or higher

**Step-by-step guide:**
1. Create a new event (see "Creating a New Event" section)
2. Fill in all event details
3. Instead of leaving it as "Draft", click "Publish" button
4. The event is published immediately without needing approval

**What you'll see:**
- Event is created with "Published" status immediately
- The event appears on the public events page right away
- No approval workflow is needed
- Users can register for the event immediately

**Screenshots:**

![Create Event Form with Publish Option](/docs/user-manual/approvers/images/publishing-directly-1.png)

*Figure 1: Create event form showing "Publish" button for approvers*

![Published Event](/docs/user-manual/approvers/images/publishing-directly-2.png)

*Figure 2: Event created with "Published" status*

![Public Events Page](/docs/user-manual/approvers/images/publishing-directly-3.png)

*Figure 3: Event immediately visible on public events page*

**Tips:**
- This feature is useful for urgent or official events
- Regular users cannot publish directly - their events need approval
- Make sure all details are correct before publishing, as the event becomes immediately visible

---

## For Administrators

Administrators manage users, locations, and system settings (except superadmin-only settings).


---


# For Administrators

---

### Creating a New User

**What it does:**
Allows administrators to create new user accounts for the platform.

**Who can use it:**
Users with "Admin" or "Superadmin" role

**Step-by-step guide:**
1. Navigate to "User Management" section
2. Click "Create User" button
3. Fill in the user details:
   - **Name**: Enter the user's full name
   - **Email**: Enter a valid email address (must be unique)
   - **Password**: Enter a secure password (minimum 8 characters)
   - **Role**: Select the appropriate role (user, approver, admin)
4. Click "Create User"

**What you'll see:**
- The new user appears in the users list
- The user can immediately log in with the provided credentials
- User account is active and ready to use

**Screenshots:**

![Create User Form](/docs/user-manual/administrators/images/creating-user-1.png)
*Figure 1: Create user form with all fields filled (Admin logged in)*

![Users List](/docs/user-manual/administrators/images/creating-user-2.png)
*Figure 2-3: Users list showing the newly created user*

![Successful Login](/docs/user-manual/administrators/images/creating-user-3.png)

*Figure 4: New user able to log in successfully*

**Tips:**
- Email addresses must be unique in the system
- Admins cannot create Superadmin users - only Superadmins can do that
- Provide secure passwords and encourage users to change them on first login
- Choose the appropriate role based on the user's responsibilities


---

### Creating a New Location

**What it does:**
Adds new event locations to the system that can be used when creating events.

**Who can use it:**
Users with "Admin" or "Superadmin" role

**Step-by-step guide:**
1. Navigate to "Location Management"
2. Click "Create Location" button
3. Enter the location name (e.g., "Gedung Test Script")
4. Click "Create"

**What you'll see:**
- A success notification confirming creation
- The new location appears in the locations list
- The location is automatically set as "Active"
- The location is now available in the event creation form dropdown

**Screenshots:**

![Create Location Form](/docs/user-manual/administrators/images/creating-location-1.png)
*Figure 1: Create location form with location name*

![Success Notification](/docs/user-manual/administrators/images/creating-location-2.png)
*Figure 2: Success notification after creating location*

![Locations List](/docs/user-manual/administrators/images/creating-location-3.png)
*Figure 3: New location appearing in the locations list*

![Event Form Dropdown](/docs/user-manual/administrators/images/creating-location-4.png)
*Figure 4: Location available in event creation form dropdown*

**Tips:**
- Location names should be clear and descriptive
- Duplicate location names are not allowed
- New locations are active by default


---

### Toggling Location Status

**What it does:**
Activates or deactivates locations to control which ones appear in event creation forms.

**Who can use it:**
Users with "Admin" or "Superadmin" role

**Step-by-step guide:**
1. Navigate to "Location Management"
2. Find the location you want to toggle
3. Click the toggle switch to change status (Active ↔ Inactive)
4. Confirm the change

**What you'll see:**
- A success message confirming the status change
- The status indicator updates (Active/Inactive)
- Inactive locations do not appear in event form dropdowns
- Inactive locations are still visible in the admin locations list
- Existing events using the location are not affected

**Screenshots:**

![Location with Toggle Button](/docs/user-manual/administrators/images/toggling-location-1.png)
*Figure 1: Location management showing toggle buttons*

![Success Message and Updated Status](/docs/user-manual/administrators/images/toggling-location-2.png)
*Figure 2-3: Success message and updated status indicator*

![Event Form Showing Only Active Locations](/docs/user-manual/administrators/images/toggling-location-3.png)
*Figure 4: Event creation form dropdown showing only active locations*

**Tips:**
- Use inactive status for temporarily unavailable locations
- Inactive locations don't disappear from existing events
- You can reactivate locations at any time

---

## For Superadministrators

Superadministrators have the highest level of access and can manage all system settings.


---


# For Superadministrators

---

### Updating Site Settings

**What it does:**
Allows customization of the platform's appearance and branding, including site title and color scheme.

**Who can use it:**
Users with "Superadmin" role only

**Step-by-step guide:**
1. Navigate to "Site Settings"
2. Update the following fields:
   - **Site Title**: Enter the desired name for your campus event hub (e.g., "My Campus Events")
   - **Primary Color**: Choose the main theme color (e.g., #FF5733)
   - **Secondary Color**: Choose the accent color (e.g., #33FF57)
3. Click "Save Settings"

**What you'll see:**
- A success notification confirming the update
- Changes reflect immediately throughout the UI
- The new site title appears in the header/navbar
- The new color scheme is applied to the theme
- The updated timestamp is recorded

**Screenshots:**

![Settings Form with Changes](/docs/user-manual/superadministrators/images/updating-settings-1.gif)
*Figure 1-4: Settings form showing updated values and immediate UI changes*

**Tips:**
- Choose colors that provide good contrast for readability
- The site title appears in the browser tab and header
- Changes apply immediately to all users
- Test color combinations for accessibility


---

### Uploading Site Logo

**What it does:**
Allows you to upload a custom logo that will be displayed in the platform's header.

**Who can use it:**
Users with "Superadmin" role only

**Step-by-step guide:**
1. Navigate to "Site Settings"
2. Scroll to the "Logo" section
3. Click "Choose File" or drag and drop your logo image
4. Select a valid image file (PNG or JPG format, less than 5MB)
5. Click "Upload Logo"

**What you'll see:**
- A success message confirming the upload
- The logo appears in the header/navbar
- The logo file is saved to the server
- The logo URL is updated in the settings

**Screenshots:**

![Logo Upload Form](/docs/user-manual/superadministrators/images/uploading-logo-1.gif)
*Figure 1-4: Logo upload interface and successful upload confirmation*

**Tips:**
- Use PNG format for logos with transparency
- Recommended logo dimensions: 200x60 pixels
- Keep file size under 5MB for faster loading
- Use a high-contrast logo for better visibility

---

## Common Issues and Troubleshooting


---


# Troubleshooting

---

### Common Issues - All Users

This section covers troubleshooting for issues that any user may encounter while using Campus Event Hub.

---

## Login Problems

---

#### Problem: "Invalid credentials"

**Symptoms:**
- Error message appears after clicking the Login button
- Cannot access the dashboard

**Possible Causes:**
- Incorrect email address
- Incorrect password (passwords are case-sensitive)
- Account does not exist in the system

**Solutions:**
1. Double-check your email address for typos
2. Verify that Caps Lock is not enabled
3. Re-type your password carefully
4. If you forgot your password, use the "Forgot Password" link on the login page

**If the problem persists:**
- Contact your administrator to verify your account exists
- Ask the administrator to reset your password

---

#### Problem: Session expired / Logged out unexpectedly

**Symptoms:**
- Redirected to login page while using the application
- "Session expired" or "Unauthorized" error message
- Actions fail with authentication errors

**Possible Causes:**
- Your login session has expired (sessions last 7 days by default)
- You logged in from another device/browser
- Browser cleared cookies or local storage

**Solutions:**
1. Log in again with your credentials
2. Check if you have multiple tabs open and logged out from one
3. Ensure your browser is not set to clear data on close

**Tips:**
- Stay active in the application to maintain your session
- Avoid using private/incognito mode if you want persistent sessions

---

## Page Loading Issues

---

#### Problem: Page not loading / Blank screen

**Symptoms:**
- White or blank page displayed
- Page content does not appear
- Loading spinner never stops

**Possible Causes:**
- JavaScript error in the browser
- Network connectivity issues
- Browser cache issues
- Server is temporarily unavailable

**Solutions:**
1. **Refresh the page** - Press F5 or click the refresh button
2. **Hard refresh** - Press Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
3. **Check your internet connection** - Try opening another website
4. **Clear browser cache** - See the Technical Issues section for instructions
5. **Try a different browser** - Use Chrome, Firefox, or Edge

**If the problem persists:**
- Check if the server is running (contact administrator)
- Try accessing from a different network

---

#### Problem: Slow performance

**Symptoms:**
- Pages take a long time to load
- Actions feel sluggish
- Images load slowly

**Possible Causes:**
- Slow internet connection
- Server under heavy load
- Too many browser tabs open
- Browser extensions interfering

**Solutions:**
1. Check your internet connection speed
2. Close unnecessary browser tabs
3. Disable browser extensions temporarily
4. Clear browser cache and cookies
5. Try using a wired connection instead of WiFi

---

#### Problem: "Something went wrong" error

**Symptoms:**
- Generic error message displayed
- Action does not complete
- Red error notification appears

**Possible Causes:**
- Server error occurred
- Invalid data submitted
- Network timeout

**Solutions:**
1. Refresh the page and try the action again
2. Check if all required fields are filled correctly
3. Wait a few minutes and try again
4. Check browser console for specific error details (F12 > Console tab)

**If the problem persists:**
- Note down the exact error message
- Report the issue to your administrator with steps to reproduce

---

## Event Registration Issues

---

#### Problem: "Event is full"

**Symptoms:**
- Cannot register for an event
- "Event is full" or "No slots available" message
- Register button is disabled

**Possible Causes:**
- The event has reached its maximum attendee capacity
- Other users registered before you

**Solutions:**
1. Check if the event has a waitlist option
2. Contact the event creator to request additional slots
3. Look for similar events with available capacity

**Tips:**
- Register early for popular events
- Enable notifications to be alerted when slots become available

---

#### Problem: "Registration closed"

**Symptoms:**
- Cannot register for an event
- "Registration has ended" message
- Register button is not visible

**Possible Causes:**
- The registration period has ended
- Registration has not started yet
- The event has been cancelled

**Solutions:**
1. Check the registration start and end dates on the event details page
2. If registration hasn't started, wait until the start date
3. Contact the event creator if you believe this is an error

---

#### Problem: Registration not showing in profile

**Symptoms:**
- Registered for an event but it doesn't appear in "Joined Events"
- Confirmation was shown but registration is missing

**Possible Causes:**
- Page not refreshed after registration
- Registration failed silently
- Browser caching old data

**Solutions:**
1. Refresh the profile page
2. Log out and log back in
3. Clear browser cache and check again
4. Go to the event details page and verify your registration status

**If the problem persists:**
- Try registering again from the event details page
- Contact the event creator to verify your registration

---

## General Tips

- **Always save your work** - If filling out long forms, copy important text before submitting
- **Use a modern browser** - Chrome, Firefox, or Edge for best compatibility
- **Keep your browser updated** - Older versions may have compatibility issues
- **Check your internet connection** - Many issues are caused by network problems
- **Clear cache regularly** - This prevents many display and functionality issues

---

---

### Event Creator Issues

This section covers troubleshooting for issues related to creating and managing events.

---

## Event Creation Problems

---

#### Problem: Form validation errors

**Symptoms:**
- Red error messages appear below form fields
- Cannot submit the event form
- "Required field" errors displayed

**Possible Causes:**
- Required fields are empty
- Invalid data format entered
- Field values exceed character limits

**Solutions:**
1. Check all fields marked with asterisk (*) are filled
2. Ensure the event title is not empty
3. Verify description is provided
4. Select a valid location from the dropdown
5. Fill in all date and time fields

**Required Fields:**
- Event Title
- Description
- Event Date and Time
- Registration Start Date and Time
- Registration End Date and Time
- Location
- At least one attachment

---

#### Problem: Date/time validation failures

**Symptoms:**
- "Invalid registration period" error
- "Registration must end before event starts" error
- Cannot save event with entered dates

**Possible Causes:**
- Registration end date is after the event date
- Registration start date is after registration end date
- Event date is in the past

**Solutions:**
1. Ensure **Registration Start** is before **Registration End**
2. Ensure **Registration End** is before or equal to **Event Date/Time**
3. Set the event date to a future date
4. Double-check all date fields are in the correct order:
   - Registration Start → Registration End → Event Date

**Valid Date Order:**
```
Registration Start < Registration End ≤ Event Start
```

---

#### Problem: Attachment upload failures

**Symptoms:**
- "File too large" error message
- "Invalid file format" error
- File not appearing in the selected files list
- Upload progress stuck

**Possible Causes:**
- File exceeds 10MB size limit
- File format not supported
- Network connection interrupted during upload

**Solutions:**

**For "File too large" error:**
1. Compress the file to reduce its size
2. Use online compression tools for PDFs and images
3. Split large documents into smaller parts

**For "Invalid file format" error:**
1. Convert the file to a supported format
2. Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG, GIF, WEBP

**For upload stuck:**
1. Cancel and retry the upload
2. Check your internet connection
3. Try a smaller file first to test

**File Requirements:**
- Maximum size: 10MB per file
- At least one attachment is required
- Multiple files can be uploaded

---

#### Problem: Event not saving

**Symptoms:**
- Click "Create Event" but nothing happens
- Error message after submission
- Form resets without confirmation

**Possible Causes:**
- Validation errors not visible (scroll up to check)
- Network connection lost
- Server error occurred

**Solutions:**
1. Scroll to the top of the form to check for error messages
2. Verify all required fields are filled
3. Check your internet connection
4. Try saving as "Draft" first
5. Refresh the page and re-enter the data

**Tips:**
- Copy your event description before submitting (in case of errors)
- Save frequently if the form is long

---

## Event Management Issues

---

#### Problem: Cannot edit event (permissions)

**Symptoms:**
- "You do not have permission to edit this event" error
- Edit button not visible
- Redirected when accessing edit page

**Possible Causes:**
- You are not the event creator
- Event status prevents editing
- Your role doesn't allow editing this event

**Solutions:**
1. Verify you are logged in as the event creator
2. Check if the event is in a status that allows editing (Draft, Needs Revision)
3. If you're an admin/approver, you can edit any event
4. Contact the event creator to make changes

**Editable Event Statuses:**
- Draft - Can be edited by creator
- Needs Revision - Can be edited by creator after approver feedback

**Non-Editable Statuses:**
- Published - Must be unpublished or cancelled first
- Pending Approval - Withdraw submission first
- Cancelled - Cannot be edited

---

#### Problem: Event not appearing after creation

**Symptoms:**
- Created an event but it's not in the events list
- Event saved successfully but cannot find it

**Possible Causes:**
- Event is in "Draft" status (not visible to public)
- Viewing the wrong events filter
- Event needs approval before being visible

**Solutions:**
1. Check the "My Events" section in your profile
2. Change the status filter to "All" or "Draft"
3. If status is "Draft", submit for approval to make it visible
4. Refresh the page or clear cache

**Event Visibility:**
- Draft events: Only visible to creator
- Pending Approval: Visible to creator and approvers
- Published: Visible to everyone

---

#### Problem: Cannot submit for approval

**Symptoms:**
- "Submit for Approval" button disabled or missing
- Error when clicking submit button
- Event stuck in Draft status

**Possible Causes:**
- Event is missing required information
- Event has validation errors
- Event is not in Draft status

**Solutions:**
1. Edit the event and ensure all required fields are filled
2. Check that at least one attachment is uploaded
3. Verify the event is in "Draft" status
4. Fix any validation errors shown in the edit form

**Requirements for Submission:**
- All required fields filled
- Valid date/time configuration
- At least one attachment uploaded
- Event must be in Draft status

---

#### Problem: Cannot cancel event

**Symptoms:**
- Cancel button not visible
- "Cannot cancel this event" error
- Cancel action doesn't work

**Possible Causes:**
- Event is not in Published status
- You don't have permission to cancel
- Event is already cancelled

**Solutions:**
1. Only Published events can be cancelled
2. Only event creators or admins can cancel events
3. Check if the event is already in Cancelled status

**Who Can Cancel:**
- Event creator (their own events)
- Admin/Superadmin (any event)

**Note:** Cancelling an event will notify all registered attendees via email.

---

## Tips for Event Creators

- **Save drafts frequently** - Don't lose your work
- **Preview before publishing** - Review all details carefully
- **Set realistic registration periods** - Give attendees enough time to register
- **Upload clear attachments** - Use descriptive file names
- **Monitor registrations** - Check attendee count regularly
- **Communicate with attendees** - Use the messaging feature for updates

---

---

### Approver Issues

This section covers troubleshooting for issues related to the event approval workflow.

---

## Approval Workflow Issues

---

#### Problem: Cannot see pending events

**Symptoms:**
- "Pending Approval" section is empty
- Events awaiting approval are not visible
- Approval queue shows no items

**Possible Causes:**
- No events are currently pending approval
- You don't have approver permissions
- Filter is set incorrectly
- Page not refreshed after new submissions

**Solutions:**
1. Verify your account has "Approver" role or higher
2. Check the status filter is set to "Pending Approval"
3. Refresh the page to load latest submissions
4. Ask event creators if they have submitted events for approval

**Who Can Approve Events:**
- Approver role
- Admin role
- Superadmin role

**If you should have approver access but don't:**
- Contact your administrator to verify your role
- Log out and log back in to refresh permissions

---

#### Problem: Approval/rejection not saving

**Symptoms:**
- Click "Approve" but event status doesn't change
- Error message after clicking approve/reject
- Action appears to work but event remains pending

**Possible Causes:**
- Network connection issue
- Server error occurred
- Session expired
- Event was modified by another user

**Solutions:**
1. Refresh the page and try again
2. Check your internet connection
3. Log out and log back in
4. Verify the event is still in "Pending Approval" status

**If the problem persists:**
1. Try using a different browser
2. Clear browser cache and retry
3. Contact system administrator

---

#### Problem: Cannot request revision

**Symptoms:**
- "Request Revision" button not working
- Error when trying to send revision feedback
- Revision comment not being saved

**Possible Causes:**
- Revision comment is empty
- Event is not in correct status
- Network connectivity issue

**Solutions:**
1. Ensure you enter a revision comment (required field)
2. Provide clear, actionable feedback for the event creator
3. Check that the event is in "Pending Approval" status
4. Refresh the page and try again

**Revision Comment Requirements:**
- Cannot be empty
- Should describe what changes are needed
- Be specific about issues that need to be addressed

**Example Revision Comments:**
- "Please add more details about the event schedule"
- "The registration end date should be before the event date"
- "Please upload the event agenda as an attachment"

---

#### Problem: Event creator not receiving revision notification

**Symptoms:**
- Requested revision but creator says they didn't receive notification
- Event stuck in "Needs Revision" status with no action from creator

**Possible Causes:**
- Email notification not sent or delayed
- Creator's email in spam folder
- Email configuration issue on server

**Solutions:**
1. Ask the creator to check their spam/junk folder
2. Inform the creator directly about the revision request
3. The creator can check their event status in "My Events"
4. Contact administrator if email notifications are consistently failing

**Tips:**
- Always provide clear revision instructions
- Consider following up directly with the event creator
- The event will show "Needs Revision" status in the creator's dashboard

---

## Approval Best Practices

- **Review thoroughly** - Check all event details before approving
- **Verify dates** - Ensure registration and event dates are logical
- **Check attachments** - Review uploaded files for appropriateness
- **Provide clear feedback** - When requesting revisions, be specific
- **Respond promptly** - Don't leave events pending for too long
- **Communicate** - Reach out to creators if you have questions

---

## Understanding Event Statuses

| Status | Description | Who Can See |
|--------|-------------|-------------|
| Draft | Event is being created | Creator only |
| Pending Approval | Submitted, awaiting review | Creator, Approvers, Admins |
| Needs Revision | Requires changes from creator | Creator, Approvers, Admins |
| Published | Approved and visible to all | Everyone |
| Cancelled | Event has been cancelled | Everyone |

---

## Approval Workflow Summary

```
Creator submits event
        ↓
Status: Pending Approval
        ↓
Approver reviews event
        ↓
    ┌───┴───┐
    ↓       ↓
 Approve  Request Revision
    ↓       ↓
Published  Needs Revision
            ↓
    Creator makes changes
            ↓
    Resubmits for approval
            ↓
    Status: Pending Approval
            ↓
        (cycle continues)
```

---

---

### Administrator Issues

This section covers troubleshooting for issues related to user management and location management.

---

## User Management Issues

---

#### Problem: Cannot create user

**Symptoms:**
- "Create User" form shows errors
- User not created after submission
- Error message when saving new user

**Possible Causes:**
- Required fields are missing
- Email already exists in the system
- Invalid email format
- Password doesn't meet requirements
- You don't have permission to create users

**Solutions:**

**For "Email already exists" error:**
1. The email address is already registered
2. Search for the existing user account
3. Use a different email address

**For validation errors:**
1. Ensure all required fields are filled:
   - Name
   - Email
   - Password
   - Role
   - Category (Mahasiswa/Staff)
2. Use a valid email format (e.g., user@example.com)
3. Password must meet minimum requirements

**For permission errors:**
1. Only Admin and Superadmin can create users
2. Verify your role has user management permissions
3. Log out and log back in to refresh permissions

**Role Hierarchy for User Creation:**
- Superadmin: Can create any role (including Admin)
- Admin: Can create User and Approver roles only

---

#### Problem: User role not updating

**Symptoms:**
- Changed user role but it reverts
- Role update shows success but doesn't apply
- User still has old permissions

**Possible Causes:**
- Trying to assign a role above your permission level
- User is logged in with cached permissions
- Database update failed

**Solutions:**
1. Verify you have permission to assign the target role
2. Ask the user to log out and log back in
3. Refresh the users list page
4. Check if the user has any active sessions

**Role Assignment Permissions:**
- Superadmin: Can assign any role
- Admin: Can only assign User or Approver roles
- Admin cannot create/modify other Admin or Superadmin accounts

**Important:** Users need to log out and back in to see role changes take effect.

---

#### Problem: Cannot delete user

**Symptoms:**
- Delete button not visible
- Error when trying to delete user
- "Cannot delete this user" message

**Possible Causes:**
- User has associated events or registrations
- Trying to delete a user with higher role
- User is the only Superadmin

**Solutions:**
1. Users with events may need their events deleted first
2. Cannot delete users with higher roles than yourself
3. System must have at least one Superadmin account
4. Consider deactivating instead of deleting

---

## Location Management Issues

---

#### Problem: Location not saving

**Symptoms:**
- "Create Location" form doesn't submit
- Location created but not appearing in list
- Error message when saving location

**Possible Causes:**
- Location name is empty
- Location name already exists
- Invalid max capacity value
- Network connection issue

**Solutions:**

**For "Name required" error:**
1. Enter a location name (required field)

**For duplicate name error:**
1. Each location must have a unique name
2. Check existing locations for duplicates
3. Use a more specific name

**For max capacity issues:**
1. Max capacity must be a positive number
2. Leave empty for unlimited capacity
3. Don't enter negative numbers or text

**If location doesn't appear after creation:**
1. Refresh the locations page
2. Check the "All Locations" view (not just active)
3. New locations are active by default

---

#### Problem: Cannot toggle location status

**Symptoms:**
- Toggle switch doesn't respond
- Status changes but reverts immediately
- Error when trying to activate/deactivate

**Possible Causes:**
- Network connectivity issue
- Location has active events
- Permission issue

**Solutions:**
1. Refresh the page and try again
2. Check your internet connection
3. Verify you have Admin or Superadmin role

**Impact of Deactivating a Location:**
- Location won't appear in event creation dropdown
- Existing events at this location are NOT affected
- Location can be reactivated at any time

---

#### Problem: Cannot edit location capacity

**Symptoms:**
- Max capacity field not updating
- Capacity shows "Unlimited" after setting a number
- Error when saving capacity changes

**Possible Causes:**
- Invalid capacity value entered
- Form not submitting properly
- Browser caching old values

**Solutions:**
1. Enter a valid positive number for capacity
2. To set unlimited, leave the field empty or enter 0
3. Refresh the page after saving
4. Clear browser cache if value doesn't update

---

## Settings Management Issues (Superadmin Only)

---

#### Problem: Site settings not saving

**Symptoms:**
- Changed site title but it reverted
- Logo upload failed
- Color changes not applying

**Possible Causes:**
- Not logged in as Superadmin
- File upload too large (logo)
- Invalid color format

**Solutions:**

**For site title:**
1. Ensure you have Superadmin role
2. Title cannot be empty
3. Refresh page after saving

**For logo upload:**
1. Maximum file size: 2MB
2. Supported formats: JPG, PNG, GIF, WEBP
3. Recommended dimensions: 200x50 pixels
4. Try compressing the image if too large

**For color settings:**
1. Use valid hex color codes (e.g., #007bff)
2. Ensure good contrast between colors
3. Preview changes before saving

---

## Admin Best Practices

- **Document user accounts** - Keep track of who has what role
- **Regular audits** - Review user permissions periodically
- **Location naming** - Use clear, descriptive location names
- **Capacity planning** - Set realistic max capacities
- **Communicate changes** - Notify users of role changes
- **Backup important data** - Export user lists regularly

---

## Role Permissions Summary

| Action | User | Approver | Admin | Superadmin |
|--------|------|----------|-------|------------|
| Create Events | Yes | Yes | Yes | Yes |
| Approve Events | No | Yes | Yes | Yes |
| Manage Users | No | No | Yes | Yes |
| Manage Locations | No | No | Yes | Yes |
| Site Settings | No | No | No | Yes |
| Create Admin Accounts | No | No | No | Yes |

---

---

### Technical Issues

This section covers browser compatibility, connection problems, and cache-related troubleshooting.

---

## Browser Compatibility

---

#### Recommended Browsers

Campus Event Hub works best with modern, up-to-date browsers:

| Browser | Minimum Version | Recommended |
|---------|-----------------|-------------|
| Google Chrome | 90+ | Yes (Best) |
| Mozilla Firefox | 88+ | Yes |
| Microsoft Edge | 90+ | Yes |
| Safari | 14+ | Yes |
| Opera | 76+ | Yes |

**Not Supported:**
- Internet Explorer (any version)
- Browsers older than 2021

---

#### Problem: Features not working in specific browsers

**Symptoms:**
- Buttons don't respond
- Forms don't submit
- Layout looks broken
- JavaScript errors in console

**Possible Causes:**
- Outdated browser version
- Browser extensions interfering
- JavaScript disabled
- Privacy settings blocking features

**Solutions:**
1. **Update your browser** to the latest version
2. **Disable browser extensions** temporarily:
   - Ad blockers can interfere with functionality
   - Privacy extensions may block required scripts
3. **Enable JavaScript**:
   - Chrome: Settings → Privacy and Security → Site Settings → JavaScript
   - Firefox: about:config → javascript.enabled = true
4. **Try incognito/private mode** to rule out extension issues

---

#### Problem: Mobile browser issues

**Symptoms:**
- Layout doesn't fit screen
- Touch interactions don't work
- Features missing on mobile

**Possible Causes:**
- Mobile browser not fully supported
- Screen size too small for certain features
- Mobile-specific browser bugs

**Solutions:**
1. Use the desktop version of the site when possible
2. Rotate to landscape mode for better layout
3. Use Chrome or Safari mobile browsers
4. Request desktop site in mobile browser settings

---

## Connection Issues

---

#### Problem: Network timeout errors

**Symptoms:**
- "Request timed out" error
- Actions take forever then fail
- Partial page loads

**Possible Causes:**
- Slow internet connection
- Server response delayed
- Network congestion
- Firewall blocking requests

**Solutions:**
1. **Check your internet connection**
   - Try loading other websites
   - Run a speed test (fast.com or speedtest.net)
2. **Wait and retry** - Server might be temporarily busy
3. **Switch networks** - Try WiFi vs mobile data
4. **Restart your router** if on home network
5. **Disable VPN** if using one

---

#### Problem: API connection failures

**Symptoms:**
- "Failed to fetch" errors
- "Network Error" messages
- Data not loading

**Possible Causes:**
- Server is down or restarting
- API URL is incorrect
- CORS issues (for developers)
- SSL certificate problems

**Solutions:**
1. **Refresh the page** and wait a moment
2. **Check server status** - Contact administrator
3. **Try again later** - Server might be under maintenance
4. **Clear browser cache** and reload

**For Administrators:**
- Check if the backend server is running
- Verify Nginx/reverse proxy is configured correctly
- Check server logs for errors

---

#### Problem: Offline behavior

**Symptoms:**
- "You are offline" message
- Cannot load any content
- Previously loaded pages don't update

**Possible Causes:**
- Internet connection lost
- WiFi disconnected
- Server unreachable

**Solutions:**
1. Check your internet connection icon
2. Try opening another website
3. Reconnect to WiFi if disconnected
4. Wait for connection to restore
5. Refresh the page once online

**Note:** Campus Event Hub requires an internet connection. Offline mode is not currently supported.

---

## Cache and Storage Issues

---

#### How to Clear Browser Cache

Clearing cache can resolve many display and functionality issues.

**Google Chrome:**
1. Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
2. Select "Cached images and files"
3. Choose time range: "All time"
4. Click "Clear data"

**Mozilla Firefox:**
1. Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
2. Select "Cache"
3. Choose time range: "Everything"
4. Click "Clear Now"

**Microsoft Edge:**
1. Press `Ctrl+Shift+Delete`
2. Select "Cached images and files"
3. Choose time range: "All time"
4. Click "Clear now"

**Safari:**
1. Go to Safari → Preferences → Privacy
2. Click "Manage Website Data"
3. Click "Remove All"

---

#### How to Clear Local Storage

If you experience authentication issues or stale data:

**Using Browser DevTools:**
1. Press `F12` to open DevTools
2. Go to "Application" tab (Chrome/Edge) or "Storage" tab (Firefox)
3. Expand "Local Storage" in the sidebar
4. Right-click on the site URL
5. Select "Clear"

**Alternative - Clear All Site Data:**
1. Chrome: Settings → Privacy → Site Settings → View permissions and data stored across sites
2. Find the Campus Event Hub site
3. Click the trash icon to delete all data

---

#### How to Hard Refresh

A hard refresh bypasses the cache and reloads everything:

**Windows/Linux:**
- `Ctrl + Shift + R`
- or `Ctrl + F5`

**Mac:**
- `Cmd + Shift + R`

**Mobile:**
- Pull down on the page and release (pull-to-refresh)
- Or clear browser cache in settings

---

#### Problem: Seeing outdated content

**Symptoms:**
- Old data showing after updates
- Changes made by others not appearing
- Profile/settings showing old values

**Possible Causes:**
- Browser cache serving old content
- Local storage has stale data
- CDN caching (for deployed sites)

**Solutions:**
1. **Hard refresh** the page (Ctrl+Shift+R)
2. **Clear browser cache** (see instructions above)
3. **Clear local storage** for the site
4. **Log out and log back in**
5. **Try incognito/private mode**

---

## Performance Optimization

---

#### Tips for Better Performance

1. **Close unnecessary tabs** - Free up browser memory
2. **Disable unused extensions** - Reduce browser overhead
3. **Use a wired connection** - More stable than WiFi
4. **Clear cache regularly** - Prevents bloated storage
5. **Keep browser updated** - Get latest performance improvements
6. **Restart browser** - Clears temporary memory leaks

---

#### Problem: High memory usage

**Symptoms:**
- Browser becomes slow over time
- Computer fans spin up
- System becomes unresponsive

**Possible Causes:**
- Too many tabs open
- Memory leak in browser
- Extensions consuming memory

**Solutions:**
1. Close tabs you're not using
2. Restart your browser
3. Disable heavy extensions
4. Use browser's built-in task manager:
   - Chrome: Shift+Esc
   - Firefox: about:performance

---

## Getting Help

If you've tried all troubleshooting steps and still have issues:

1. **Document the problem:**
   - Screenshot of the error
   - Steps to reproduce
   - Browser and version
   - Operating system

2. **Check browser console:**
   - Press F12 → Console tab
   - Note any red error messages

3. **Contact administrator:**
   - Provide all documented information
   - Include the time when the issue occurred

---

## Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| Page not loading | Hard refresh (Ctrl+Shift+R) |
| Login issues | Clear local storage |
| Stale data | Clear cache |
| Network errors | Check internet, wait and retry |
| Features not working | Try different browser |
| Slow performance | Close tabs, restart browser |

---

---

