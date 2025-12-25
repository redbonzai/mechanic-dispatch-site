# Admin Dashboard Implementation Plan

## Executive Summary

This document outlines the complete plan for integrating an Angular-based administrative dashboard into the Mechanic Dispatch application. The goal is to create a comprehensive admin interface without introducing new programming languages, maintaining the existing Angular/NestJS stack.

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Technology Stack](#technology-stack)
3. [Recommended Approach](#recommended-approach)
4. [Dashboard Template Evaluation](#dashboard-template-evaluation)
5. [Required Functionality](#required-functionality)
6. [API Requirements](#api-requirements)
7. [Authentication Strategy](#authentication-strategy)
8. [Component Architecture](#component-architecture)
9. [Implementation Roadmap](#implementation-roadmap)
10. [File Structure](#file-structure)

---

## Current State Analysis

### Existing Infrastructure

**Backend (NestJS)**
- ✅ Admin module structure exists (`src/domains/admin/`)
- ✅ Admin controllers for mechanics, reviews, and skills
- ✅ Service layer delegates to MechanicsService
- ✅ Image upload handling with multer
- ✅ Prisma database integration

**Database Schema**
- ✅ ServiceRequest (with status workflow)
- ✅ Mechanic (profiles, ratings, skills)
- ✅ Skill (categorized skills)
- ✅ MechanicSkill (many-to-many relationship)
- ✅ Review (with photos and ratings)
- ✅ MechanicWorkLog (time tracking and payouts)

**Frontend (Angular 19.2)**
- ✅ Customer-facing website (landing, services, request forms)
- ✅ Mechanic profile pages
- ✅ Service request creation
- ✅ Stripe payment integration
- ❌ No admin interface exists yet

### Existing Admin API Endpoints

```
GET    /admin/mechanics           # List mechanics (filter by isActive)
GET    /admin/mechanics/:id       # Get single mechanic
POST   /admin/mechanics           # Create mechanic (with image upload)
PUT    /admin/mechanics/:id       # Update mechanic (with image upload)
DELETE /admin/mechanics/:id       # Delete mechanic

POST   /admin/reviews             # Create review (with photos)
PUT    /admin/reviews/:id         # Update review (with photos)
DELETE /admin/reviews/:id         # Delete review

GET    /admin/skills              # List all skills
```

### Missing API Endpoints (To Be Built)

```
# Service Requests Management
GET    /admin/service-requests           # List all service requests
GET    /admin/service-requests/:id       # Get single service request
PUT    /admin/service-requests/:id       # Update service request
POST   /admin/service-requests/:id/capture    # Capture payment
POST   /admin/service-requests/:id/cancel     # Cancel request
POST   /admin/service-requests/:id/finalize   # Finalize with final amount
POST   /admin/service-requests/:id/work-logs  # Add work log

# Reviews Management (Additional)
GET    /admin/reviews                    # List all reviews
GET    /admin/reviews/:id                # Get single review

# Skills Management (Additional)
POST   /admin/skills                     # Create skill
PUT    /admin/skills/:id                 # Update skill
DELETE /admin/skills/:id                 # Delete skill

# Analytics/Dashboard
GET    /admin/analytics/overview         # Dashboard statistics
GET    /admin/analytics/revenue          # Revenue metrics
GET    /admin/analytics/mechanics        # Mechanic performance

# Authentication (To Be Implemented)
POST   /admin/auth/login                 # Admin login
POST   /admin/auth/logout                # Admin logout
GET    /admin/auth/profile               # Get current admin user
POST   /admin/auth/refresh               # Refresh token

# Users Management (To Be Implemented)
GET    /admin/users                      # List admin users
POST   /admin/users                      # Create admin user
PUT    /admin/users/:id                  # Update admin user
DELETE /admin/users/:id                  # Delete admin user
```

---

## Technology Stack

### Recommended Stack (All Angular)
- **Frontend Framework**: Angular 19.2
- **Admin Template**: ngx-admin (recommended) or Custom Material Design
- **UI Components**: Angular Material or Nebular (if using ngx-admin)
- **State Management**: RxJS + Angular Services (or NgRx if complexity grows)
- **Forms**: Reactive Forms
- **HTTP Client**: Angular HttpClient
- **Authentication**: JWT with HTTP Interceptors
- **Charts**: ng2-charts or ngx-charts
- **File Upload**: ng2-file-upload or custom implementation
- **Routing**: Angular Router with Guards

---

## Recommended Approach

### Option 1: ngx-admin Template (Recommended)

**Pros:**
- ✅ Most popular Angular admin template (25k+ GitHub stars)
- ✅ Built with Angular + Nebular UI components
- ✅ 40+ components, 60+ usage examples
- ✅ Built-in theming, dark mode
- ✅ Responsive design
- ✅ Active maintenance
- ✅ Extensive documentation
- ✅ Dashboard widgets, charts, tables ready to use

**Cons:**
- ⚠️ Adds Nebular dependency (~3MB)
- ⚠️ May require stripping unused features
- ⚠️ Learning curve for Nebular components

**Integration Approach:**
Create `web/src/app/admin/` module as a lazy-loaded route with ngx-admin components.

### Option 2: Custom Angular Material Dashboard

**Pros:**
- ✅ Full control over codebase
- ✅ Angular Material is lightweight
- ✅ Consistent with Angular ecosystem
- ✅ No template bloat

**Cons:**
- ⚠️ More development time
- ⚠️ Need to build all dashboard components from scratch
- ⚠️ More maintenance burden

**Integration Approach:**
Build custom admin module from scratch using Angular Material components.

### **Final Recommendation: ngx-admin**

Given the timeline and requirements, **ngx-admin** is recommended because:
1. Reduces development time by 70-80%
2. Provides production-ready components
3. Excellent foundation that can be customized
4. Active community and documentation
5. Can be integrated as a separate lazy-loaded module

---

## Dashboard Template Evaluation

### ngx-admin Features We'll Use

1. **Dashboard Components**
   - Cards for key metrics (total requests, active mechanics, revenue)
   - Charts for trends (requests over time, mechanic performance)
   - Tables for recent activities

2. **Data Tables**
   - Service requests listing with sorting, filtering, pagination
   - Mechanics management table
   - Reviews moderation table
   - Skills management table

3. **Forms**
   - Create/edit mechanic profiles
   - Create/edit reviews
   - Service request management
   - Skill management
   - Admin user management

4. **Navigation**
   - Sidebar menu
   - Top navigation bar
   - Breadcrumbs

5. **UI Components**
   - Cards
   - Modals
   - Notifications/toasts
   - Progress bars
   - Status badges
   - Action buttons

---

## Required Functionality

### 1. Dashboard/Analytics View
- **Overview Cards**
  - Total service requests (all time, this month)
  - Active service requests count
  - Total mechanics (active/inactive)
  - Revenue metrics (total, this month)
  - Average rating
  
- **Charts**
  - Service requests trend (line chart)
  - Revenue trend (bar chart)
  - Requests by status (pie chart)
  - Top-performing mechanics (horizontal bar)
  
- **Recent Activity**
  - Latest service requests (table)
  - Recent reviews
  - Pending actions

### 2. Service Requests Management
- **List View**
  - Sortable, filterable table
  - Columns: ID, Customer Name, Vehicle, Status, Amount, Created Date, Actions
  - Filter by status, date range, amount
  - Search by customer name, email, phone
  
- **Detail View**
  - Customer information
  - Vehicle details
  - Service location (map view optional)
  - Payment information
  - Stripe PaymentIntent details
  - Status timeline
  - Work logs
  - Associated reviews
  
- **Actions**
  - Capture payment ($60 deposit)
  - Cancel request
  - Finalize with final amount
  - Add work log
  - Update status manually (if needed)
  - Send notification to customer
  - View in Stripe dashboard (link)

### 3. Mechanics Management
- **List View**
  - Grid or table view toggle
  - Columns: Photo, Name, Location, Rating, Jobs Completed, Active Status, Actions
  - Filter by active status, rating, location
  - Search by name
  
- **Create/Edit Form**
  - Name, slug (auto-generated)
  - Bio (rich text editor optional)
  - Profile image upload with preview
  - Location
  - Years of experience, since year
  - Certifications (array input)
  - Badges (array input)
  - Skills (multi-select)
  - Active status toggle
  
- **Detail View**
  - Profile summary
  - Statistics (rating, reviews, jobs completed)
  - Skills list
  - Reviews for this mechanic
  - Work logs for this mechanic
  - Performance charts

### 4. Reviews Management
- **List View**
  - Table with columns: Reviewer, Mechanic, Rating, Date, Service, Actions
  - Filter by rating, mechanic, date range
  - Search by reviewer name, text content
  - Bulk actions (approve, delete)
  
- **Create/Edit Form**
  - Mechanic (dropdown)
  - Service request (optional dropdown)
  - Reviewer name, location
  - Car model, year
  - Service description
  - Rating (1-5 stars)
  - Review text (textarea)
  - Photos (multi-upload with preview)
  
- **Moderation**
  - Flag inappropriate content
  - Edit review text
  - Delete reviews
  - Feature review on homepage

### 5. Skills Management
- **List View**
  - Simple table: Name, Category, Mechanics Count, Actions
  - Search by name
  - Filter by category
  
- **Create/Edit Form**
  - Name
  - Category (dropdown or text input)
  
- **Bulk Operations**
  - Assign skills to multiple mechanics
  - Merge duplicate skills

### 6. Admin Users Management
- **List View**
  - Table: Name, Email, Role, Last Login, Status, Actions
  - Filter by role, status
  
- **Create/Edit Form**
  - Name, email
  - Password (on create, optional on update)
  - Role (dropdown: admin, manager, viewer)
  - Active status toggle
  
- **Permissions**
  - Role-based access control
  - Admin: full access
  - Manager: cannot manage users
  - Viewer: read-only

### 7. Settings/Configuration
- **General Settings**
  - Company information
  - Contact details
  - Default service amount
  
- **Payment Settings**
  - Stripe configuration (view only)
  - Deposit amount
  - Tax rates
  
- **Notification Settings**
  - Email templates
  - SMS configuration (future)

---

## API Requirements

### Phase 1: Core Admin API (High Priority)

#### 1. Service Requests API
```typescript
// Controller: src/domains/admin/controllers/service-requests.controller.ts

GET    /admin/service-requests
  Query params: ?status=PENDING&search=john&page=1&limit=20&sortBy=createdAt&order=desc
  Response: { data: ServiceRequest[], total: number, page: number, limit: number }

GET    /admin/service-requests/:id
  Response: ServiceRequest with relations (workLogs, reviews)

PUT    /admin/service-requests/:id
  Body: Partial<ServiceRequest>
  Response: ServiceRequest

POST   /admin/service-requests/:id/capture
  Response: ServiceRequest (status changed to CAPTURED)

POST   /admin/service-requests/:id/cancel
  Response: ServiceRequest (status changed to CANCELLED)

POST   /admin/service-requests/:id/finalize
  Body: { finalAmountCents: number }
  Response: ServiceRequest (status changed to FINALIZED)

POST   /admin/service-requests/:id/work-logs
  Body: CreateWorkLogDto
  Response: MechanicWorkLog
```

#### 2. Reviews API (Complete CRUD)
```typescript
// Controller: src/domains/admin/controllers/reviews.controller.ts

GET    /admin/reviews
  Query params: ?mechanicId=xxx&rating=5&page=1&limit=20
  Response: { data: Review[], total: number, page: number, limit: number }

GET    /admin/reviews/:id
  Response: Review with relations (mechanic, serviceRequest)
```

#### 3. Skills API (Complete CRUD)
```typescript
// Controller: src/domains/admin/controllers/skills.controller.ts

POST   /admin/skills
  Body: { name: string, category?: string }
  Response: Skill

PUT    /admin/skills/:id
  Body: { name?: string, category?: string }
  Response: Skill

DELETE /admin/skills/:id
  Response: { success: boolean }
```

#### 4. Analytics API
```typescript
// Controller: src/domains/admin/controllers/analytics.controller.ts

GET    /admin/analytics/overview
  Response: {
    totalRequests: number,
    totalRevenue: number,
    activeMechanics: number,
    averageRating: number,
    monthlyRequests: number,
    monthlyRevenue: number
  }

GET    /admin/analytics/revenue
  Query params: ?startDate=2025-01-01&endDate=2025-12-31&groupBy=month
  Response: { date: string, revenue: number }[]

GET    /admin/analytics/requests-trend
  Query params: ?startDate=2025-01-01&endDate=2025-12-31&groupBy=week
  Response: { date: string, count: number, status: string }[]

GET    /admin/analytics/mechanics-performance
  Response: { mechanicId: string, name: string, jobsCompleted: number, rating: number, revenue: number }[]
```

### Phase 2: Authentication & User Management (High Priority)

#### 5. Authentication API
```typescript
// Controller: src/domains/admin/controllers/auth.controller.ts
// Service: src/domains/admin/services/auth.service.ts

POST   /admin/auth/login
  Body: { email: string, password: string }
  Response: { accessToken: string, refreshToken: string, user: AdminUser }

POST   /admin/auth/logout
  Body: { refreshToken: string }
  Response: { success: boolean }

POST   /admin/auth/refresh
  Body: { refreshToken: string }
  Response: { accessToken: string }

GET    /admin/auth/profile
  Headers: Authorization: Bearer <token>
  Response: AdminUser
```

#### 6. Admin Users API
```typescript
// Controller: src/domains/admin/controllers/users.controller.ts

GET    /admin/users
  Query params: ?role=admin&status=active
  Response: AdminUser[]

POST   /admin/users
  Body: { name: string, email: string, password: string, role: string }
  Response: AdminUser

PUT    /admin/users/:id
  Body: Partial<AdminUser>
  Response: AdminUser

DELETE /admin/users/:id
  Response: { success: boolean }
```

### Phase 3: Advanced Features (Medium Priority)

#### 7. File Management API
```typescript
GET    /admin/uploads
  Query params: ?type=mechanic|review&page=1&limit=50
  Response: { data: FileInfo[], total: number }

DELETE /admin/uploads/:filename
  Response: { success: boolean }
```

#### 8. Audit Log API
```typescript
GET    /admin/audit-logs
  Query params: ?userId=xxx&action=UPDATE&resource=mechanic&page=1
  Response: { data: AuditLog[], total: number }
```

---

## Authentication Strategy

### Two Authentication Mechanisms Required

#### 1. Admin User Authentication (Human Users)

**Technology:** JWT (JSON Web Tokens)

**Flow:**
1. Admin logs in with email/password via `/admin/auth/login`
2. Backend validates credentials against AdminUser table (bcrypt)
3. Backend generates JWT access token (short-lived, 15 min) and refresh token (long-lived, 7 days)
4. Frontend stores tokens in httpOnly cookies or localStorage
5. Frontend includes access token in Authorization header for all admin API requests
6. Angular HTTP Interceptor automatically adds token to requests
7. Angular Route Guards protect admin routes
8. Backend middleware verifies JWT on all `/admin/*` endpoints
9. Frontend refreshes access token when expired using refresh token

**Database Schema Addition:**
```prisma
model AdminUser {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  name          String
  email         String   @unique
  passwordHash  String
  role          AdminRole @default(ADMIN)
  isActive      Boolean  @default(true)
  lastLoginAt   DateTime?
  refreshTokens RefreshToken[]
}

enum AdminRole {
  SUPER_ADMIN
  ADMIN
  MANAGER
  VIEWER
}

model RefreshToken {
  id          String    @id @default(cuid())
  token       String    @unique
  userId      String
  expiresAt   DateTime
  createdAt   DateTime  @default(now())
  user        AdminUser @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([token])
}
```

**Implementation:**
- Use `@nestjs/jwt` and `@nestjs/passport`
- Implement JWT strategy with passport
- Create auth guard decorator
- Hash passwords with bcrypt
- Implement rate limiting on login endpoint

#### 2. Machine-to-Machine Authentication (API Integration)

**Technology:** API Keys

**Flow:**
1. Generate API key for each external service/integration
2. External service includes API key in `X-API-Key` header
3. Backend validates API key against ApiKey table
4. Track usage and enforce rate limits per API key

**Database Schema Addition:**
```prisma
model ApiKey {
  id          String    @id @default(cuid())
  name        String
  key         String    @unique
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  expiresAt   DateTime?
  lastUsedAt  DateTime?
  permissions String[]  // e.g., ['read:mechanics', 'write:service-requests']
  
  @@index([key])
}
```

**Use Cases:**
- Stripe webhooks (verify webhook signature + API key)
- Mobile mechanic app (future)
- Third-party integrations
- Automated scripts

**Implementation:**
- Generate cryptographically secure API keys
- Implement API key guard/middleware
- Log API key usage
- Implement rate limiting per key

### Security Best Practices

1. **HTTPS Only:** Enforce HTTPS in production
2. **CORS:** Restrict CORS to admin.yourdomain.com
3. **CSRF Protection:** Implement CSRF tokens for state-changing operations
4. **Rate Limiting:** Use `@nestjs/throttler`
5. **Input Validation:** Use class-validator on all DTOs
6. **SQL Injection:** Prisma handles this, but validate inputs
7. **XSS Protection:** Sanitize user inputs, use Angular's built-in sanitization
8. **Password Policy:** Minimum 12 characters, complexity requirements
9. **Session Management:** Invalidate refresh tokens on logout
10. **Audit Logging:** Log all admin actions

---

## Component Architecture

### Angular Module Structure

```
web/src/app/
├── admin/                              # Admin module (lazy-loaded)
│   ├── admin.module.ts
│   ├── admin-routing.module.ts
│   ├── admin.component.ts              # Admin layout wrapper
│   │
│   ├── core/                           # Core admin services
│   │   ├── guards/
│   │   │   ├── auth.guard.ts           # Route protection
│   │   │   └── role.guard.ts           # Role-based access
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts     # Add JWT to requests
│   │   │   └── error.interceptor.ts    # Global error handling
│   │   ├── services/
│   │   │   ├── auth.service.ts         # Authentication
│   │   │   ├── admin-api.service.ts    # API calls
│   │   │   └── notification.service.ts # Toast notifications
│   │   └── models/
│   │       ├── admin-user.model.ts
│   │       ├── service-request.model.ts
│   │       └── [other models]
│   │
│   ├── shared/                         # Shared admin components
│   │   ├── components/
│   │   │   ├── page-header/
│   │   │   ├── data-table/             # Reusable table component
│   │   │   ├── status-badge/
│   │   │   ├── confirm-dialog/
│   │   │   └── image-upload/
│   │   ├── pipes/
│   │   │   ├── currency.pipe.ts
│   │   │   └── date-time.pipe.ts
│   │   └── directives/
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   ├── login.component.ts
│   │   │   │   ├── login.component.html
│   │   │   │   └── login.component.scss
│   │   │   └── forgot-password/
│   │   │
│   │   ├── dashboard/
│   │   │   ├── dashboard.component.ts
│   │   │   ├── dashboard.component.html
│   │   │   ├── dashboard.component.scss
│   │   │   └── widgets/
│   │   │       ├── stats-card/
│   │   │       ├── revenue-chart/
│   │   │       └── recent-requests/
│   │   │
│   │   ├── service-requests/
│   │   │   ├── service-requests-list/
│   │   │   │   ├── service-requests-list.component.ts
│   │   │   │   ├── service-requests-list.component.html
│   │   │   │   └── service-requests-list.component.scss
│   │   │   ├── service-request-detail/
│   │   │   │   ├── service-request-detail.component.ts
│   │   │   │   ├── service-request-detail.component.html
│   │   │   │   └── components/
│   │   │   │       ├── customer-info/
│   │   │   │       ├── payment-info/
│   │   │   │       ├── work-logs-section/
│   │   │   │       └── status-timeline/
│   │   │   └── service-requests-routing.module.ts
│   │   │
│   │   ├── mechanics/
│   │   │   ├── mechanics-list/
│   │   │   ├── mechanic-form/          # Create/edit
│   │   │   ├── mechanic-detail/
│   │   │   └── mechanics-routing.module.ts
│   │   │
│   │   ├── reviews/
│   │   │   ├── reviews-list/
│   │   │   ├── review-form/
│   │   │   └── reviews-routing.module.ts
│   │   │
│   │   ├── skills/
│   │   │   ├── skills-list/
│   │   │   ├── skill-form/
│   │   │   └── skills-routing.module.ts
│   │   │
│   │   ├── users/                      # Admin users management
│   │   │   ├── users-list/
│   │   │   ├── user-form/
│   │   │   └── users-routing.module.ts
│   │   │
│   │   └── settings/
│   │       ├── general/
│   │       ├── payment/
│   │       └── notifications/
│   │
│   └── layout/
│       ├── admin-layout/
│       │   ├── admin-layout.component.ts
│       │   ├── admin-layout.component.html
│       │   └── admin-layout.component.scss
│       ├── header/
│       │   ├── header.component.ts      # Top nav with user menu
│       │   └── header.component.html
│       └── sidebar/
│           ├── sidebar.component.ts     # Side navigation
│           └── sidebar.component.html
│
├── app.routes.ts                        # Add admin route
└── [existing customer-facing components]
```

### Key Component Responsibilities

#### 1. AdminLayoutComponent
- Wrapper for all admin pages
- Sidebar navigation
- Top header with user menu
- Breadcrumbs
- Handles responsive layout

#### 2. DataTableComponent (Reusable)
- Generic table with sorting, filtering, pagination
- Column configuration
- Row actions
- Bulk selection
- Export functionality

#### 3. ServiceRequestsListComponent
- Uses DataTableComponent
- Custom filters (status, date range, amount)
- Search functionality
- Quick actions (capture, cancel, view)

#### 4. ServiceRequestDetailComponent
- Tabbed interface:
  - Overview (customer, vehicle, location)
  - Payment (Stripe details, amounts, status)
  - Work Logs (add, edit, view)
  - Reviews (if any)
  - Timeline (status changes, actions)
- Action buttons (capture, cancel, finalize)
- Real-time status updates

#### 5. MechanicFormComponent
- Reactive form with validation
- Image upload with preview and crop
- Skills multi-select
- Array inputs for certifications/badges
- Slug auto-generation
- Live preview (optional)

#### 6. DashboardComponent
- Stats cards (metrics)
- Charts (revenue, requests, performance)
- Recent activity tables
- Quick links

---

## Implementation Roadmap

### Phase 0: Preparation & Setup (Week 1)

#### Step 0.1: Project Analysis ✅
- [x] Analyze existing codebase
- [x] Document current API endpoints
- [x] Identify missing API endpoints
- [x] Create comprehensive plan

#### Step 0.2: Template Selection & Evaluation
- [ ] Clone ngx-admin repository
- [ ] Run ngx-admin locally
- [ ] Evaluate components we'll use
- [ ] Create proof-of-concept integration
- [ ] Document customization approach

#### Step 0.3: Database Schema Updates
- [ ] Create AdminUser model in Prisma schema
- [ ] Create RefreshToken model
- [ ] Create ApiKey model (optional for M2M)
- [ ] Create AuditLog model (optional)
- [ ] Generate migration
- [ ] Run migration on local database
- [ ] Update seed file to create initial admin user

#### Step 0.4: Backend Dependencies
- [ ] Install `@nestjs/jwt`
- [ ] Install `@nestjs/passport`
- [ ] Install `passport-jwt`
- [ ] Install `bcrypt` and `@types/bcrypt`
- [ ] Install `@nestjs/throttler` (rate limiting)

### Phase 1: Authentication Implementation (Week 2)

#### Step 1.1: Backend Auth Service
- [ ] Create AdminUser entity
- [ ] Create auth DTOs (LoginDto, RegisterDto, etc.)
- [ ] Create AdminAuthService with:
  - validateUser() - verify email/password
  - login() - generate tokens
  - refresh() - refresh access token
  - logout() - invalidate refresh token
- [ ] Create JWT strategy
- [ ] Create JWT auth guard
- [ ] Create roles decorator and guard
- [ ] Create auth controller with login/logout/refresh endpoints

#### Step 1.2: Backend User Management
- [ ] Create AdminUsersService (CRUD operations)
- [ ] Create admin users controller
- [ ] Add password hashing middleware
- [ ] Implement role-based access control

#### Step 1.3: Frontend Auth Service
- [ ] Create Angular auth service
- [ ] Create login component
- [ ] Create auth interceptor (add JWT to headers)
- [ ] Create error interceptor (handle 401)
- [ ] Create auth guard (protect routes)
- [ ] Create role guard (role-based routing)
- [ ] Implement token storage (httpOnly cookies or localStorage)
- [ ] Implement automatic token refresh

#### Step 1.4: Testing Auth Flow
- [ ] Test login with valid credentials
- [ ] Test login with invalid credentials
- [ ] Test token expiration and refresh
- [ ] Test logout
- [ ] Test protected routes
- [ ] Test role-based access

### Phase 2: Admin Module Setup (Week 2-3)

#### Step 2.1: ngx-admin Integration
- [ ] Install ngx-admin dependencies (Nebular, etc.)
- [ ] Create admin module (lazy-loaded)
- [ ] Create admin routing module
- [ ] Create admin layout component
- [ ] Create header component
- [ ] Create sidebar component
- [ ] Configure theme and styling
- [ ] Add admin route to main app routes

#### Step 2.2: Core Services & Infrastructure
- [ ] Create admin-api.service (base service for API calls)
- [ ] Create notification.service (toast notifications)
- [ ] Create loading.service (global loading indicator)
- [ ] Create models/interfaces for all entities
- [ ] Create shared components:
  - DataTableComponent
  - StatusBadgeComponent
  - ConfirmDialogComponent
  - ImageUploadComponent
  - PageHeaderComponent

### Phase 3: Dashboard & Analytics (Week 3-4)

#### Step 3.1: Backend Analytics API
- [ ] Create AnalyticsController
- [ ] Create AnalyticsService with:
  - getOverview() - dashboard metrics
  - getRevenueTrend() - revenue over time
  - getRequestsTrend() - requests over time
  - getMechanicsPerformance() - mechanic stats
- [ ] Add database queries with Prisma aggregations
- [ ] Add caching for expensive queries (optional)

#### Step 3.2: Frontend Dashboard
- [ ] Create dashboard component
- [ ] Create stats card component
- [ ] Create revenue chart component (using ng2-charts)
- [ ] Create requests trend chart
- [ ] Create recent requests table component
- [ ] Connect to analytics API
- [ ] Add refresh functionality
- [ ] Add date range selector

### Phase 4: Service Requests Management (Week 4-5)

#### Step 4.1: Backend Service Requests API
- [ ] Create AdminServiceRequestsController
- [ ] Create AdminServiceRequestsService with:
  - getServiceRequests() - list with filters, pagination
  - getServiceRequest() - detail with relations
  - updateServiceRequest() - update fields
  - capturePayment() - capture $60 deposit
  - cancelRequest() - cancel request
  - finalizeRequest() - charge final amount
  - addWorkLog() - create work log
- [ ] Add DTOs for all operations
- [ ] Add validation
- [ ] Add error handling
- [ ] Test all endpoints

#### Step 4.2: Frontend Service Requests List
- [ ] Create service-requests-list component
- [ ] Implement data table with:
  - Sorting (by date, amount, status)
  - Filtering (by status, date range)
  - Search (by customer name, email, phone)
  - Pagination
- [ ] Add status badges
- [ ] Add quick action buttons (view, capture, cancel)
- [ ] Add export functionality (CSV)

#### Step 4.3: Frontend Service Request Detail
- [ ] Create service-request-detail component
- [ ] Create customer info section
- [ ] Create vehicle info section
- [ ] Create payment info section (Stripe details)
- [ ] Create work logs section with add form
- [ ] Create status timeline
- [ ] Implement capture payment action
- [ ] Implement cancel request action
- [ ] Implement finalize request modal
- [ ] Add navigation to Stripe dashboard
- [ ] Add edit functionality (if needed)

### Phase 5: Mechanics Management (Week 5-6)

#### Step 5.1: Backend Mechanics API Extensions
- [ ] Update AdminMechanicsController to add pagination
- [ ] Add filters (active status, rating, location)
- [ ] Add search functionality
- [ ] Ensure proper error handling

#### Step 5.2: Frontend Mechanics List
- [ ] Create mechanics-list component
- [ ] Implement data table with sorting, filtering
- [ ] Add grid/list view toggle
- [ ] Add active/inactive filter
- [ ] Add search by name
- [ ] Add create button
- [ ] Add edit/delete/view actions

#### Step 5.3: Frontend Mechanic Form
- [ ] Create mechanic-form component (create/edit)
- [ ] Implement reactive form with validation
- [ ] Add image upload with preview
- [ ] Add skills multi-select dropdown
- [ ] Add array inputs for certifications/badges
- [ ] Implement slug auto-generation
- [ ] Add active status toggle
- [ ] Handle form submission (create/update)
- [ ] Add success/error notifications

#### Step 5.4: Frontend Mechanic Detail
- [ ] Create mechanic-detail component
- [ ] Display profile summary
- [ ] Display statistics (jobs, rating)
- [ ] Display skills list
- [ ] Display reviews for this mechanic
- [ ] Display work logs for this mechanic
- [ ] Add edit button
- [ ] Add deactivate/activate button

### Phase 6: Reviews Management (Week 6-7)

#### Step 6.1: Backend Reviews API Extensions
- [ ] Update AdminReviewsController to add:
  - getReviews() - list with pagination, filters
  - getReview() - detail view
- [ ] Add filters (mechanic, rating, date range)
- [ ] Add search functionality

#### Step 6.2: Frontend Reviews List
- [ ] Create reviews-list component
- [ ] Implement data table
- [ ] Add filters (mechanic, rating, date)
- [ ] Add search functionality
- [ ] Add create button
- [ ] Add edit/delete/view actions
- [ ] Add bulk delete functionality

#### Step 6.3: Frontend Review Form
- [ ] Create review-form component
- [ ] Implement reactive form
- [ ] Add mechanic dropdown (with search)
- [ ] Add service request dropdown (optional)
- [ ] Add star rating input
- [ ] Add photo upload (multiple files)
- [ ] Handle form submission
- [ ] Add preview of review

### Phase 7: Skills Management (Week 7)

#### Step 7.1: Backend Skills API
- [ ] Update AdminSkillsController to add:
  - createSkill()
  - updateSkill()
  - deleteSkill()
- [ ] Add validation
- [ ] Handle cascading deletes properly

#### Step 7.2: Frontend Skills Management
- [ ] Create skills-list component
- [ ] Create simple table (name, category, mechanics count)
- [ ] Add create/edit inline or modal
- [ ] Add delete with confirmation
- [ ] Add search and filter by category

### Phase 8: Admin Users Management (Week 7-8)

#### Step 8.1: Backend Implementation
- [ ] Already covered in Phase 1.2

#### Step 8.2: Frontend Users Management
- [ ] Create users-list component
- [ ] Create user-form component (create/edit)
- [ ] Implement password strength indicator
- [ ] Add role dropdown
- [ ] Add active status toggle
- [ ] Show last login timestamp
- [ ] Add delete with confirmation
- [ ] Restrict access to SUPER_ADMIN role

### Phase 9: Additional Features (Week 8-9)

#### Step 9.1: File Management
- [ ] Create file management page (optional)
- [ ] List all uploaded files
- [ ] Add delete functionality
- [ ] Add bulk delete
- [ ] Show file size and dimensions

#### Step 9.2: Audit Logging
- [ ] Create AuditLog model in Prisma
- [ ] Create audit logging middleware
- [ ] Log all admin actions (create, update, delete)
- [ ] Create audit log viewer page
- [ ] Add filters (user, action, resource, date)

#### Step 9.3: Settings Pages
- [ ] Create general settings page
- [ ] Create payment settings page (Stripe config)
- [ ] Create notification settings page
- [ ] Implement settings save functionality

#### Step 9.4: Notifications
- [ ] Implement toast notifications (success, error, warning)
- [ ] Add loading indicators
- [ ] Add confirmation dialogs for destructive actions

### Phase 10: Testing & Refinement (Week 9-10)

#### Step 10.1: Unit Testing
- [ ] Write unit tests for auth service
- [ ] Write unit tests for admin services
- [ ] Write unit tests for analytics service
- [ ] Write unit tests for Angular components

#### Step 10.2: Integration Testing
- [ ] Write e2e tests for auth flow
- [ ] Write e2e tests for service requests management
- [ ] Write e2e tests for mechanics CRUD
- [ ] Write e2e tests for reviews CRUD

#### Step 10.3: Manual Testing
- [ ] Test all user flows
- [ ] Test error scenarios
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Test browser compatibility
- [ ] Test performance with large datasets

#### Step 10.4: Security Audit
- [ ] Review authentication implementation
- [ ] Review authorization checks
- [ ] Review input validation
- [ ] Review CORS configuration
- [ ] Review rate limiting
- [ ] Test for common vulnerabilities (XSS, CSRF, SQL injection)

#### Step 10.5: Documentation
- [ ] Document API endpoints (Swagger/OpenAPI)
- [ ] Write admin user guide
- [ ] Document deployment process
- [ ] Create video walkthrough (optional)

### Phase 11: Deployment (Week 10)

#### Step 11.1: Production Preparation
- [ ] Set up environment variables for production
- [ ] Configure HTTPS
- [ ] Set up proper CORS
- [ ] Enable rate limiting
- [ ] Set up logging (Winston, Sentry)
- [ ] Set up monitoring (Datadog, New Relic)

#### Step 11.2: Deployment
- [ ] Deploy backend to production
- [ ] Deploy frontend to production
- [ ] Run database migrations
- [ ] Create initial admin user
- [ ] Test production environment
- [ ] Set up automated backups

#### Step 11.3: Post-Deployment
- [ ] Monitor error logs
- [ ] Monitor performance
- [ ] Gather user feedback
- [ ] Create bug fix backlog
- [ ] Plan next iteration

---

## File Structure

### Backend Structure (After Implementation)

```
src/domains/admin/
├── admin.module.ts
├── controllers/
│   ├── index.ts
│   ├── auth.controller.ts              # NEW
│   ├── users.controller.ts             # NEW
│   ├── analytics.controller.ts         # NEW
│   ├── service-requests.controller.ts  # NEW
│   ├── mechanics.controller.ts         # EXISTS
│   ├── reviews.controller.ts           # EXISTS
│   └── skills.controller.ts            # EXISTS
├── services/
│   ├── index.ts
│   ├── admin.service.ts                # EXISTS
│   ├── auth.service.ts                 # NEW
│   ├── users.service.ts                # NEW
│   ├── analytics.service.ts            # NEW
│   └── service-requests.service.ts     # NEW
├── dto/
│   ├── index.ts
│   ├── login.dto.ts                    # NEW
│   ├── create-admin-user.dto.ts        # NEW
│   ├── update-service-request.dto.ts   # NEW
│   └── finalize-request.dto.ts         # NEW
├── entities/
│   ├── admin-user.entity.ts            # NEW
│   └── refresh-token.entity.ts         # NEW
├── guards/
│   ├── jwt-auth.guard.ts               # NEW
│   └── roles.guard.ts                  # NEW
├── strategies/
│   └── jwt.strategy.ts                 # NEW
└── decorators/
    └── roles.decorator.ts              # NEW
```

### Frontend Structure (After Implementation)

```
web/src/app/admin/
├── admin.module.ts
├── admin-routing.module.ts
├── admin.component.ts
├── admin.component.html
├── admin.component.scss
│
├── core/
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── role.guard.ts
│   ├── interceptors/
│   │   ├── auth.interceptor.ts
│   │   └── error.interceptor.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── admin-api.service.ts
│   │   ├── mechanics-api.service.ts
│   │   ├── service-requests-api.service.ts
│   │   ├── reviews-api.service.ts
│   │   ├── skills-api.service.ts
│   │   ├── analytics-api.service.ts
│   │   └── notification.service.ts
│   └── models/
│       ├── admin-user.model.ts
│       ├── service-request.model.ts
│       ├── mechanic.model.ts
│       ├── review.model.ts
│       └── skill.model.ts
│
├── shared/
│   ├── components/
│   │   ├── page-header/
│   │   ├── data-table/
│   │   ├── status-badge/
│   │   ├── confirm-dialog/
│   │   └── image-upload/
│   ├── pipes/
│   └── directives/
│
├── pages/
│   ├── auth/
│   │   └── login/
│   ├── dashboard/
│   ├── service-requests/
│   ├── mechanics/
│   ├── reviews/
│   ├── skills/
│   ├── users/
│   └── settings/
│
└── layout/
    ├── admin-layout/
    ├── header/
    └── sidebar/
```

---

## Next Steps

### Immediate Actions

1. **Review this plan** with the team and get approval
2. **Clone ngx-admin** and evaluate it locally
3. **Create database migrations** for AdminUser, RefreshToken, ApiKey
4. **Set up development environment** for admin module
5. **Begin Phase 1** - Authentication implementation

### Questions to Answer

1. **User Roles:** Do we need more granular roles beyond SUPER_ADMIN, ADMIN, MANAGER, VIEWER?
2. **Permissions:** Should permissions be role-based or permission-based (more granular)?
3. **Audit Logging:** Is audit logging required from day 1 or can it be added later?
4. **API Keys:** Do we need M2M authentication immediately or can it be deferred?
5. **Template Choice:** Final confirmation on ngx-admin vs custom Material design?
6. **Deployment:** Where will the admin dashboard be hosted? Same domain or subdomain?

### Success Metrics

- [ ] Admin users can log in securely
- [ ] All CRUD operations work for mechanics, reviews, skills
- [ ] Service requests can be managed (captured, cancelled, finalized)
- [ ] Dashboard displays accurate metrics and charts
- [ ] All components are responsive
- [ ] No security vulnerabilities
- [ ] Page load time < 2 seconds
- [ ] API response time < 500ms (95th percentile)

---

## Conclusion

This plan provides a comprehensive roadmap for building a fully-featured Angular admin dashboard for the Mechanic Dispatch application. By leveraging ngx-admin and following this phased approach, we can deliver a production-ready admin interface in approximately 10 weeks.

The key advantages of this approach:
- ✅ No new programming languages (pure Angular)
- ✅ Leverages existing NestJS backend
- ✅ Modular and maintainable architecture
- ✅ Secure authentication and authorization
- ✅ Comprehensive feature set
- ✅ Scalable for future enhancements

---

**Document Version:** 1.0  
**Last Updated:** December 25, 2025  
**Author:** AI Assistant  
**Status:** Pending Review

