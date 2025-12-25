# Admin Dashboard Architecture

Visual representation of the admin dashboard architecture and data flow.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Mechanic Dispatch System                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────┐         ┌──────────────────────┐       │
│  │  Customer Web App  │         │  Admin Dashboard     │       │
│  │   (Angular 19.2)   │         │   (Angular 19.2)     │       │
│  │                    │         │   + ngx-admin        │       │
│  │  - Request Service │         │   + JWT Auth         │       │
│  │  - View Mechanics  │         │                      │       │
│  │  - Pay Deposit     │         │  - Manage Requests   │       │
│  │  - View Reviews    │         │  - Manage Mechanics  │       │
│  └─────────┬──────────┘         │  - Manage Reviews    │       │
│            │                     │  - View Analytics    │       │
│            │                     └──────────┬───────────┘       │
│            │                                │                    │
│            │ HTTP/REST                      │ HTTP/REST + JWT   │
│            │                                │                    │
│            └────────────┬───────────────────┘                    │
│                         │                                        │
│                         ▼                                        │
│              ┌──────────────────────┐                           │
│              │   NestJS API Server  │                           │
│              │   (Node.js 24+)      │                           │
│              │                      │                           │
│              │  ┌────────────────┐  │                           │
│              │  │ Public Routes  │  │                           │
│              │  │ /mechanics     │  │                           │
│              │  │ /reviews       │  │                           │
│              │  │ /requests      │  │                           │
│              │  └────────────────┘  │                           │
│              │                      │                           │
│              │  ┌────────────────┐  │                           │
│              │  │ Admin Routes   │  │                           │
│              │  │ /admin/auth    │◄─┼─── JWT Authentication    │
│              │  │ /admin/*       │  │     + Guards              │
│              │  └────────────────┘  │                           │
│              │                      │                           │
│              │  ┌────────────────┐  │                           │
│              │  │ Stripe Webhook │  │                           │
│              │  │ /webhooks/...  │◄─┼─── Stripe Events         │
│              │  └────────────────┘  │                           │
│              └──────────┬───────────┘                           │
│                         │                                        │
│                         │ Prisma ORM                            │
│                         │                                        │
│                         ▼                                        │
│              ┌──────────────────────┐                           │
│              │  PostgreSQL Database │                           │
│              │  (v15+)              │                           │
│              │                      │                           │
│              │  - ServiceRequest    │                           │
│              │  - Mechanic          │                           │
│              │  - Review            │                           │
│              │  - Skill             │                           │
│              │  - AdminUser ◄──NEW  │                           │
│              │  - RefreshToken ◄NEW │                           │
│              │  - AuditLog ◄──NEW   │                           │
│              └──────────────────────┘                           │
│                                                                  │
│              ┌──────────────────────┐                           │
│              │  Stripe API          │                           │
│              │  (Payment Processing)│                           │
│              │                      │                           │
│              │  - PaymentIntent     │                           │
│              │  - Customer          │                           │
│              │  - PaymentMethod     │                           │
│              └──────────────────────┘                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Admin Dashboard Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                Admin Dashboard (Angular Application)             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    Admin Layout                            │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │  Header: Logo | Breadcrumbs | Search | User Menu    │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  │  ┌──────────┬──────────────────────────────────────────┐  │ │
│  │  │ Sidebar  │  Main Content Area                       │  │ │
│  │  │          │  ┌────────────────────────────────────┐  │  │ │
│  │  │ - Dash   │  │  Page Header                       │  │  │ │
│  │  │ - Reqs   │  │  Title | Actions                    │  │  │ │
│  │  │ - Mechs  │  ├────────────────────────────────────┤  │  │ │
│  │  │ - Reviews│  │                                     │  │  │ │
│  │  │ - Skills │  │  Page Content                       │  │  │ │
│  │  │ - Users  │  │  (Components, Tables, Forms)        │  │  │ │
│  │  │ - Analyt │  │                                     │  │  │ │
│  │  │ - Settings│ │                                     │  │  │ │
│  │  │          │  │                                     │  │  │ │
│  │  └──────────┴──└────────────────────────────────────┘  │  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Core Services                                             │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │ │
│  │  │ AuthService  │ │ AdminAPI     │ │ Notification │     │ │
│  │  │              │ │ Service      │ │ Service      │     │ │
│  │  │ - login()    │ │ - get()      │ │ - success()  │     │ │
│  │  │ - logout()   │ │ - post()     │ │ - error()    │     │ │
│  │  │ - refresh()  │ │ - put()      │ │ - warning()  │     │ │
│  │  │ - profile()  │ │ - delete()   │ │ - info()     │     │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘     │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Guards & Interceptors                                     │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │ │
│  │  │ AuthGuard    │ │ Auth         │ │ Error        │     │ │
│  │  │              │ │ Interceptor  │ │ Interceptor  │     │ │
│  │  │ - canActivate│ │ - Add JWT    │ │ - Handle 401 │     │ │
│  │  │ - redirect   │ │ - Add headers│ │ - Handle 500 │     │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘     │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Backend API Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   NestJS Backend Architecture                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Admin Module                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Controllers                                          │ │ │
│  │  │  ┌──────────────┬──────────────┬──────────────┐     │ │ │
│  │  │  │ Auth         │ Service Reqs │ Mechanics    │     │ │ │
│  │  │  │ Controller   │ Controller   │ Controller   │     │ │ │
│  │  │  ├──────────────┼──────────────┼──────────────┤     │ │ │
│  │  │  │ Reviews      │ Skills       │ Users        │     │ │ │
│  │  │  │ Controller   │ Controller   │ Controller   │     │ │ │
│  │  │  ├──────────────┴──────────────┴──────────────┤     │ │ │
│  │  │  │ Analytics Controller                        │     │ │ │
│  │  │  └─────────────────────────────────────────────┘     │ │ │
│  │  └──────────────┬───────────────────────────────────────┘ │ │
│  │                 │                                           │ │
│  │                 ▼                                           │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Services (Business Logic)                           │ │ │
│  │  │  ┌──────────────┬──────────────┬──────────────┐     │ │ │
│  │  │  │ AuthService  │ AdminService │ Analytics    │     │ │ │
│  │  │  │              │              │ Service      │     │ │ │
│  │  │  │ - validate   │ - CRUD ops   │ - metrics    │     │ │ │
│  │  │  │ - generate   │ - delegates  │ - trends     │     │ │ │
│  │  │  │   tokens     │   to domain  │ - reports    │     │ │ │
│  │  │  └──────────────┴──────────────┴──────────────┘     │ │ │
│  │  └──────────────┬───────────────────────────────────────┘ │ │
│  │                 │                                           │ │
│  │                 ▼                                           │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Guards & Strategies                                 │ │ │
│  │  │  ┌──────────────┬──────────────┬──────────────┐     │ │ │
│  │  │  │ JWTStrategy  │ JWTAuth      │ Roles        │     │ │ │
│  │  │  │              │ Guard        │ Guard        │     │ │ │
│  │  │  │ - validate   │ - protect    │ - check      │     │ │ │
│  │  │  │   token      │   routes     │   permissions│     │ │ │
│  │  │  └──────────────┴──────────────┴──────────────┘     │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Domain Modules (Existing)                                 │ │
│  │  ┌──────────────┬──────────────┬──────────────┐          │ │
│  │  │ Mechanics    │ Service Reqs │ Stripe       │          │ │
│  │  │ Module       │ Module       │ Module       │          │ │
│  │  │              │              │              │          │ │
│  │  │ - Services   │ - Services   │ - Payment    │          │ │
│  │  │ - Repos      │ - Repos      │   Service    │          │ │
│  │  │ - Entities   │ - Entities   │              │          │ │
│  │  └──────────────┴──────────────┴──────────────┘          │ │
│  └──────────────┬────────────────────────────────────────────┘ │
│                 │                                                │
│                 ▼                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Database Module                                          │  │
│  │  ┌──────────────────────────────────────────────────┐    │  │
│  │  │  PrismaService                                    │    │  │
│  │  │  - Connection management                          │    │  │
│  │  │  - Query execution                                │    │  │
│  │  │  - Transaction handling                           │    │  │
│  │  └──────────────────────────────────────────────────┘    │  │
│  └──────────────┬───────────────────────────────────────────┘  │
│                 │                                                │
│                 ▼                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    Authentication Flow                          │
└────────────────────────────────────────────────────────────────┘

┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│   Admin     │         │   Angular   │         │   NestJS     │
│   User      │         │   Frontend  │         │   Backend    │
└──────┬──────┘         └──────┬──────┘         └──────┬───────┘
       │                       │                        │
       │ 1. Enter email/pass   │                        │
       │──────────────────────>│                        │
       │                       │                        │
       │                       │ 2. POST /admin/auth/login
       │                       │   { email, password }  │
       │                       │───────────────────────>│
       │                       │                        │
       │                       │                        │ 3. Query DB
       │                       │                        │───┐
       │                       │                        │   │
       │                       │                        │<──┘
       │                       │                        │
       │                       │                        │ 4. Hash compare
       │                       │                        │───┐
       │                       │                        │   │
       │                       │                        │<──┘
       │                       │                        │
       │                       │                        │ 5. Generate JWT
       │                       │                        │───┐
       │                       │                        │   │
       │                       │                        │<──┘
       │                       │                        │
       │                       │ 6. Return tokens       │
       │                       │   { accessToken,       │
       │                       │     refreshToken }     │
       │                       │<───────────────────────│
       │                       │                        │
       │                       │ 7. Store in localStorage
       │                       │───┐                    │
       │                       │   │                    │
       │                       │<──┘                    │
       │                       │                        │
       │ 8. Show dashboard     │                        │
       │<──────────────────────│                        │
       │                       │                        │
       │                       │                        │
       │ 9. Request data       │                        │
       │──────────────────────>│                        │
       │                       │                        │
       │                       │ 10. GET /admin/mechanics
       │                       │    Authorization: Bearer token
       │                       │───────────────────────>│
       │                       │                        │
       │                       │                        │ 11. Verify JWT
       │                       │                        │───┐
       │                       │                        │   │
       │                       │                        │<──┘
       │                       │                        │
       │                       │                        │ 12. Execute
       │                       │                        │───┐
       │                       │                        │   │
       │                       │                        │<──┘
       │                       │                        │
       │                       │ 13. Return data        │
       │                       │<───────────────────────│
       │                       │                        │
       │ 14. Display data      │                        │
       │<──────────────────────│                        │
       │                       │                        │

┌────────────────────────────────────────────────────────────────┐
│  Token Refresh Flow (when access token expires)                │
└────────────────────────────────────────────────────────────────┘

       │                       │ 1. GET /admin/data     │
       │                       │    Authorization: expired
       │                       │───────────────────────>│
       │                       │                        │
       │                       │ 2. Return 401          │
       │                       │<───────────────────────│
       │                       │                        │
       │                       │ 3. POST /admin/auth/refresh
       │                       │    { refreshToken }    │
       │                       │───────────────────────>│
       │                       │                        │
       │                       │                        │ 4. Verify refresh
       │                       │                        │───┐
       │                       │                        │   │
       │                       │                        │<──┘
       │                       │                        │
       │                       │                        │ 5. Generate new
       │                       │                        │───┐
       │                       │                        │   │
       │                       │                        │<──┘
       │                       │                        │
       │                       │ 6. Return new token    │
       │                       │<───────────────────────│
       │                       │                        │
       │                       │ 7. Store new token     │
       │                       │───┐                    │
       │                       │   │                    │
       │                       │<──┘                    │
       │                       │                        │
       │                       │ 8. Retry original req  │
       │                       │───────────────────────>│
       │                       │                        │
```

---

## Data Flow: Service Request Management

```
┌────────────────────────────────────────────────────────────────┐
│         Service Request Lifecycle (Admin Dashboard)            │
└────────────────────────────────────────────────────────────────┘

1. CUSTOMER CREATES REQUEST (Public Web App)
   ┌─────────────┐         ┌──────────────┐         ┌──────────┐
   │  Customer   │         │   Backend    │         │ Stripe   │
   └──────┬──────┘         └──────┬───────┘         └────┬─────┘
          │                       │                       │
          │ POST /requests        │                       │
          │──────────────────────>│                       │
          │                       │                       │
          │                       │ Create PaymentIntent  │
          │                       │──────────────────────>│
          │                       │                       │
          │                       │ Return clientSecret   │
          │                       │<──────────────────────│
          │                       │                       │
          │ Return request + secret                       │
          │<──────────────────────│                       │
          │                       │                       │
          │ Confirm payment       │                       │
          │──────────────────────────────────────────────>│
          │                       │                       │
          │                       │ Webhook: authorized   │
          │                       │<──────────────────────│
          │                       │                       │
          │                       │ Update status         │
          │                       │──┐                    │
          │                       │  │                    │
          │                       │<─┘                    │
          │                       │                       │

   STATUS: AUTHORIZED ($60 deposit authorized, card saved)

2. ADMIN CAPTURES PAYMENT
   ┌─────────────┐         ┌──────────────┐         ┌──────────┐
   │   Admin     │         │   Backend    │         │ Stripe   │
   └──────┬──────┘         └──────┬───────┘         └────┬─────┘
          │                       │                       │
          │ POST /admin/service-requests/:id/capture      │
          │──────────────────────>│                       │
          │                       │                       │
          │                       │ Capture PaymentIntent │
          │                       │──────────────────────>│
          │                       │                       │
          │                       │ Return captured       │
          │                       │<──────────────────────│
          │                       │                       │
          │                       │ Update status + cache │
          │                       │   payment method      │
          │                       │──┐                    │
          │                       │  │                    │
          │                       │<─┘                    │
          │                       │                       │
          │ Return updated request                        │
          │<──────────────────────│                       │
          │                       │                       │

   STATUS: CAPTURED ($60 charged to customer)

3. MECHANIC COMPLETES WORK (Admin adds work log)
   ┌─────────────┐         ┌──────────────┐
   │   Admin     │         │   Backend    │
   └──────┬──────┘         └──────┬───────┘
          │                       │
          │ POST /admin/service-requests/:id/work-logs    │
          │   { mechanicId, hours, percentage, notes }    │
          │──────────────────────>│
          │                       │
          │                       │ Create WorkLog
          │                       │──┐
          │                       │  │
          │                       │<─┘
          │                       │
          │ Return work log       │
          │<──────────────────────│
          │                       │

4. ADMIN FINALIZES WITH HIGHER AMOUNT
   ┌─────────────┐         ┌──────────────┐         ┌──────────┐
   │   Admin     │         │   Backend    │         │ Stripe   │
   └──────┬──────┘         └──────┬───────┘         └────┬─────┘
          │                       │                       │
          │ POST /admin/service-requests/:id/finalize     │
          │   { finalAmountCents: 47500 } (e.g. $475)    │
          │──────────────────────>│                       │
          │                       │                       │
          │                       │ Calculate difference  │
          │                       │   $475 - $60 = $415   │
          │                       │──┐                    │
          │                       │  │                    │
          │                       │<─┘                    │
          │                       │                       │
          │                       │ Charge off-session    │
          │                       │   using saved card    │
          │                       │──────────────────────>│
          │                       │                       │
          │                       │ Return success        │
          │                       │<──────────────────────│
          │                       │                       │
          │                       │ Update final amount   │
          │                       │──┐                    │
          │                       │  │                    │
          │                       │<─┘                    │
          │                       │                       │
          │ Return finalized request                      │
          │<──────────────────────│                       │
          │                       │                       │

   STATUS: FINALIZED (Total $475 charged: $60 + $415)

ALTERNATIVE: ADMIN CANCELS REQUEST
   ┌─────────────┐         ┌──────────────┐         ┌──────────┐
   │   Admin     │         │   Backend    │         │ Stripe   │
   └──────┬──────┘         └──────┬───────┘         └────┬─────┘
          │                       │                       │
          │ POST /admin/service-requests/:id/cancel       │
          │──────────────────────>│                       │
          │                       │                       │
          │                       │ Cancel PaymentIntent  │
          │                       │──────────────────────>│
          │                       │                       │
          │                       │ Return cancelled      │
          │                       │<──────────────────────│
          │                       │                       │
          │                       │ Update status         │
          │                       │──┐                    │
          │                       │  │                    │
          │                       │<─┘                    │
          │                       │                       │
          │ Return cancelled request                      │
          │<──────────────────────│                       │
          │                       │                       │

   STATUS: CANCELLED (Authorization voided, no charge)
```

---

## Database Schema (with Admin Models)

```sql
-- Existing Models

ServiceRequest {
  id                    String   PK
  firstName             String
  lastName              String
  email                 String
  phone                 String
  address...            String
  vehicle...            String
  amountCents           Int      (initial $60)
  finalAmountCents      Int?     (after finalize)
  status                Enum     (PENDING → AUTHORIZED → CAPTURED → FINALIZED)
  stripePaymentIntentId String?
  finalPaymentIntentId  String?
  stripeCustomerId      String?
  workLogs              WorkLog[]
  reviews               Review[]
  createdAt             DateTime
  updatedAt             DateTime
}

Mechanic {
  id              String   PK
  name            String
  slug            String   UNIQUE
  bio             Text?
  imageUrl        String?
  location        String
  yearsExperience Int
  rating          Float
  reviewCount     Int
  jobsCompleted   Int
  sinceYear       Int
  certifications  String[]
  badges          String[]
  isActive        Boolean
  skills          MechanicSkill[]
  reviews         Review[]
  workLogs        WorkLog[]
  createdAt       DateTime
  updatedAt       DateTime
}

Review {
  id                String   PK
  mechanicId        String   FK → Mechanic
  serviceRequestId  String?  FK → ServiceRequest
  rating            Int      (1-5)
  reviewerName      String
  reviewerLocation  String
  reviewText        Text
  carModel          String
  carYear           Int
  serviceDescription String
  photoUrls         String[]
  createdAt         DateTime
  updatedAt         DateTime
}

Skill {
  id        String   PK
  name      String   UNIQUE
  category  String?
  mechanics MechanicSkill[]
}

MechanicSkill {
  id         String   PK
  mechanicId String   FK → Mechanic
  skillId    String   FK → Skill
  UNIQUE(mechanicId, skillId)
}

WorkLog {
  id                 String   PK
  serviceRequestId   String   FK → ServiceRequest
  mechanicId         String?  FK → Mechanic
  mechanicName       String
  hoursWorkedMinutes Int
  payoutPercentage   Int
  notes              Text?
  createdAt          DateTime
}

-- NEW Admin Models

AdminUser {
  id            String        PK
  name          String
  email         String        UNIQUE
  passwordHash  String
  role          AdminRole     (SUPER_ADMIN, ADMIN, MANAGER, VIEWER)
  isActive      Boolean
  lastLoginAt   DateTime?
  refreshTokens RefreshToken[]
  createdAt     DateTime
  updatedAt     DateTime
  
  INDEX(email)
}

RefreshToken {
  id        String   PK
  token     String   UNIQUE
  userId    String   FK → AdminUser (CASCADE)
  expiresAt DateTime
  createdAt DateTime
  
  INDEX(userId)
  INDEX(token)
}

AuditLog {
  id         String   PK
  userId     String
  action     String   (CREATE, UPDATE, DELETE)
  resource   String   (mechanic, review, service_request, etc.)
  resourceId String
  changes    JSON?    (old/new values)
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime
  
  INDEX(userId)
  INDEX(resource, resourceId)
  INDEX(createdAt)
}
```

---

## Component Hierarchy

```
AdminLayoutComponent
├── HeaderComponent
│   ├── Logo
│   ├── Breadcrumbs
│   ├── SearchBar
│   ├── NotificationIcon
│   └── UserMenuDropdown
│       ├── Profile
│       ├── Settings
│       └── Logout
│
├── SidebarComponent
│   ├── NavigationItem (Dashboard)
│   ├── NavigationGroup (Service Requests)
│   │   ├── All Requests
│   │   ├── Pending
│   │   └── Authorized
│   ├── NavigationGroup (Mechanics)
│   ├── NavigationGroup (Reviews)
│   ├── NavigationItem (Skills)
│   ├── NavigationItem (Users)
│   └── NavigationGroup (Settings)
│
└── RouterOutlet (Main Content)
    │
    ├── DashboardComponent
    │   ├── StatsCardComponent (x4)
    │   ├── RevenueChartComponent
    │   ├── RequestsTrendChartComponent
    │   └── RecentRequestsTableComponent
    │
    ├── ServiceRequestsListComponent
    │   ├── PageHeaderComponent
    │   ├── FiltersBarComponent
    │   └── DataTableComponent
    │       └── StatusBadgeComponent (in cells)
    │
    ├── ServiceRequestDetailComponent
    │   ├── PageHeaderComponent
    │   ├── TabsComponent
    │   ├── OverviewTabComponent
    │   │   ├── CustomerInfoCard
    │   │   ├── VehicleInfoCard
    │   │   └── QuickStatsCard
    │   ├── PaymentTabComponent
    │   │   ├── PaymentSummaryCard
    │   │   ├── StripeInfoCard
    │   │   └── ActionButtons
    │   ├── WorkLogsTabComponent
    │   │   ├── AddWorkLogButton → WorkLogFormModal
    │   │   └── WorkLogsTable
    │   └── TimelineTabComponent
    │
    ├── MechanicsListComponent
    │   ├── PageHeaderComponent
    │   ├── FiltersBarComponent
    │   ├── ViewToggle (Grid/Table)
    │   └── DataTableComponent or MechanicCardsGrid
    │
    ├── MechanicFormComponent
    │   ├── PageHeaderComponent
    │   ├── FormSection (Basic Info)
    │   ├── FormSection (Experience)
    │   ├── ImageUploadComponent
    │   ├── SkillsMultiSelectComponent
    │   ├── ArrayInputComponent (Certifications)
    │   ├── ArrayInputComponent (Badges)
    │   └── FormActions
    │
    ├── ReviewsListComponent
    │   ├── PageHeaderComponent
    │   ├── FiltersBarComponent
    │   └── DataTableComponent
    │
    ├── ReviewFormComponent
    │   ├── PageHeaderComponent
    │   ├── FormSection (Review Details)
    │   ├── StarRatingComponent
    │   ├── ImageUploadComponent (Multiple)
    │   └── FormActions
    │
    ├── SkillsListComponent
    │   ├── PageHeaderComponent
    │   └── DataTableComponent
    │       └── InlineEditComponent
    │
    └── UsersListComponent
        ├── PageHeaderComponent
        └── DataTableComponent
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Production Environment                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐         ┌──────────────────────┐     │
│  │   admin.domain.com   │         │   api.domain.com     │     │
│  │   (Vercel/Netlify)   │         │   (AWS/Heroku/...)   │     │
│  │                      │         │                      │     │
│  │  Angular SPA (built) │         │  NestJS Server       │     │
│  │  + Static Assets     │         │  (Node.js)           │     │
│  │                      │         │                      │     │
│  │  HTTPS ✅            │         │  HTTPS ✅            │     │
│  │  CDN ✅              │         │  Rate Limiting ✅     │     │
│  └──────────┬───────────┘         └──────────┬───────────┘     │
│             │                                │                   │
│             │ API Calls (JWT)                │                   │
│             └────────────────────────────────┘                   │
│                                                                  │
│  ┌──────────────────────┐         ┌──────────────────────┐     │
│  │   PostgreSQL (RDS)   │         │   Redis (Optional)   │     │
│  │   (AWS/DO/Railway)   │         │   (Caching)          │     │
│  │                      │         │                      │     │
│  │  - Automated backups │         │  - Session storage   │     │
│  │  - Replication ✅     │         │  - Rate limit cache  │     │
│  │  - Encryption ✅      │         │                      │     │
│  └──────────────────────┘         └──────────────────────┘     │
│                                                                  │
│  ┌──────────────────────┐         ┌──────────────────────┐     │
│  │   Sentry             │         │   CloudWatch/        │     │
│  │   (Error Tracking)   │         │   Datadog            │     │
│  │                      │         │   (Monitoring)       │     │
│  └──────────────────────┘         └──────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Security Layers:
  ✅ HTTPS/SSL Certificates
  ✅ JWT Authentication
  ✅ Rate Limiting (per IP, per user)
  ✅ CORS (whitelist admin domain)
  ✅ Input Validation (class-validator)
  ✅ SQL Injection Protection (Prisma)
  ✅ XSS Protection (Angular sanitization)
  ✅ CSRF Tokens
  ✅ Encrypted Database Connections
  ✅ Audit Logging
```

---

## Technology Stack Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                       Technology Stack                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Frontend                    Backend                             │
│  ┌─────────────────┐        ┌─────────────────┐                │
│  │ Angular 19.2    │        │ NestJS 11+      │                │
│  │ TypeScript 5.7  │        │ TypeScript 5.7  │                │
│  │ ngx-admin       │        │ Node.js 24+     │                │
│  │ RxJS 7.8        │        │ Prisma 6.18     │                │
│  │ ng2-charts      │        │ Passport JWT    │                │
│  │                 │        │ bcrypt          │                │
│  └─────────────────┘        └─────────────────┘                │
│                                                                  │
│  Database                    External Services                  │
│  ┌─────────────────┐        ┌─────────────────┐                │
│  │ PostgreSQL 15+  │        │ Stripe API      │                │
│  │ Prisma ORM      │        │ Sentry          │                │
│  │                 │        │ CloudWatch      │                │
│  └─────────────────┘        └─────────────────┘                │
│                                                                  │
│  Development Tools           Deployment                         │
│  ┌─────────────────┐        ┌─────────────────┐                │
│  │ pnpm            │        │ Vercel/Netlify  │                │
│  │ Angular CLI     │        │ AWS/Heroku      │                │
│  │ NestJS CLI      │        │ Docker          │                │
│  │ Prisma Studio   │        │ GitHub Actions  │                │
│  │ Jest            │        │                 │                │
│  └─────────────────┘        └─────────────────┘                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

**Document Version:** 1.0  
**Last Updated:** December 25, 2025  
**Status:** Reference Architecture

