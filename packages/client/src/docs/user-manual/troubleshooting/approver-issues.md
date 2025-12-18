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
