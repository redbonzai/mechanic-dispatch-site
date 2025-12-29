# Phase 3: Service Request Management - Implementation Guide

**Status**: 🚧 In Progress  
**Branch**: `phase3-service-requests`  
**Started**: 2025-12-29

---

## Overview

Add admin service request management interface to view, filter, and manage service requests through the admin dashboard.

### What Already Exists ✅
- ✅ Customer-facing API: `POST /requests`, `POST /requests/:id/capture`, etc.
- ✅ Service request repository and service layer
- ✅ Database schema with ServiceRequest, MechanicWorkLog, Review models

### What We're Adding 🎯
- **Backend**: Admin GET endpoints with filtering/pagination
- **Frontend**: List view + detail view with admin actions

---

## Phase 3.0: API Contract Design ✅ COMPLETE

**Files Created**:
- `src/domains/admin/service-requests/types.ts`

**Types Defined**:
- `AdminServiceRequestListItem` - List view data
- `AdminServiceRequestDetail` - Detail view data
- `WorkLogSummary` - Work log info in detail view
- `ReviewSummary` - Review info in detail view
- `ServiceRequestListQuery` - Query params for filtering
- `ServiceRequestListResponse` - Paginated response

---

## Phase 3.1: Backend Implementation

### Step 1: Create Admin Service Request Service

**File**: `src/domains/admin/service-requests/AdminServiceRequestsService.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import {
  AdminServiceRequestListItem,
  AdminServiceRequestDetail,
  ServiceRequestListQuery,
  ServiceRequestListResponse,
} from './types';

@Injectable()
export class AdminServiceRequestsService {
  constructor(private prisma: PrismaService) {}

  /**
   * List service requests with filtering and pagination.
   */
  async list(query: ServiceRequestListQuery): Promise<ServiceRequestListResponse> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await this.prisma.serviceRequest.count({ where });

    // Get items
    const items = await this.prisma.serviceRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        vehicleMake: true,
        vehicleModel: true,
        vehicleYear: true,
        amountCents: true,
        finalAmountCents: true,
        status: true,
        city: true,
        state: true,
      },
    });

    return {
      items: items as AdminServiceRequestListItem[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get service request by ID with all details.
   */
  async getById(id: string): Promise<AdminServiceRequestDetail | null> {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        workLogs: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            createdAt: true,
            mechanicName: true,
            hoursWorkedMinutes: true,
            payoutPercentage: true,
            notes: true,
          },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            createdAt: true,
            rating: true,
            reviewerName: true,
            reviewText: true,
            mechanicId: true,
          },
        },
      },
    });

    return request as AdminServiceRequestDetail | null;
  }
}
```

### Step 2: Create Admin Service Request Controller

**File**: `src/domains/admin/service-requests/AdminServiceRequestsController.ts`

```typescript
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminServiceRequestsService } from './AdminServiceRequestsService';
import {
  ServiceRequestListQuery,
  ServiceRequestListResponse,
  AdminServiceRequestDetail,
} from './types';

@Controller('admin/service-requests')
@UseGuards(JwtAuthGuard)
export class AdminServiceRequestsController {
  constructor(private readonly service: AdminServiceRequestsService) {}

  @Get()
  async list(@Query() query: ServiceRequestListQuery): Promise<ServiceRequestListResponse> {
    return this.service.list(query);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<AdminServiceRequestDetail> {
    const request = await this.service.getById(id);
    if (!request) {
      throw new Error('Service request not found');
    }
    return request;
  }
}
```

### Step 3: Update Admin Module

**File**: `src/domains/admin/admin.module.ts`

Add imports:
```typescript
import { AdminServiceRequestsController } from './service-requests/AdminServiceRequestsController';
import { AdminServiceRequestsService } from './service-requests/AdminServiceRequestsService';
```

Add to module:
```typescript
controllers: [..., AdminServiceRequestsController],
providers: [..., AdminServiceRequestsService],
```

### Step 4: Write Tests

**File**: `src/domains/admin/service-requests/AdminServiceRequestsService.spec.ts`

**File**: `src/domains/admin/service-requests/AdminServiceRequestsController.spec.ts`

---

## Phase 3.2: Frontend Models

**File**: `web/src/app/admin/models/service-request.model.ts`

```typescript
export interface AdminServiceRequestListItem {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  amountCents: number;
  finalAmountCents: number | null;
  status: ServiceRequestStatus;
  city: string;
  state: string;
}

export interface AdminServiceRequestDetail {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  amountCents: number;
  finalAmountCents: number | null;
  status: ServiceRequestStatus;
  stripePaymentIntentId: string | null;
  finalPaymentIntentId: string | null;
  stripeCustomerId: string | null;
  stripePaymentMethodId: string | null;
  workLogs: WorkLogSummary[];
  reviews: ReviewSummary[];
}

export interface WorkLogSummary {
  id: string;
  createdAt: Date;
  mechanicName: string;
  hoursWorkedMinutes: number;
  payoutPercentage: number;
  notes: string | null;
}

export interface ReviewSummary {
  id: string;
  createdAt: Date;
  rating: number;
  reviewerName: string;
  reviewText: string;
  mechanicId: string;
}

export enum ServiceRequestStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  FINALIZED = 'FINALIZED',
}

export interface ServiceRequestListQuery {
  status?: ServiceRequestStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'status' | 'amountCents';
  sortOrder?: 'asc' | 'desc';
}

export interface ServiceRequestListResponse {
  items: AdminServiceRequestListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

---

## Phase 3.3: Frontend Service

**File**: `web/src/app/admin/services/service-requests.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ServiceRequestListQuery,
  ServiceRequestListResponse,
  AdminServiceRequestDetail,
} from '../models/service-request.model';

@Injectable({
  providedIn: 'root',
})
export class ServiceRequestsService {
  private readonly baseUrl = '/api/admin/service-requests';

  constructor(private http: HttpClient) {}

  list(query?: ServiceRequestListQuery): Observable<ServiceRequestListResponse> {
    const params = this.buildParams(query);
    return this.http.get<ServiceRequestListResponse>(this.baseUrl, { params });
  }

  getById(id: string): Observable<AdminServiceRequestDetail> {
    return this.http.get<AdminServiceRequestDetail>(`${this.baseUrl}/${id}`);
  }

  capture(id: string): Observable<void> {
    return this.http.post<void>(`/api/requests/${id}/capture`, {});
  }

  cancel(id: string): Observable<void> {
    return this.http.post<void>(`/api/requests/${id}/cancel`, {});
  }

  finalize(id: string, finalAmountCents: number): Observable<void> {
    return this.http.post<void>(`/api/requests/${id}/finalize`, { finalAmountCents });
  }

  private buildParams(query?: ServiceRequestListQuery): HttpParams {
    let params = new HttpParams();
    if (!query) return params;

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params = params.set(key, String(value));
      }
    });

    return params;
  }
}
```

---

## Phase 3.4-3.5: Frontend Components

### Service Requests List Component

**File**: `web/src/app/admin/components/service-requests/service-requests-list.component.ts`

Features:
- Table with sortable columns
- Filters (status dropdown, date range, search)
- Pagination controls
- Status badges with colors
- Action buttons (view details)

### Service Request Detail Component

**File**: `web/src/app/admin/components/service-requests/service-request-detail.component.ts`

Features:
- Customer information section
- Vehicle details
- Payment status with timeline
- Work logs table
- Reviews display
- Action buttons (capture, cancel, finalize)

---

## Phase 3.6: Add Routes

**File**: `web/src/app/admin/admin.routes.ts`

```typescript
{
  path: 'service-requests',
  component: ServiceRequestsListComponent,
  canActivate: [AdminAuthGuard],
  title: 'Service Requests - Admin Dashboard',
},
{
  path: 'service-requests/:id',
  component: ServiceRequestDetailComponent,
  canActivate: [AdminAuthGuard],
  title: 'Service Request Detail - Admin Dashboard',
},
```

---

## Testing Checklist

### Backend
- [ ] Unit tests for AdminServiceRequestsService
- [ ] Unit tests for AdminServiceRequestsController
- [ ] Integration test for GET /admin/service-requests
- [ ] Integration test for GET /admin/service-requests/:id
- [ ] Test filtering by status, date range, search
- [ ] Test pagination edge cases
- [ ] Test JWT authentication

### Frontend
- [ ] Unit tests for ServiceRequestsService
- [ ] Unit tests for ServiceRequestsListComponent
- [ ] Unit tests for ServiceRequestDetailComponent
- [ ] Test error handling
- [ ] Test loading states
- [ ] Test pagination controls

### Quality Gates
- [ ] Build passes (no TypeScript errors)
- [ ] Lint passes
- [ ] Tests pass with ≥85% coverage
- [ ] No `any` types in production code
- [ ] All functions ≤50 lines
- [ ] SOLID principles applied

---

## Implementation Order

1. ✅ Create backend types
2. Create backend service with tests
3. Create backend controller with tests
4. Update admin module
5. Create frontend models
6. Create frontend service with tests
7. Create list component with tests
8. Create detail component with tests
9. Add routes
10. Run quality gates
11. Security review
12. Commit and PR

---

## Commit Message Template

```
feat(admin): add service request management UI

Phase 3 implementation for admin service request management.

Backend:
- AdminServiceRequestsService for list and detail queries
- GET /admin/service-requests with filtering, pagination, sorting
- GET /admin/service-requests/:id with work logs and reviews
- JWT authentication on all endpoints

Frontend:
- ServiceRequestsService with HttpClient integration
- ServiceRequestsListComponent with filters and pagination
- ServiceRequestDetailComponent with customer, vehicle, payment info
- Status badges, action buttons (capture, cancel, finalize)
- Responsive design with loading and error states

Testing:
- XX backend tests (unit + integration)
- XX frontend tests (service + components)
- XX% test coverage

Quality:
- Zero any types
- All functions ≤50 lines
- SOLID principles applied
- Production build successful

Co-Authored-By: Warp <agent@warp.dev>
```

---

## Next Steps

Start with backend implementation (service + controller + tests), then move to frontend once backend is complete and tested.
