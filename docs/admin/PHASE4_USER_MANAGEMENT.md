# Phase 4: Admin User Management - Implementation Guide

**Status**: 🚧 In Progress  
**Branch**: `phase4`  
**Started**: 2025-12-29

---

## Overview

Add admin user management interface to create, view, update, and delete admin users through the admin dashboard.

### What Already Exists ✅
- ✅ AdminUser model in Prisma schema (id, email, name, passwordHash, role, isActive, etc.)
- ✅ AdminAuthService with JWT authentication
- ✅ JwtAuthGuard for protecting admin routes
- ✅ Password hashing utilities (bcrypt cost 12)

### What We're Adding 🎯
- **Backend**: Admin user CRUD endpoints with filtering/pagination
- **Frontend**: User list view + detail view with user management actions

---

## Phase 4.0: API Contract Design

**File**: `src/domains/admin/users/types.ts`

**Types to Define**:
- `AdminUserListItem` - List view data (excludes passwordHash)
- `AdminUserDetail` - Detail view data (excludes passwordHash)
- `CreateAdminUserDto` - DTO for creating admin users
- `UpdateAdminUserDto` - DTO for updating admin users
- `AdminUserListQuery` - Query params for filtering/pagination
- `AdminUserListResponse` - Paginated response
- `AdminRole` - Type alias (import from auth/types.ts)

---

## Phase 4.1: Backend Implementation

### Step 1: Create Admin Users Service

**File**: `src/domains/admin/users/AdminUsersService.ts`

**Methods**:
```typescript
async list(query: AdminUserListQuery): Promise<AdminUserListResponse>
async getById(id: string): Promise<AdminUserDetail | null>
async create(dto: CreateAdminUserDto): Promise<AdminUserDetail>
async update(id: string, dto: UpdateAdminUserDto): Promise<AdminUserDetail>
async delete(id: string): Promise<void>
```

**Key Requirements**:
- List method supports filtering by role, isActive, search (name/email)
- Pagination with default limit=20, max=100
- Sorting by createdAt, updatedAt, name, email
- Password hashing using validation.hashPassword() for create/update
- Never return passwordHash in responses
- Validate email uniqueness
- Prevent deleting the last super-admin

### Step 2: Create Admin Users Controller

**File**: `src/domains/admin/users/AdminUsersController.ts`

**Endpoints**:
- `GET /admin/users` - List users with filters/pagination
- `GET /admin/users/:id` - Get user by ID
- `POST /admin/users` - Create new admin user
- `PUT /admin/users/:id` - Update admin user
- `DELETE /admin/users/:id` - Delete admin user

**Security**:
- All routes protected with `@UseGuards(JwtAuthGuard)`
- Use DTOs for request validation

### Step 3: Create DTOs

**Directory**: `src/domains/admin/users/dtos/`

**Files**:
- `create-admin-user.dto.ts` - Validation for create
- `update-admin-user.dto.ts` - Validation for update (all fields optional)
- `index.ts` - Export all DTOs

**Validation Rules**:
- email: Required (create), valid email format
- name: Required (create), min 2 chars
- password: Required (create), min 8 chars, validated by validation.validatePassword()
- role: Required (create), one of ['super-admin', 'admin', 'moderator']
- isActive: Optional, boolean

### Step 4: Update Admin Module

**File**: `src/domains/admin/admin.module.ts`

Add:sf
```typescript
import { AdminUsersService } from './users/AdminUsersService';
import { AdminUsersController } from './users/AdminUsersController';

@Module({
  controllers: [
    // ... existing controllers
    AdminUsersController,
  ],
  providers: [
    // ... existing providers
    AdminUsersService,
  ],
})
```

### Step 5: Create index.ts

**File**: `src/domains/admin/users/index.ts`

Export all public types, services, controllers.

---

## Phase 4.2: Frontend Implementation

### Step 1: Create Admin User Model

**File**: `web/src/app/admin/models/admin-user.model.ts`

```typescript
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  failedLoginAttempts: number;
  lastFailedLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AdminRole = 'super-admin' | 'admin' | 'moderator';

export interface AdminUserListItem {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
}

export interface CreateAdminUserRequest {
  email: string;
  name: string;
  password: string;
  role: AdminRole;
  isActive?: boolean;
}

export interface UpdateAdminUserRequest {
  email?: string;
  name?: string;
  password?: string;
  role?: AdminRole;
  isActive?: boolean;
}
```

### Step 2: Create Admin Users Service

**File**: `web/src/app/admin/services/admin-users.service.ts`

**Methods**:
```typescript
getUsers(params?: AdminUserQueryParams): Observable<AdminUserListResponse>
getUserById(id: string): Observable<AdminUser>
createUser(data: CreateAdminUserRequest): Observable<AdminUser>
updateUser(id: string, data: UpdateAdminUserRequest): Observable<AdminUser>
deleteUser(id: string): Observable<void>
```

Uses `HttpClient` to call backend endpoints.

### Step 3: Create Users List Component

**File**: `web/src/app/admin/components/users/users-list.component.ts`

**Features**:
- Table with columns: name, email, role, status (active/inactive), created date
- Filters: role dropdown, active/inactive toggle, search (name/email)
- Pagination controls
- Sorting by column headers
- "Create User" button → navigates to create form
- Row click → navigates to detail view
- Role badges with colors (super-admin=red, admin=blue, moderator=green)
- Status badges (active=green, inactive=gray)

**Template**: `users-list.component.html`  
**Styles**: `users-list.component.scss`  
**Tests**: `users-list.component.spec.ts` (≥15 tests)

### Step 4: Create User Detail Component

**File**: `web/src/app/admin/components/users/user-detail.component.ts`

**Features**:
- User info display: name, email, role, status, created/updated dates
- Security info: failed login attempts, last failed login
- Edit mode: Toggle to edit form
- Edit form fields: name, email, role dropdown, isActive checkbox, password (optional)
- "Save Changes" button (only in edit mode)
- "Delete User" button (with confirmation modal)
- "Cancel" button (exits edit mode or navigates back)
- Prevent deleting yourself
- Prevent deleting last super-admin

**Template**: `user-detail.component.html`  
**Styles**: `user-detail.component.scss`  
**Tests**: `user-detail.component.spec.ts` (≥20 tests)

### Step 5: Create User Create Component

**File**: `web/src/app/admin/components/users/user-create.component.ts`

**Features**:
- Form fields: name, email, password, role dropdown, isActive checkbox
- Validation: email format, password min 8 chars, required fields
- "Create User" button
- "Cancel" button → navigates back to list
- Success → navigates to created user detail view
- Error handling with error messages

**Template**: `user-create.component.html`  
**Styles**: `user-create.component.scss`  
**Tests**: `user-create.component.spec.ts` (≥15 tests)

### Step 6: Update Admin Routes

**File**: `web/src/app/admin/admin.routes.ts`

Add routes:
```typescript
{
  path: 'users',
  component: UsersListComponent,
},
{
  path: 'users/create',
  component: UserCreateComponent,
},
{
  path: 'users/:id',
  component: UserDetailComponent,
},
```

---

## Phase 4.3: Testing

### Backend Tests

**Files**:
1. `src/domains/admin/users/AdminUsersService.spec.ts`
   - Test list() with various filters
   - Test pagination
   - Test sorting
   - Test getById()
   - Test create() with valid/invalid data
   - Test update() with various fields
   - Test delete()
   - Test email uniqueness validation
   - Test password hashing
   - Test preventing deletion of last super-admin

2. `src/domains/admin/users/AdminUsersController.spec.ts`
   - Test all endpoints delegate to service
   - Test error handling (404, 400)
   - Test JWT guard is applied

**Target**: ≥25 tests, ≥85% coverage

### Frontend Tests

**Files**:
1. `web/src/app/admin/services/admin-users.service.spec.ts`
   - Test all HTTP methods
   - Test query parameter building
   - Test error handling

2. Component tests (already listed above)

**Target**: ≥50 tests total, ≥85% coverage

### Integration Tests

**File**: `src/domains/admin/users/admin-users.integration.spec.ts`

**Tests**:
- E2E create → list → get → update → delete flow
- Test authentication (JWT required)
- Test database interactions
- Test validation errors
- Test business rules (e.g., last super-admin protection)

**Note**: Mark with `describe.skip()` for CI if requires seed data

---

## Phase 4.4: Quality Gates

Run all quality checks before merging:

1. **ESLint**: `npm run lint` (backend + frontend)
   - Zero errors required
   - Fix or add ESLint disable pragmas with justification

2. **Build Gates**:
   - Backend: `npm run build`
   - Frontend: `cd web && npm run build`

3. **Test Gates**:
   - Backend unit: `npm test`
   - Frontend unit: `cd web && npm test`
   - Coverage: ≥85% required

4. **CI Pipeline**:
   - All GitHub Actions workflows must pass
   - Database migrations run successfully
   - No integration test failures

5. **Documentation**:
   - Create `PHASE4_COMPLETION_STATUS.md`
   - Create `PHASE4_TEST_SUMMARY.md`
   - Create `PHASE4_QUALITY_GATES.md`

---

## Success Criteria

- [ ] Backend API fully functional with JWT protection
- [ ] All CRUD operations working (create, read, update, delete)
- [ ] Frontend components with full user management UI
- [ ] ≥75 unit tests passing in CI
- [ ] ≥85% code coverage
- [ ] All builds passing
- [ ] ESLint zero errors
- [ ] Password security validated (bcrypt cost 12)
- [ ] Business rules enforced (email uniqueness, last super-admin protection)
- [ ] Documentation complete

---

## Technical Patterns (From Phase 3)

Follow these established patterns:

1. **Module Layout**:
   ```
   src/domains/admin/users/
   ├── types.ts
   ├── AdminUsersService.ts
   ├── AdminUsersController.ts
   ├── dtos/
   │   ├── create-admin-user.dto.ts
   │   ├── update-admin-user.dto.ts
   │   └── index.ts
   ├── *.spec.ts (tests)
   └── index.ts
   ```

2. **File Naming**:
   - Services/Controllers: PascalCase (e.g., `AdminUsersService.ts`)
   - Types: `types.ts`
   - Functions: `functions.ts` (if needed)

3. **Testing**:
   - 80/15/5 pyramid (80% unit, 15% integration, 5% E2E)
   - Test files co-located with source
   - Use TestingModule for NestJS tests
   - Use HttpClientTestingModule for Angular services

4. **Security**:
   - All admin routes use `@UseGuards(JwtAuthGuard)`
   - Never expose passwordHash in responses
   - Hash passwords with bcrypt cost 12
   - Validate input with class-validator DTOs

5. **Code Quality**:
   - Functions ≤50 lines (SOLID principle)
   - Use TypeScript strict mode
   - Parameterized queries (Prisma)
   - ESLint disable pragmas only when necessary with comments

---

## Dependencies

- ✅ Phase 3 complete (service requests management)
- ✅ Admin authentication system (JWT, bcrypt)
- ✅ AdminUser Prisma model
- ✅ Validation utilities (hashPassword, validatePassword, validateEmail)

---

## Next Steps

1. **Create types.ts** with all interface definitions
2. **Implement AdminUsersService** with CRUD methods
3. **Implement AdminUsersController** with REST endpoints
4. **Create DTOs** for validation
5. **Write backend tests** (service + controller)
6. **Create frontend service** (admin-users.service.ts)
7. **Create UI components** (list, detail, create)
8. **Write frontend tests** (service + components)
9. **Run quality gates** (lint, build, test, coverage)
10. **Create completion documentation**

---

**Last Updated**: 2025-12-29
