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
