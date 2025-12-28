# Admin Login Flow - E2E Testing Guide

## Phase 1: TDD Foundation - Manual E2E Testing

This guide provides step-by-step instructions for manually testing the admin authentication flow.

---

## Prerequisites

### 1. Database Setup
Ensure the database has the admin user schema migrated:
```bash
cd /Users/christian/Code/mechanic-dispatch
pnpm prisma migrate dev
```

### 2. Create Test Admin User
```bash
pnpm tsx scripts/create-test-admin.ts
```

**Test Credentials:**
- Email: `admin@test.com`
- Password: `Admin123!`
- Role: `super-admin`

### 3. Start Backend Server
```bash
cd /Users/christian/Code/mechanic-dispatch
pnpm run start:dev
```
Backend should be running on: http://localhost:3000

### 4. Start Frontend Server
```bash
cd /Users/christian/Code/mechanic-dispatch/web
npm start
```
Frontend should be running on: http://localhost:4200

---

## E2E Test Scenarios

### Test Case 1: Successful Login Flow ✅

**Objective:** Verify complete authentication flow from login to authenticated state.

**Steps:**
1. Navigate to http://localhost:4200/admin/login
2. Enter credentials:
   - Email: `admin@test.com`
   - Password: `Admin123!`
3. Click "Sign In" button

**Expected Results:**
- ✅ Form submission triggers login request to `/api/admin/auth/login`
- ✅ Backend returns 200 OK with tokens and user data
- ✅ Tokens stored in localStorage:
  - `admin_access_token`
  - `admin_refresh_token`
- ✅ User data stored in localStorage: `admin_user`
- ✅ Redirect to `/admin/dashboard` (or returnUrl if present)

**How to Verify:**
1. Open browser DevTools (F12)
2. Go to Application → Local Storage → http://localhost:4200
3. Check for keys: `admin_access_token`, `admin_refresh_token`, `admin_user`
4. Network tab should show successful POST to `/api/admin/auth/login`

---

### Test Case 2: Invalid Credentials ❌

**Objective:** Verify proper error handling for invalid login attempts.

**Steps:**
1. Navigate to http://localhost:4200/admin/login
2. Enter invalid credentials:
   - Email: `admin@test.com`
   - Password: `WrongPassword123`
3. Click "Sign In" button

**Expected Results:**
- ✅ Backend returns 401 Unauthorized
- ✅ Error message displayed: "Invalid credentials" or similar
- ✅ No tokens stored in localStorage
- ✅ User remains on login page
- ✅ Form is re-enabled for retry

**How to Verify:**
1. Check Network tab for 401 response
2. Verify error message appears in UI
3. Check localStorage is empty (no tokens)

---

### Test Case 3: Form Validation

**Objective:** Verify client-side form validation.

**3.1 Empty Email:**
1. Leave email field empty
2. Enter password: `Admin123!`
3. Try to submit

**Expected:**
- ✅ Submit button disabled
- ✅ Error message: "Email is required"

**3.2 Invalid Email Format:**
1. Enter email: `notanemail`
2. Enter password: `Admin123!`
3. Try to submit

**Expected:**
- ✅ Error message: "Please enter a valid email address"

**3.3 Password Too Short:**
1. Enter email: `admin@test.com`
2. Enter password: `short`
3. Try to submit

**Expected:**
- ✅ Error message: "Password must be at least 8 characters"

---

### Test Case 4: Loading States

**Objective:** Verify UI loading states during authentication.

**Steps:**
1. Navigate to login page
2. Enter valid credentials
3. Click "Sign In"
4. Observe button and form state

**Expected Results:**
- ✅ Button text changes to "Signing in..."
- ✅ Button becomes disabled
- ✅ Form becomes disabled during request
- ✅ After success/error, form re-enables

---

### Test Case 5: Account Lockout (Backend Security)

**Objective:** Verify account lockout after failed attempts.

**Steps:**
1. Navigate to login page
2. Enter email: `admin@test.com`
3. Enter wrong password 5 times in a row
4. Try to login with correct password on 6th attempt

**Expected Results:**
- ✅ After 5 failed attempts, account is locked
- ✅ 6th attempt returns 401 with message about locked account
- ✅ Account unlocks after 15 minutes (or wait to verify)

---

### Test Case 6: JWT Token Refresh (Advanced)

**Objective:** Verify automatic token refresh on 401 errors.

**Note:** This requires the admin dashboard to be implemented with protected routes.

**Steps:**
1. Login successfully
2. Wait for access token to expire (15 minutes)
3. Make an API request to a protected endpoint
4. Observe automatic token refresh

**Expected Results:**
- ✅ First request returns 401
- ✅ Interceptor automatically calls `/api/admin/auth/refresh`
- ✅ New access token stored in localStorage
- ✅ Original request retried with new token
- ✅ Request succeeds

---

### Test Case 7: Logout Flow

**Objective:** Verify logout clears session.

**Note:** Requires logout functionality to be accessible (button/link).

**Steps:**
1. Login successfully
2. Navigate to admin dashboard
3. Click logout button

**Expected Results:**
- ✅ POST request to `/api/admin/auth/logout`
- ✅ All tokens removed from localStorage
- ✅ User data removed from localStorage
- ✅ Redirect to `/admin/login`

---

### Test Case 8: Protected Route Access

**Objective:** Verify guards prevent unauthorized access.

**Steps:**
1. Without logging in, navigate to http://localhost:4200/admin/dashboard
2. Observe redirect behavior

**Expected Results:**
- ✅ Immediate redirect to `/admin/login`
- ✅ returnUrl query param includes `/admin/dashboard`
- ✅ After login, redirect back to `/admin/dashboard`

---

## Browser Testing Matrix

Test the login flow on multiple browsers:

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest, if on Mac)
- ✅ Edge (latest)

**What to verify:**
- Form renders correctly
- Validation messages display
- Login succeeds
- LocalStorage works
- Redirects work

---

## Testing Checklist

Before marking Phase 1 complete, verify:

### Backend Tests
- [x] AdminAuthService unit tests pass (26 tests)
- [x] AdminAuthController E2E tests pass (24 tests)
- [x] Validation functions tests pass (15 tests)
- [x] Backend builds without errors
- [x] Coverage ≥85%

### Frontend Tests
- [x] AdminAuthService unit tests pass (33 tests)
- [x] AdminAuthGuard tests pass (5 tests)
- [x] JwtInterceptor tests pass (9 tests)
- [x] LoginComponent tests pass (20 tests)
- [x] Frontend builds without errors
- [x] Coverage ≥85% (98.14% achieved)

### Manual E2E Tests
- [ ] Test Case 1: Successful Login ✅
- [ ] Test Case 2: Invalid Credentials ❌
- [ ] Test Case 3: Form Validation
- [ ] Test Case 4: Loading States
- [ ] Test Case 5: Account Lockout
- [ ] Test Case 6: JWT Refresh (when dashboard available)
- [ ] Test Case 7: Logout (when logout button available)
- [ ] Test Case 8: Protected Routes (when dashboard available)

---

## Known Limitations (Phase 1)

1. **No Dashboard UI**: Login redirects to `/admin/dashboard` which doesn't exist yet
2. **No Logout Button**: Logout must be tested via API calls or browser console
3. **No Protected Routes**: Only login page exists, can't fully test guards yet
4. **No Navigation**: Can't test full user journey

These limitations are expected and will be addressed in subsequent phases.

---

## Troubleshooting

### Backend not starting?
```bash
# Check database connection
cd /Users/christian/Code/mechanic-dispatch
pnpm prisma db push

# Check for port conflicts
lsof -i :3000
```

### Frontend not connecting to backend?
- Verify proxy configuration in `web/proxy.conf.json`
- Check CORS settings in backend
- Verify both servers are running

### Can't login?
```bash
# Recreate admin user
cd /Users/christian/Code/mechanic-dispatch
pnpm tsx scripts/create-test-admin.ts
```

### Tokens not storing?
- Check browser localStorage isn't disabled
- Open DevTools → Application → Local Storage
- Try incognito/private browsing mode

---

## Success Criteria

Phase 1 is complete when:

1. ✅ All automated tests pass (93 tests)
2. ✅ Code coverage ≥85% (98.14% achieved)
3. ✅ Backend and frontend build successfully
4. ✅ Manual E2E Test Cases 1-5 verified
5. ✅ Test admin user can login successfully
6. ✅ Errors handled gracefully
7. ✅ Security features work (validation, lockout)

**Status:** Ready for manual E2E verification

---

## Next Steps (Phase 2)

After Phase 1 E2E testing is complete:

1. Implement Admin Dashboard layout
2. Add navigation and logout button
3. Create protected admin routes
4. Implement admin user management
5. Add full E2E testing for dashboard features

---

## Contact

For issues or questions about this testing guide:
- Review test code in `src/domains/admin/auth/`
- Check test strategy: `docs/admin/TEST_STRATEGY.md`
- Review security requirements: `docs/admin/SECURITY_REQUIREMENTS.md`
