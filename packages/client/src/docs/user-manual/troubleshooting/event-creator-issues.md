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
