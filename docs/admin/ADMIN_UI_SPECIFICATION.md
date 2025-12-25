# Admin Dashboard UI/UX Specification

## Overview

This document provides detailed UI/UX specifications for the admin dashboard, including layouts, component designs, user flows, and responsive behavior.

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Layout Structure](#layout-structure)
3. [Color Scheme & Typography](#color-scheme--typography)
4. [Navigation](#navigation)
5. [Page Specifications](#page-specifications)
6. [Component Library](#component-library)
7. [Responsive Design](#responsive-design)
8. [Accessibility](#accessibility)

---

## Design Principles

### Core Principles

1. **Efficiency First**: Minimize clicks to complete tasks
2. **Data Clarity**: Present complex data in digestible formats
3. **Consistency**: Maintain consistent patterns across all pages
4. **Feedback**: Provide immediate feedback for all actions
5. **Error Prevention**: Validate input before submission
6. **Accessibility**: WCAG 2.1 AA compliance

### User Experience Goals

- Admin can complete any task in ≤ 3 clicks
- All critical information visible without scrolling
- Clear visual hierarchy
- Fast load times (< 2 seconds)
- Intuitive navigation

---

## Layout Structure

### Overall Layout

```
┌─────────────────────────────────────────────────────┐
│  Top Header (60px height, fixed)                    │
│  Logo | Breadcrumbs | Search | Notifications | User │
├──────┬──────────────────────────────────────────────┤
│      │                                               │
│ Side │  Main Content Area                            │
│ bar  │  ┌──────────────────────────────────────┐    │
│      │  │  Page Header                         │    │
│ (240 │  │  Title | Actions                      │    │
│  px) │  ├──────────────────────────────────────┤    │
│      │  │                                       │    │
│      │  │  Content Area                         │    │
│ Menu │  │  (Scrollable)                         │    │
│Items │  │                                       │    │
│      │  │                                       │    │
│      │  │                                       │    │
│      │  └──────────────────────────────────────┘    │
│      │                                               │
└──────┴──────────────────────────────────────────────┘
```

### Responsive Breakpoints

- **Desktop**: ≥ 1200px (sidebar visible)
- **Tablet**: 768px - 1199px (collapsible sidebar)
- **Mobile**: < 768px (drawer sidebar, stacked layout)

---

## Color Scheme & Typography

### Primary Colors

```scss
$primary: #2563eb;        // Blue - primary actions
$primary-hover: #1d4ed8;  // Darker blue
$primary-light: #dbeafe;  // Light blue backgrounds

$success: #10b981;        // Green - success states
$warning: #f59e0b;        // Orange - warnings
$danger: #ef4444;         // Red - errors/delete
$info: #06b6d4;           // Cyan - info messages

$neutral-900: #111827;    // Headings
$neutral-700: #374151;    // Body text
$neutral-500: #6b7280;    // Secondary text
$neutral-300: #d1d5db;    // Borders
$neutral-100: #f3f4f6;    // Backgrounds
$neutral-50: #f9fafb;     // Cards, panels
```

### Status Colors

```scss
$status-pending: #f59e0b;     // Orange
$status-authorized: #06b6d4;  // Cyan
$status-captured: #10b981;    // Green
$status-finalized: #8b5cf6;   // Purple
$status-cancelled: #6b7280;   // Gray
$status-failed: #ef4444;      // Red
```

### Typography

**Font Family:**
```scss
$font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
$font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

**Font Sizes:**
```scss
$text-xs: 12px;    // Labels, badges
$text-sm: 14px;    // Body text, table cells
$text-base: 16px;  // Base text
$text-lg: 18px;    // Subheadings
$text-xl: 20px;    // Section titles
$text-2xl: 24px;   // Page titles
$text-3xl: 30px;   // Dashboard headings
```

**Font Weights:**
```scss
$font-normal: 400;
$font-medium: 500;
$font-semibold: 600;
$font-bold: 700;
```

---

## Navigation

### Top Header

**Components:**
- Logo/Brand (left, 180px)
- Breadcrumbs (center)
- Global search (right side)
- Notifications icon with badge
- User menu dropdown

**User Menu Dropdown:**
- User name and role
- My Profile
- Settings
- Divider
- Logout

### Sidebar Navigation

**Menu Structure:**

```
🏠 Dashboard

📋 Service Requests
   ├─ All Requests
   ├─ Pending
   ├─ Authorized
   └─ Captured

👨‍🔧 Mechanics
   ├─ All Mechanics
   ├─ Active
   └─ Inactive

⭐ Reviews
   ├─ All Reviews
   └─ By Rating

🛠️ Skills

👥 Admin Users (ADMIN only)

📊 Analytics
   ├─ Overview
   ├─ Revenue
   └─ Performance

⚙️ Settings
   ├─ General
   ├─ Payment
   └─ Notifications
```

**Sidebar Behavior:**
- Collapsible on tablet/desktop
- Drawer overlay on mobile
- Active state highlighting
- Expandable sections

---

## Page Specifications

### 1. Dashboard Page

**URL:** `/admin/dashboard`

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│  Dashboard                              [Date Range] │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │Total Req │ │ Active   │ │ Revenue  │ │ Avg    │ │
│  │ 1,523    │ │ Mechs 42 │ │ $913.8K  │ │ 4.7⭐  │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐ ┌──────────────────┐   │
│  │ Revenue Trend (Chart)   │ │ Requests by      │   │
│  │                         │ │ Status (Pie)     │   │
│  │      📊                 │ │      🥧          │   │
│  └─────────────────────────┘ └──────────────────┘   │
├─────────────────────────────────────────────────────┤
│  Recent Service Requests                            │
│  ┌─────────────────────────────────────────────┐   │
│  │ ID | Customer | Vehicle | Status | Actions  │   │
│  ├─────────────────────────────────────────────┤   │
│  │ ... data rows ...                           │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Components:**

1. **Stats Cards (4 cards)**
   - Total Requests (with trend indicator)
   - Active Mechanics
   - Total Revenue (monthly)
   - Average Rating

2. **Revenue Chart**
   - Line chart
   - Selectable time range (7d, 30d, 90d, 1y)
   - Tooltips on hover
   - Export button

3. **Requests by Status Chart**
   - Donut/pie chart
   - Legend with counts
   - Clickable segments (filter)

4. **Recent Requests Table**
   - Last 10 requests
   - Quick actions (view, capture)
   - "View All" link

---

### 2. Service Requests List Page

**URL:** `/admin/service-requests`

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│  Service Requests                      [+ New Request]│
├─────────────────────────────────────────────────────┤
│  🔍 Search | 📅 Date Range | 📊 Status Filter ▼      │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐   │
│  │ ☑ | ID | Customer | Vehicle | Status | $ | ⚡│   │
│  ├─────────────────────────────────────────────┤   │
│  │ ☐ | #123 | John Doe | Toyota Camry | ●... │   │
│  │ ☐ | #124 | Jane Smith | Honda Accord | ●...│   │
│  │     ... more rows ...                       │   │
│  └─────────────────────────────────────────────┘   │
│  Showing 1-20 of 150     [< 1 2 3 ... 8 >] [Export]│
└─────────────────────────────────────────────────────┘
```

**Features:**

1. **Filters & Search**
   - Full-text search (name, email, phone)
   - Date range picker
   - Status dropdown (multi-select)
   - Amount range slider
   - "Clear Filters" button

2. **Table**
   - Checkbox column (bulk actions)
   - ID (clickable → detail page)
   - Customer name + email (hover tooltip)
   - Vehicle (Make Model Year)
   - Status badge (colored)
   - Amount (formatted currency)
   - Actions dropdown:
     - View Details
     - Capture Payment
     - Cancel Request
     - Finalize Request
     - View in Stripe

3. **Bulk Actions**
   - Export selected (CSV)
   - Change status (if applicable)

4. **Pagination**
   - Page numbers
   - Items per page selector (20, 50, 100)
   - Total count display

---

### 3. Service Request Detail Page

**URL:** `/admin/service-requests/:id`

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│  ← Back | Service Request #123                      │
│  Status: ● AUTHORIZED        [Actions ▼]            │
├─────────────────────────────────────────────────────┤
│  📄 Overview | 💳 Payment | 📝 Work Logs | ⏱️ Timeline│
├─────────────────────────────────────────────────────┤
│  [Active Tab Content]                               │
│                                                      │
│  ┌─ Customer Information ──────────────────────┐   │
│  │  John Doe                                    │   │
│  │  john.doe@example.com | 555-123-4567        │   │
│  │  📍 123 Main St, Austin, TX 78701           │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌─ Vehicle Information ────────────────────────┐   │
│  │  2020 Toyota Camry                           │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Tabs:**

**1. Overview Tab**
- Customer Information card
  - Name, email, phone
  - Address (full)
  - Edit button
- Vehicle Information card
  - Year, make, model
  - Edit button
- Quick Stats
  - Created date
  - Last updated
  - Total work logs
  - Reviews count

**2. Payment Tab**
- Payment Summary card
  - Initial deposit: $60.00
  - Final amount: $475.00 (if finalized)
  - Charged amount: $415.00
  - Status timeline
- Stripe Information card
  - Payment Intent ID (link to Stripe)
  - Customer ID (link)
  - Payment Method (last 4 digits)
- Actions
  - Capture Payment button
  - Finalize Request button (modal)
  - Cancel Request button (confirm dialog)
  - Refund button (if captured)

**3. Work Logs Tab**
- Add Work Log button (opens modal)
- Work logs table:
  - Date/Time
  - Mechanic name (link to profile)
  - Hours worked
  - Payout %
  - Notes
  - Actions (edit, delete)
- Total hours summary

**4. Timeline Tab**
- Vertical timeline:
  - Request created
  - Payment authorized
  - Payment captured (if applicable)
  - Work logs added
  - Request finalized (if applicable)
  - Status changes
  - Admin notes

**Action Dropdown (Top Right):**
- Capture Payment
- Finalize Request
- Cancel Request
- Edit Details
- Add Work Log
- View in Stripe
- Send Notification

---

### 4. Mechanics List Page

**URL:** `/admin/mechanics`

**Layout Options:**
- Grid view (cards)
- Table view (rows)

**Grid View:**

```
┌─────────────────────────────────────────────────────┐
│  Mechanics                    [Grid/Table] [+ Add]   │
├─────────────────────────────────────────────────────┤
│  🔍 Search | Active ▼ | Rating ▼ | Location ▼        │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ [Photo]  │ │ [Photo]  │ │ [Photo]  │            │
│  │ Mike J.  │ │ Sarah K. │ │ Tom L.   │            │
│  │ ⭐ 4.8   │ │ ⭐ 4.9   │ │ ⭐ 4.6   │            │
│  │ Austin   │ │ Dallas   │ │ Houston  │            │
│  │ 156 jobs │ │ 203 jobs │ │ 98 jobs  │            │
│  │ [View]   │ │ [View]   │ │ [View]   │            │
│  └──────────┘ └──────────┘ └──────────┘            │
└─────────────────────────────────────────────────────┘
```

**Table View:**
- Similar to service requests table
- Columns: Photo, Name, Location, Rating, Jobs, Status, Actions

---

### 5. Mechanic Form Page (Create/Edit)

**URL:** `/admin/mechanics/new` or `/admin/mechanics/:id/edit`

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│  ← Back | Create Mechanic                 [Save]    │
├─────────────────────────────────────────────────────┤
│  ┌─ Basic Information ──────────┐  ┌─ Preview ───┐ │
│  │  Name: [__________]           │  │ [Photo]     │ │
│  │  Location: [__________]       │  │ Mike J.     │ │
│  │  Bio: [________________]      │  │ ⭐ New      │ │
│  │       [________________]      │  │ Austin, TX  │ │
│  └───────────────────────────────┘  └─────────────┘ │
│  ┌─ Experience ──────────────────┐                  │
│  │  Years: [__]  Since: [____]   │                  │
│  └───────────────────────────────┘                  │
│  ┌─ Photo ───────────────────────┐                  │
│  │  [Upload Area]  [Preview]     │                  │
│  └───────────────────────────────┘                  │
│  ┌─ Skills ──────────────────────┐                  │
│  │  [Multi-select dropdown]      │                  │
│  │  ☑ Oil Change  ☑ Brake Repair │                  │
│  └───────────────────────────────┘                  │
│  ┌─ Certifications ──────────────┐                  │
│  │  [+ Add] ASE Certified [×]    │                  │
│  └───────────────────────────────┘                  │
│  ┌─ Status ──────────────────────┐                  │
│  │  ☑ Active                      │                  │
│  └───────────────────────────────┘                  │
│  [Cancel]                 [Save Mechanic]           │
└─────────────────────────────────────────────────────┘
```

**Form Sections:**

1. **Basic Information**
   - Name (text input, required)
   - Location (text input, required)
   - Bio (textarea, rich text, optional)
   - Slug (auto-generated, editable)

2. **Experience**
   - Years of experience (number input)
   - Since year (year picker)

3. **Photo Upload**
   - Drag & drop area
   - File browser button
   - Image preview with crop
   - Remove button

4. **Skills**
   - Multi-select dropdown
   - Search functionality
   - Selected skills displayed as tags
   - "Create new skill" option

5. **Certifications**
   - Array input (add/remove)
   - Text input for each

6. **Badges**
   - Similar to certifications

7. **Status**
   - Active toggle switch

**Form Actions:**
- Cancel (discard changes, confirm if dirty)
- Save (validate & submit)

**Validation:**
- Real-time inline validation
- Summary at top on submit errors

---

### 6. Reviews List Page

**URL:** `/admin/reviews`

**Similar layout to Service Requests List**

**Table Columns:**
- Review ID
- Mechanic (name, avatar)
- Reviewer name
- Rating (stars)
- Date
- Service description (truncated)
- Actions (view, edit, delete)

**Filters:**
- Mechanic (dropdown)
- Rating (1-5 stars)
- Date range
- Search (reviewer name, text)

---

### 7. Skills Management Page

**URL:** `/admin/skills`

**Simple List with Inline Editing:**

```
┌─────────────────────────────────────────────────────┐
│  Skills                                  [+ Add Skill]│
├─────────────────────────────────────────────────────┤
│  🔍 Search | Category ▼                              │
├─────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────┐  │
│  │ Name           │ Category    │ Mechs │ ⚡    │  │
│  ├──────────────────────────────────────────────┤  │
│  │ Oil Change     │ Maintenance │  35   │ [✏️🗑️] │  │
│  │ Brake Repair   │ Brakes      │  28   │ [✏️🗑️] │  │
│  │ ... more rows ...                             │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Add/Edit Modal:**
- Name (text input)
- Category (text input or dropdown)
- Save/Cancel buttons

---

### 8. Admin Users Page

**URL:** `/admin/users`

**Table Layout:**

```
┌─────────────────────────────────────────────────────┐
│  Admin Users                            [+ Add User]  │
├─────────────────────────────────────────────────────┤
│  🔍 Search | Role ▼ | Status ▼                       │
├─────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────┐  │
│  │ Name     │ Email   │ Role │ Last Login │ ⚡  │  │
│  ├──────────────────────────────────────────────┤  │
│  │ John Doe │ john... │ ADMIN│ 2h ago     │ [...] │  │
│  │ ... more rows ...                             │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Create/Edit Form (Modal):**
- Name
- Email
- Password (create only, optional on edit)
- Role (dropdown)
- Active toggle

---

### 9. Login Page

**URL:** `/admin/login`

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│                                                      │
│              ┌───────────────────────┐              │
│              │                       │              │
│              │  [Logo]               │              │
│              │                       │              │
│              │  Admin Login          │              │
│              │                       │              │
│              │  Email:               │              │
│              │  [____________]       │              │
│              │                       │              │
│              │  Password:            │              │
│              │  [____________]       │              │
│              │                       │              │
│              │  ☐ Remember me        │              │
│              │                       │              │
│              │  [Login Button]       │              │
│              │                       │              │
│              │  Forgot password?     │              │
│              │                       │              │
│              └───────────────────────┘              │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Email input (with validation)
- Password input (toggle visibility)
- Remember me checkbox
- Login button (loading state)
- Forgot password link
- Error messages inline
- Rate limit warning

---

## Component Library

### 1. Status Badge

**Usage:** Display service request status

**Variants:**
- PENDING (orange)
- AUTHORIZED (cyan)
- CAPTURED (green)
- FINALIZED (purple)
- CANCELLED (gray)
- FAILED (red)

**Props:**
- `status`: string (enum)
- `size`: 'sm' | 'md' | 'lg'

**Example:**
```html
<status-badge [status]="'AUTHORIZED'" [size]="'md'"></status-badge>
```

---

### 2. Data Table

**Features:**
- Sortable columns (click header)
- Filterable (dropdown/search)
- Pagination
- Row selection (checkboxes)
- Bulk actions
- Responsive (horizontal scroll on mobile)
- Export to CSV

**Props:**
- `columns`: ColumnDefinition[]
- `data`: any[]
- `loading`: boolean
- `pagination`: PaginationConfig
- `actions`: ActionDefinition[]

---

### 3. Confirm Dialog

**Usage:** Confirm destructive actions

**Props:**
- `title`: string
- `message`: string
- `confirmText`: string (default: "Confirm")
- `cancelText`: string (default: "Cancel")
- `confirmColor`: 'danger' | 'primary' | 'warning'

**Example:**
```typescript
this.dialog.open(ConfirmDialogComponent, {
  title: 'Delete Mechanic',
  message: 'Are you sure you want to delete this mechanic? This cannot be undone.',
  confirmText: 'Delete',
  confirmColor: 'danger'
});
```

---

### 4. Image Upload

**Features:**
- Drag & drop
- File browser
- Preview with crop
- Size/type validation
- Progress indicator
- Remove button

**Props:**
- `maxSize`: number (MB)
- `accept`: string[] (mime types)
- `maxFiles`: number
- `previewMode`: 'thumbnail' | 'full'

---

### 5. Stats Card

**Layout:**

```
┌──────────────────┐
│  Icon            │
│  1,523           │
│  Total Requests  │
│  ↑ 12% vs last m │
└──────────────────┘
```

**Props:**
- `title`: string
- `value`: string | number
- `icon`: string
- `trend`: { value: number, direction: 'up' | 'down' }
- `color`: string

---

### 6. Page Header

**Layout:**

```
┌─────────────────────────────────────────┐
│  Page Title                   [Actions] │
│  Subtitle or breadcrumbs                │
└─────────────────────────────────────────┘
```

**Props:**
- `title`: string
- `subtitle`: string
- `actions`: ActionButton[]
- `breadcrumbs`: Breadcrumb[]

---

### 7. Loading Spinner

**Variants:**
- Page loader (full screen overlay)
- Component loader (centered in container)
- Button loader (inline)

---

### 8. Toast Notifications

**Positions:**
- Top right (default)
- Top center
- Bottom right

**Types:**
- Success (green)
- Error (red)
- Warning (orange)
- Info (blue)

**Features:**
- Auto-dismiss (configurable timeout)
- Close button
- Action button (optional)
- Stack multiple toasts

---

## Responsive Design

### Desktop (≥ 1200px)

- Sidebar always visible
- Multi-column layouts
- Hover states enabled
- Tooltips on icons

### Tablet (768px - 1199px)

- Collapsible sidebar (hamburger)
- Two-column layouts
- Touch-friendly buttons (min 44px)

### Mobile (< 768px)

- Drawer sidebar (overlay)
- Single column layouts
- Stacked cards
- Simplified tables (horizontal scroll or card view)
- Bottom action bar for primary actions
- Reduced padding/margins

### Responsive Table Options

**Option 1: Horizontal Scroll**
- Table scrolls horizontally
- Sticky first column

**Option 2: Card View**
- Each row becomes a card
- Vertical layout of fields

---

## Accessibility

### WCAG 2.1 AA Compliance

**Color Contrast:**
- Text: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum

**Keyboard Navigation:**
- All interactive elements focusable
- Tab order logical
- Skip links for main content
- Escape to close modals/dropdowns

**Screen Readers:**
- Proper ARIA labels
- Form labels associated
- Error messages announced
- Loading states announced

**Focus Indicators:**
- Visible focus outline (2px, high contrast)
- Never remove without alternative

**Forms:**
- Required fields marked
- Error messages descriptive
- Inline validation
- Success confirmation

---

## Animations & Transitions

### Page Transitions

- Fade in on load (200ms)
- Slide in for sidebars (300ms)

### Micro-interactions

- Button hover (100ms ease)
- Card hover elevation (200ms ease)
- Dropdown expand (150ms ease-out)
- Toast slide in (300ms ease-out)

### Loading States

- Skeleton screens (no spinners for content)
- Progress bars for file uploads
- Button loading spinners

**Performance:**
- Use CSS transforms (GPU accelerated)
- Avoid layout thrashing
- Debounce search inputs
- Virtualize long lists

---

## Empty States

**Guidelines:**
- Friendly illustration or icon
- Helpful message
- Primary action button
- Secondary help link

**Examples:**

**No Service Requests:**
```
  [Icon]
  No service requests yet
  Service requests will appear here once customers submit them.
  [Create Test Request]
```

**No Search Results:**
```
  [Icon]
  No results found for "search term"
  Try adjusting your filters or search term.
  [Clear Filters]
```

---

## Error States

**Network Error:**
```
  [Icon]
  Connection error
  Unable to load data. Please check your internet connection.
  [Retry]
```

**Permission Error:**
```
  [Icon]
  Access denied
  You don't have permission to access this resource.
  [Contact Admin]
```

**404 Page:**
```
  [Icon]
  Page not found
  The page you're looking for doesn't exist.
  [Go to Dashboard]
```

---

## Form Validation

**Inline Validation:**
- Show error on blur
- Show success on valid input
- Don't validate until first blur

**Error Messages:**
- Specific and actionable
- Below input field
- Red text + icon

**Success States:**
- Green checkmark icon
- Optional success message

**Examples:**

❌ "Invalid input"  
✅ "Email must be a valid format (e.g., user@example.com)"

❌ "Password error"  
✅ "Password must be at least 12 characters"

---

## Loading States

### Skeleton Screens

Use for:
- Table rows
- Cards
- Form fields

**Benefits:**
- Better perceived performance
- Reduces layout shift
- Provides content structure preview

### Progress Indicators

Use for:
- File uploads
- Multi-step processes
- Long-running operations

---

## Modal Dialogs

**Best Practices:**
- Close on ESC key
- Close on backdrop click (non-critical)
- Trap focus inside modal
- Return focus to trigger element on close
- Max width: 600px (forms), 800px (content)
- Mobile: Full screen on small devices

**Types:**

1. **Confirm Dialog** (300px)
   - Title
   - Message
   - Cancel + Confirm buttons

2. **Form Modal** (600px)
   - Title
   - Form fields
   - Cancel + Save buttons
   - Scroll if needed

3. **Content Modal** (800px)
   - Title
   - Content area (scrollable)
   - Actions footer

---

## Icons

**Icon Library:** Heroicons or Material Icons

**Usage:**
- 16px: Inline with text
- 20px: Buttons, form inputs
- 24px: Page headers, cards
- 32px: Empty states, dialogs

**Consistency:**
- Same style throughout (outline or solid)
- Same stroke width
- Proper alignment with text

---

## Best Practices Summary

### Do's ✅
- Use consistent spacing (8px grid)
- Provide immediate feedback
- Show loading states
- Validate forms inline
- Use descriptive error messages
- Implement keyboard shortcuts
- Support dark mode (optional)
- Cache API responses
- Debounce search inputs
- Lazy load images
- Virtualize long lists

### Don'ts ❌
- Don't remove focus indicators
- Don't use spinners for everything
- Don't hide critical information
- Don't make users confirm twice
- Don't use jargon in error messages
- Don't auto-refresh without indication
- Don't break browser back button
- Don't block UI unnecessarily

---

**Document Version:** 1.0  
**Last Updated:** December 25, 2025

