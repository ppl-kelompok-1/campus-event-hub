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

![Maximum Attendees field with capacity hint](placeholder-gambar-1.png)

![Validation error when exceeding capacity](placeholder-gambar-2.png)

![Success state with valid capacity](placeholder-gambar-3.png)

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
