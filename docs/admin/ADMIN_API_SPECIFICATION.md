# Admin API Specification

## Overview

This document provides detailed API specifications for all admin endpoints, including request/response schemas, validation rules, error codes, and example payloads.

---

## Table of Contents

1. [Authentication API](#authentication-api)
2. [Service Requests API](#service-requests-api)
3. [Mechanics API](#mechanics-api)
4. [Reviews API](#reviews-api)
5. [Skills API](#skills-api)
6. [Analytics API](#analytics-api)
7. [Admin Users API](#admin-users-api)
8. [Error Codes](#error-codes)
9. [Rate Limiting](#rate-limiting)

---

## Base URL

```
Development: http://localhost:3000/admin
Production: https://api.mechanicdispatch.com/admin
```

## Authentication

All endpoints (except login) require JWT authentication:

```
Authorization: Bearer <access_token>
```

---

## Authentication API

### POST /admin/auth/login

Authenticate admin user and receive JWT tokens.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "SecurePassword123!"
}
```

**Validation:**
- `email`: Required, valid email format
- `password`: Required, min 8 characters

**Success Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clx123abc",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN",
    "lastLoginAt": "2025-12-25T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials
  ```json
  {
    "statusCode": 401,
    "message": "Invalid email or password",
    "error": "Unauthorized"
  }
  ```
- `429 Too Many Requests`: Rate limit exceeded
  ```json
  {
    "statusCode": 429,
    "message": "Too many login attempts. Please try again in 15 minutes."
  }
  ```

---

### POST /admin/auth/logout

Invalidate refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### POST /admin/auth/refresh

Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired refresh token

---

### GET /admin/auth/profile

Get current authenticated admin user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "id": "clx123abc",
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "ADMIN",
  "isActive": true,
  "lastLoginAt": "2025-12-25T10:30:00.000Z",
  "createdAt": "2025-01-15T08:00:00.000Z"
}
```

---

## Service Requests API

### GET /admin/service-requests

List all service requests with filtering, sorting, and pagination.

**Query Parameters:**
- `page` (number, default: 1): Page number
- `limit` (number, default: 20, max: 100): Items per page
- `sortBy` (string, default: "createdAt"): Field to sort by
  - Options: `createdAt`, `updatedAt`, `amountCents`, `status`
- `order` (string, default: "desc"): Sort order
  - Options: `asc`, `desc`
- `status` (string): Filter by status
  - Options: `PENDING`, `AUTHORIZED`, `CAPTURED`, `CANCELLED`, `FAILED`, `FINALIZED`
- `search` (string): Search by customer name, email, or phone
- `startDate` (ISO date): Filter by created date (from)
- `endDate` (ISO date): Filter by created date (to)
- `minAmount` (number): Filter by minimum amount in cents
- `maxAmount` (number): Filter by maximum amount in cents

**Example Request:**
```
GET /admin/service-requests?page=1&limit=20&status=AUTHORIZED&sortBy=createdAt&order=desc
```

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "clx456def",
      "createdAt": "2025-12-25T09:00:00.000Z",
      "updatedAt": "2025-12-25T09:15:00.000Z",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "555-123-4567",
      "addressLine1": "123 Main St",
      "addressLine2": "Apt 4B",
      "city": "Austin",
      "state": "TX",
      "postalCode": "78701",
      "country": "US",
      "vehicleMake": "Toyota",
      "vehicleModel": "Camry",
      "vehicleYear": 2020,
      "amountCents": 6000,
      "finalAmountCents": null,
      "status": "AUTHORIZED",
      "stripePaymentIntentId": "pi_abc123",
      "stripeCustomerId": "cus_xyz789",
      "workLogsCount": 0,
      "reviewsCount": 0
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

### GET /admin/service-requests/:id

Get single service request with all relations.

**Success Response (200):**
```json
{
  "id": "clx456def",
  "createdAt": "2025-12-25T09:00:00.000Z",
  "updatedAt": "2025-12-25T09:15:00.000Z",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "555-123-4567",
  "addressLine1": "123 Main St",
  "addressLine2": "Apt 4B",
  "city": "Austin",
  "state": "TX",
  "postalCode": "78701",
  "country": "US",
  "vehicleMake": "Toyota",
  "vehicleModel": "Camry",
  "vehicleYear": 2020,
  "amountCents": 6000,
  "finalAmountCents": null,
  "status": "AUTHORIZED",
  "stripePaymentIntentId": "pi_abc123",
  "finalPaymentIntentId": null,
  "stripeCustomerId": "cus_xyz789",
  "stripePaymentMethodId": "pm_card_visa",
  "workLogs": [
    {
      "id": "clx789ghi",
      "createdAt": "2025-12-25T11:00:00.000Z",
      "mechanicId": "clx111aaa",
      "mechanicName": "Mike Johnson",
      "hoursWorkedMinutes": 120,
      "payoutPercentage": 70,
      "notes": "Oil change completed"
    }
  ],
  "reviews": []
}
```

**Error Responses:**
- `404 Not Found`: Service request not found

---

### PUT /admin/service-requests/:id

Update service request details.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "555-123-4567",
  "addressLine1": "456 Oak Ave",
  "city": "Austin",
  "state": "TX",
  "postalCode": "78701"
}
```

**Success Response (200):**
```json
{
  "id": "clx456def",
  "firstName": "John",
  "lastName": "Doe",
  // ... full updated object
}
```

---

### POST /admin/service-requests/:id/capture

Capture the $60 deposit payment.

**Success Response (200):**
```json
{
  "id": "clx456def",
  "status": "CAPTURED",
  "stripePaymentIntentId": "pi_abc123",
  "amountCents": 6000,
  "updatedAt": "2025-12-25T12:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Payment already captured or invalid status
  ```json
  {
    "statusCode": 400,
    "message": "Payment has already been captured",
    "error": "Bad Request"
  }
  ```
- `402 Payment Required`: Stripe capture failed
  ```json
  {
    "statusCode": 402,
    "message": "Failed to capture payment: Insufficient funds",
    "error": "Payment Required"
  }
  ```

---

### POST /admin/service-requests/:id/cancel

Cancel service request and void authorization.

**Success Response (200):**
```json
{
  "id": "clx456def",
  "status": "CANCELLED",
  "updatedAt": "2025-12-25T12:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Cannot cancel in current status

---

### POST /admin/service-requests/:id/finalize

Finalize service request and charge final amount.

**Request:**
```json
{
  "finalAmountCents": 47500
}
```

**Validation:**
- `finalAmountCents`: Required, positive integer, >= 6000 (deposit amount)

**Success Response (200):**
```json
{
  "id": "clx456def",
  "status": "FINALIZED",
  "finalAmountCents": 47500,
  "finalPaymentIntentId": "pi_final_abc123",
  "updatedAt": "2025-12-25T13:00:00.000Z",
  "chargedAmount": 41500
}
```

**Error Responses:**
- `400 Bad Request`: Invalid status or amount
- `402 Payment Required`: Stripe charge failed

---

### POST /admin/service-requests/:id/work-logs

Add work log to service request.

**Request:**
```json
{
  "mechanicId": "clx111aaa",
  "mechanicName": "Mike Johnson",
  "hoursWorkedMinutes": 120,
  "payoutPercentage": 70,
  "notes": "Oil change and tire rotation completed"
}
```

**Validation:**
- `mechanicId`: Optional, valid mechanic ID
- `mechanicName`: Required if mechanicId not provided
- `hoursWorkedMinutes`: Required, positive integer
- `payoutPercentage`: Required, integer 0-100
- `notes`: Optional, max 1000 characters

**Success Response (201):**
```json
{
  "id": "clx789ghi",
  "serviceRequestId": "clx456def",
  "mechanicId": "clx111aaa",
  "mechanicName": "Mike Johnson",
  "hoursWorkedMinutes": 120,
  "payoutPercentage": 70,
  "notes": "Oil change and tire rotation completed",
  "createdAt": "2025-12-25T14:00:00.000Z"
}
```

---

## Mechanics API

### GET /admin/mechanics

List all mechanics with filtering.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `isActive` (boolean): Filter by active status
- `sortBy` (string, default: "createdAt")
- `order` (string, default: "desc")
- `search` (string): Search by name or location
- `minRating` (number): Filter by minimum rating

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "clx111aaa",
      "name": "Mike Johnson",
      "slug": "mike-johnson",
      "bio": "Experienced mechanic with 15 years...",
      "imageUrl": "/uploads/mechanics/mechanic-123.jpg",
      "location": "Austin, TX",
      "yearsExperience": 15,
      "rating": 4.8,
      "reviewCount": 42,
      "jobsCompleted": 156,
      "sinceYear": 2010,
      "certifications": ["ASE Certified", "Master Technician"],
      "badges": ["Top Rated", "Quick Response"],
      "isActive": true,
      "createdAt": "2025-01-15T08:00:00.000Z",
      "skillsCount": 8
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### GET /admin/mechanics/:id

Get single mechanic with relations.

**Success Response (200):**
```json
{
  "id": "clx111aaa",
  "name": "Mike Johnson",
  "slug": "mike-johnson",
  "bio": "Experienced mechanic...",
  "imageUrl": "/uploads/mechanics/mechanic-123.jpg",
  "location": "Austin, TX",
  "yearsExperience": 15,
  "rating": 4.8,
  "reviewCount": 42,
  "jobsCompleted": 156,
  "sinceYear": 2010,
  "certifications": ["ASE Certified", "Master Technician"],
  "badges": ["Top Rated", "Quick Response"],
  "isActive": true,
  "createdAt": "2025-01-15T08:00:00.000Z",
  "updatedAt": "2025-12-20T10:30:00.000Z",
  "skills": [
    {
      "id": "clx222bbb",
      "name": "Oil Change",
      "category": "Maintenance"
    },
    {
      "id": "clx333ccc",
      "name": "Brake Repair",
      "category": "Brakes"
    }
  ],
  "reviews": [
    {
      "id": "clx444ddd",
      "rating": 5,
      "reviewerName": "Sarah Smith",
      "reviewText": "Excellent service!",
      "createdAt": "2025-12-15T14:00:00.000Z"
    }
  ],
  "workLogs": [
    {
      "id": "clx555eee",
      "serviceRequestId": "clx456def",
      "hoursWorkedMinutes": 120,
      "payoutPercentage": 70,
      "createdAt": "2025-12-10T09:00:00.000Z"
    }
  ]
}
```

---

### POST /admin/mechanics

Create new mechanic.

**Request (multipart/form-data):**
```
name: Mike Johnson
bio: Experienced mechanic with 15 years...
location: Austin, TX
yearsExperience: 15
sinceYear: 2010
certifications: ["ASE Certified", "Master Technician"]
badges: ["Top Rated"]
isActive: true
skillIds: ["clx222bbb", "clx333ccc"]
image: [file]
```

**Validation:**
- `name`: Required, 2-100 characters
- `bio`: Optional, max 5000 characters
- `location`: Required, 2-100 characters
- `yearsExperience`: Required, integer 0-70
- `sinceYear`: Required, integer 1900-current year
- `certifications`: Optional array of strings
- `badges`: Optional array of strings
- `isActive`: Optional boolean, default true
- `skillIds`: Optional array of valid skill IDs
- `image`: Optional, max 5MB, jpeg/png/webp

**Success Response (201):**
```json
{
  "id": "clx111aaa",
  "name": "Mike Johnson",
  "slug": "mike-johnson",
  // ... full mechanic object
}
```

**Error Responses:**
- `400 Bad Request`: Validation failed
- `409 Conflict`: Mechanic with slug already exists

---

### PUT /admin/mechanics/:id

Update mechanic (same format as POST).

---

### DELETE /admin/mechanics/:id

Delete mechanic.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Mechanic deleted successfully"
}
```

**Error Responses:**
- `404 Not Found`: Mechanic not found
- `409 Conflict`: Cannot delete mechanic with active work logs

---

## Reviews API

### GET /admin/reviews

List all reviews with filtering.

**Query Parameters:**
- `page`, `limit`, `sortBy`, `order` (same as other endpoints)
- `mechanicId` (string): Filter by mechanic
- `rating` (number): Filter by exact rating
- `minRating` (number): Filter by minimum rating
- `search` (string): Search in review text or reviewer name
- `startDate`, `endDate`: Filter by creation date

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "clx444ddd",
      "rating": 5,
      "reviewerName": "Sarah Smith",
      "reviewerLocation": "Austin, TX",
      "reviewText": "Excellent service! Very professional...",
      "carModel": "Toyota Camry",
      "carYear": 2020,
      "serviceDescription": "Oil change and inspection",
      "mechanicId": "clx111aaa",
      "mechanicName": "Mike Johnson",
      "serviceRequestId": "clx456def",
      "photoUrls": ["/uploads/reviews/review-1.jpg"],
      "createdAt": "2025-12-15T14:00:00.000Z"
    }
  ],
  "meta": {
    "total": 320,
    "page": 1,
    "limit": 20,
    "totalPages": 16
  }
}
```

---

### GET /admin/reviews/:id

Get single review with relations.

---

### POST /admin/reviews

Create review (multipart/form-data).

**Request:**
```
mechanicId: clx111aaa
rating: 5
reviewerName: Sarah Smith
reviewerLocation: Austin, TX
reviewText: Excellent service!
carModel: Toyota Camry
carYear: 2020
serviceDescription: Oil change
serviceRequestId: clx456def (optional)
photos: [file1, file2]
```

**Validation:**
- `mechanicId`: Required, valid mechanic ID
- `rating`: Required, integer 1-5
- `reviewerName`: Required, 2-100 characters
- `reviewerLocation`: Required, 2-100 characters
- `reviewText`: Required, 10-5000 characters
- `carModel`: Required, 2-100 characters
- `carYear`: Required, integer 1900-current year + 1
- `serviceDescription`: Required, 5-500 characters
- `serviceRequestId`: Optional, valid service request ID
- `photos`: Optional, max 10 files, 5MB each, jpeg/png/webp

---

### PUT /admin/reviews/:id

Update review (same format as POST).

---

### DELETE /admin/reviews/:id

Delete review.

---

## Skills API

### GET /admin/skills

List all skills.

**Query Parameters:**
- `search` (string): Search by name
- `category` (string): Filter by category

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "clx222bbb",
      "name": "Oil Change",
      "category": "Maintenance",
      "mechanicsCount": 35
    },
    {
      "id": "clx333ccc",
      "name": "Brake Repair",
      "category": "Brakes",
      "mechanicsCount": 28
    }
  ],
  "total": 45
}
```

---

### POST /admin/skills

Create skill.

**Request:**
```json
{
  "name": "Transmission Repair",
  "category": "Transmission"
}
```

**Validation:**
- `name`: Required, unique, 2-100 characters
- `category`: Optional, 2-50 characters

**Success Response (201):**
```json
{
  "id": "clx666fff",
  "name": "Transmission Repair",
  "category": "Transmission"
}
```

---

### PUT /admin/skills/:id

Update skill.

---

### DELETE /admin/skills/:id

Delete skill (removes all MechanicSkill relationships).

---

## Analytics API

### GET /admin/analytics/overview

Dashboard overview statistics.

**Success Response (200):**
```json
{
  "totalRequests": 1523,
  "totalRevenue": 91380000,
  "activeMechanics": 42,
  "averageRating": 4.7,
  "monthlyRequests": 127,
  "monthlyRevenue": 7620000,
  "pendingRequests": 15,
  "authorizedRequests": 8,
  "capturedRequests": 18,
  "finalizedRequests": 86,
  "totalReviews": 320
}
```

---

### GET /admin/analytics/revenue

Revenue trend over time.

**Query Parameters:**
- `startDate` (ISO date, required)
- `endDate` (ISO date, required)
- `groupBy` (string, default: "day"): Options: `day`, `week`, `month`

**Success Response (200):**
```json
{
  "data": [
    {
      "date": "2025-12-01",
      "revenue": 180000,
      "count": 3
    },
    {
      "date": "2025-12-02",
      "revenue": 240000,
      "count": 4
    }
  ]
}
```

---

### GET /admin/analytics/requests-trend

Service requests trend over time.

**Query Parameters:**
- `startDate` (ISO date, required)
- `endDate` (ISO date, required)
- `groupBy` (string, default: "day")
- `status` (string, optional): Filter by status

**Success Response (200):**
```json
{
  "data": [
    {
      "date": "2025-12-01",
      "count": 12,
      "status": "CAPTURED"
    },
    {
      "date": "2025-12-01",
      "count": 5,
      "status": "PENDING"
    }
  ]
}
```

---

### GET /admin/analytics/mechanics-performance

Mechanic performance metrics.

**Query Parameters:**
- `limit` (number, default: 10): Top N mechanics
- `sortBy` (string, default: "revenue"): Options: `revenue`, `jobsCompleted`, `rating`

**Success Response (200):**
```json
{
  "data": [
    {
      "mechanicId": "clx111aaa",
      "name": "Mike Johnson",
      "jobsCompleted": 156,
      "rating": 4.8,
      "revenue": 4680000,
      "averageJobValue": 30000
    }
  ]
}
```

---

## Admin Users API

### GET /admin/users

List admin users.

**Query Parameters:**
- `role` (string): Filter by role
- `isActive` (boolean): Filter by active status

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "clx777ggg",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "ADMIN",
      "isActive": true,
      "lastLoginAt": "2025-12-25T10:30:00.000Z",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### POST /admin/users

Create admin user.

**Request:**
```json
{
  "name": "New Admin",
  "email": "newadmin@example.com",
  "password": "SecurePassword123!",
  "role": "MANAGER",
  "isActive": true
}
```

**Validation:**
- `name`: Required, 2-100 characters
- `email`: Required, valid email, unique
- `password`: Required, min 12 characters, must include uppercase, lowercase, number, special char
- `role`: Required, valid enum value
- `isActive`: Optional, default true

**Success Response (201):**
```json
{
  "id": "clx888hhh",
  "name": "New Admin",
  "email": "newadmin@example.com",
  "role": "MANAGER",
  "isActive": true,
  "createdAt": "2025-12-25T15:00:00.000Z"
}
```

---

### PUT /admin/users/:id

Update admin user (password optional).

---

### DELETE /admin/users/:id

Delete admin user (SUPER_ADMIN only).

---

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Validation failed or invalid input |
| 401 | Unauthorized - Missing or invalid authentication token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists or constraint violation |
| 422 | Unprocessable Entity - Semantic validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Unexpected server error |
| 502 | Bad Gateway - External service (Stripe) error |

---

## Rate Limiting

**Login Endpoint:**
- 5 attempts per 15 minutes per IP
- Returns 429 after limit exceeded

**General API:**
- 100 requests per 1 minute per user
- Returns 429 after limit exceeded

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640432400
```

---

## Pagination

All list endpoints support pagination:

**Request:**
```
GET /admin/service-requests?page=2&limit=50
```

**Response:**
```json
{
  "data": [...],
  "meta": {
    "total": 500,
    "page": 2,
    "limit": 50,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": true
  }
}
```

---

## Filtering & Sorting

**Example:**
```
GET /admin/mechanics?isActive=true&minRating=4.5&sortBy=rating&order=desc&search=austin
```

---

## File Uploads

**Supported Formats:**
- Images: jpeg, jpg, png, webp
- Max size: 5MB per file
- Max files: 10 (reviews), 1 (mechanics)

**Response includes file URLs:**
```json
{
  "imageUrl": "/uploads/mechanics/mechanic-clx123abc-1640432400.jpg"
}
```

---

## Webhooks (Future)

Admin actions can trigger webhooks:

**Events:**
- `service_request.captured`
- `service_request.finalized`
- `mechanic.created`
- `review.created`

---

**Document Version:** 1.0  
**Last Updated:** December 25, 2025

