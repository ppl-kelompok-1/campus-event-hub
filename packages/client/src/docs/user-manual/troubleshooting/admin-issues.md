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
