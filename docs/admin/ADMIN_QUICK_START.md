# Admin Dashboard Quick Start Guide

## Overview

This guide will help you get started with implementing the admin dashboard. Follow these steps to set up the foundation and begin building features.

---

## Prerequisites

- ✅ Node.js 24+ installed
- ✅ pnpm installed
- ✅ Docker running (for database)
- ✅ Existing project cloned and dependencies installed
- ✅ Database running and migrated

---

## Phase 1: Database Schema Setup (Week 1, Day 1-2)

### Step 1: Update Prisma Schema

Add the following models to `prisma/schema.prisma`:

```prisma
// Add these models at the end of the file

model AdminUser {
  id            String          @id @default(cuid())
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  name          String
  email         String          @unique
  passwordHash  String
  role          AdminRole       @default(ADMIN)
  isActive      Boolean         @default(true)
  lastLoginAt   DateTime?
  refreshTokens RefreshToken[]

  @@index([email])
}

enum AdminRole {
  SUPER_ADMIN
  ADMIN
  MANAGER
  VIEWER
}

model RefreshToken {
  id        String    @id @default(cuid())
  token     String    @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime  @default(now())
  user      AdminUser @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
}

model AuditLog {
  id         String   @id @default(cuid())
  createdAt  DateTime @default(now())
  userId     String
  action     String   // CREATE, UPDATE, DELETE
  resource   String   // mechanic, review, service_request
  resourceId String
  changes    Json?    // Store old/new values
  ipAddress  String?
  userAgent  String?

  @@index([userId])
  @@index([resource, resourceId])
  @@index([createdAt])
}
```

### Step 2: Generate Migration

```bash
# Generate migration
pnpm prisma migrate dev --name add_admin_users

# The migration will be created in prisma/migrations/
```

### Step 3: Update Seed File

Add initial admin user to `prisma/seed.ts`:

```typescript
import * as bcrypt from 'bcrypt';

// Add this to your seed file
async function seedAdminUsers() {
  console.log('Seeding admin users...');

  const passwordHash = await bcrypt.hash('Admin123!@#', 10);

  const admin = await prisma.adminUser.create({
    data: {
      name: 'Super Admin',
      email: 'admin@mechanicdispatch.com',
      passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.log(`✅ Created admin user: ${admin.email}`);
  console.log(`   Password: Admin123!@#`);
}

// Add to your main seed function
async function main() {
  // ... existing seed code ...
  await seedAdminUsers();
}
```

### Step 4: Run Seed

```bash
pnpm prisma db seed
```

---

## Phase 2: Backend Authentication Setup (Week 1, Day 3-5)

### Step 1: Install Dependencies

```bash
# In root directory
pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
pnpm add -D @types/passport-jwt @types/bcrypt
```

### Step 2: Create Auth Module Structure

```bash
# Create directories
mkdir -p src/domains/admin/auth
mkdir -p src/domains/admin/auth/dto
mkdir -p src/domains/admin/auth/strategies
mkdir -p src/domains/admin/auth/guards
```

### Step 3: Create DTOs

Create `src/domains/admin/auth/dto/login.dto.ts`:

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

Create `src/domains/admin/auth/dto/auth-response.dto.ts`:

```typescript
export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    lastLoginAt: Date | null;
  };
}
```

### Step 4: Create JWT Strategy

Create `src/domains/admin/auth/strategies/jwt.strategy.ts`:

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
```

### Step 5: Create Auth Guard

Create `src/domains/admin/auth/guards/jwt-auth.guard.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### Step 6: Create Auth Service

Create `src/domains/admin/auth/auth.service.ts`:

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.adminUser.findUnique({
      where: { email: loginDto.email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: '15m' },
    );

    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: '7d' },
    );

    // Store refresh token
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Update last login
    await this.prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLoginAt: new Date(),
      },
    };
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
    return { success: true };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);

      const token = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!token || token.expiresAt < new Date() || !token.user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const accessToken = this.jwtService.sign(
        {
          sub: token.user.id,
          email: token.user.email,
          role: token.user.role,
        },
        { expiresIn: '15m' },
      );

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(userId: string) {
    return this.prisma.adminUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
  }
}
```

### Step 7: Create Auth Controller

Create `src/domains/admin/auth/auth.controller.ts`:

```typescript
import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('admin/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  async logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshAccessToken(refreshToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }
}
```

### Step 8: Update Admin Module

Update `src/domains/admin/admin.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MechanicsModule } from '../mechanics/mechanics.module';
import { DatabaseModule } from '../database/database.module';
import { AdminService } from './services/admin.service';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import {
  AdminMechanicsController,
  AdminReviewsController,
  AdminSkillsController,
} from './controllers';
import { AuthController } from './auth/auth.controller';

@Module({
  imports: [
    MechanicsModule,
    DatabaseModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [
    AuthController,
    AdminMechanicsController,
    AdminReviewsController,
    AdminSkillsController,
  ],
  providers: [AdminService, AuthService, JwtStrategy],
  exports: [AdminService, AuthService],
})
export class AdminModule {}
```

### Step 9: Add Environment Variable

Add to `.env`:

```env
JWT_SECRET=your-very-secure-random-string-change-me
```

### Step 10: Test Authentication

```bash
# Start the server
pnpm run start:dev

# Test login
curl -X POST http://localhost:3000/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mechanicdispatch.com",
    "password": "Admin123!@#"
  }'

# Should return:
# {
#   "accessToken": "eyJhbG...",
#   "refreshToken": "eyJhbG...",
#   "user": { ... }
# }

# Test protected endpoint
curl -X GET http://localhost:3000/admin/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Phase 3: Frontend Admin Module Setup (Week 2, Day 1-3)

### Step 1: Evaluate ngx-admin

```bash
# Clone ngx-admin to evaluate
cd ~/temp
git clone https://github.com/akveo/ngx-admin.git
cd ngx-admin
npm install
npm start

# Open http://localhost:4200 and explore
```

### Step 2: Install Angular Material (Alternative to ngx-admin)

If you decide to use Angular Material instead:

```bash
cd web
ng add @angular/material

# Select theme: Indigo/Pink
# Set up typography: Yes
# Include animations: Yes
```

### Step 3: Create Admin Module Structure

```bash
cd web/src/app

# Create admin module
ng generate module admin --routing

# Create core services
ng generate service admin/core/services/auth
ng generate service admin/core/services/admin-api

# Create guards
ng generate guard admin/core/guards/auth
ng generate guard admin/core/guards/role

# Create interceptors
ng generate interceptor admin/core/interceptors/auth
ng generate interceptor admin/core/interceptors/error

# Create login component
ng generate component admin/pages/auth/login --standalone=false

# Create dashboard component
ng generate component admin/pages/dashboard --standalone=false

# Create layout components
ng generate component admin/layout/admin-layout --standalone=false
ng generate component admin/layout/header --standalone=false
ng generate component admin/layout/sidebar --standalone=false
```

### Step 4: Create Auth Service

Update `web/src/app/admin/core/services/auth.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLoginAt: Date | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/admin/auth';
  private currentUserSubject = new BehaviorSubject<AdminUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Load user from localStorage on init
    const user = this.getUserFromStorage();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          this.setSession(response);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): void {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      this.http.post(`${this.apiUrl}/logout`, { refreshToken }).subscribe();
    }
    this.clearSession();
    this.currentUserSubject.next(null);
    this.router.navigate(['/admin/login']);
  }

  refreshToken(): Observable<{ accessToken: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<{ accessToken: string }>(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(
        tap(response => {
          localStorage.setItem('accessToken', response.accessToken);
        })
      );
  }

  getProfile(): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.apiUrl}/profile`)
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
          this.saveUserToStorage(user);
        })
      );
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem('accessToken', authResult.accessToken);
    localStorage.setItem('refreshToken', authResult.refreshToken);
    this.saveUserToStorage(authResult.user);
  }

  private clearSession(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
  }

  private saveUserToStorage(user: AdminUser): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  private getUserFromStorage(): AdminUser | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  getCurrentUser(): AdminUser | null {
    return this.currentUserSubject.value;
  }
}
```

### Step 5: Create Auth Interceptor

Update `web/src/app/admin/core/interceptors/auth.interceptor.ts`:

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  if (token && req.url.includes('/admin')) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
```

### Step 6: Create Auth Guard

Update `web/src/app/admin/core/guards/auth.guard.ts`:

```typescript
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/admin/login']);
  return false;
};
```

### Step 7: Create Login Component

Update `web/src/app/admin/pages/auth/login/login.component.ts`:

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Invalid email or password';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
```

Update `web/src/app/admin/pages/auth/login/login.component.html`:

```html
<div class="login-container">
  <div class="login-card">
    <div class="login-header">
      <h1>Admin Login</h1>
      <p>Sign in to access the admin dashboard</p>
    </div>

    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          formControlName="email"
          placeholder="admin@example.com"
          [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
        />
        <div class="error-message" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
          <span *ngIf="loginForm.get('email')?.errors?.['required']">Email is required</span>
          <span *ngIf="loginForm.get('email')?.errors?.['email']">Invalid email format</span>
        </div>
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          type="password"
          formControlName="password"
          placeholder="••••••••"
          [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
        />
        <div class="error-message" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
          <span *ngIf="loginForm.get('password')?.errors?.['required']">Password is required</span>
          <span *ngIf="loginForm.get('password')?.errors?.['minlength']">Password must be at least 8 characters</span>
        </div>
      </div>

      <div class="error-message" *ngIf="error">
        {{ error }}
      </div>

      <button type="submit" [disabled]="loginForm.invalid || loading">
        <span *ngIf="!loading">Login</span>
        <span *ngIf="loading">Logging in...</span>
      </button>
    </form>
  </div>
</div>
```

### Step 8: Configure Routes

Update `web/src/app/admin/admin-routing.module.ts`:

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { authGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
```

### Step 9: Update Main Routes

Update `web/src/app/app.routes.ts`:

```typescript
import { Routes } from '@angular/router';
// ... existing imports ...

export const routes: Routes = [
  // ... existing routes ...
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  { path: '**', redirectTo: '' },
];
```

### Step 10: Configure HTTP Interceptors

Update `web/src/app/app.config.ts` (or `main.ts`):

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './admin/core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
```

### Step 11: Test Login Flow

```bash
# Start Angular dev server
cd web
pnpm start

# Open browser to http://localhost:4200/admin/login
# Login with:
#   Email: admin@mechanicdispatch.com
#   Password: Admin123!@#

# Should redirect to /admin/dashboard
```

---

## Next Steps

After completing Phase 1-3, you're ready to:

1. **Build Dashboard Components** (Week 2, Day 4-5)
   - Analytics API backend
   - Dashboard widgets frontend

2. **Build Service Requests Management** (Week 3-4)
   - Service requests API backend
   - List and detail components frontend

3. **Build Mechanics Management** (Week 5-6)
   - Mechanics CRUD frontend
   - Form validation and image upload

4. **Build Reviews & Skills** (Week 6-7)
   - Reviews CRUD
   - Skills management

5. **Testing & Refinement** (Week 8-10)
   - Unit tests
   - E2E tests
   - Performance optimization

---

## Useful Commands

```bash
# Backend
pnpm run start:dev          # Start NestJS in watch mode
pnpm prisma studio          # Open Prisma Studio (database GUI)
pnpm prisma generate        # Regenerate Prisma client
pnpm run test              # Run tests

# Frontend
cd web
pnpm start                  # Start Angular dev server
ng generate component path  # Generate component
ng generate service path    # Generate service
pnpm run test              # Run tests
pnpm run build             # Build for production
```

---

## Troubleshooting

### JWT Secret Not Set
**Error:** "JWT secret not configured"
**Solution:** Add `JWT_SECRET` to `.env` file

### Cannot Connect to Database
**Error:** "Can't reach database server"
**Solution:** Ensure Docker is running: `docker compose up -d`

### Prisma Client Not Generated
**Error:** "@prisma/client did not initialize yet"
**Solution:** Run `pnpm prisma generate`

### CORS Issues
**Error:** "CORS policy blocked"
**Solution:** Add CORS configuration in NestJS `main.ts`:

```typescript
app.enableCors({
  origin: 'http://localhost:4200',
  credentials: true,
});
```

### Token Expired
**Error:** "JWT expired"
**Solution:** Implement token refresh logic (already included in auth service)

---

## Resources

- **NestJS Docs:** https://docs.nestjs.com
- **Angular Docs:** https://angular.dev
- **Prisma Docs:** https://www.prisma.io/docs
- **ngx-admin Demo:** https://akveo.github.io/ngx-admin/
- **Angular Material:** https://material.angular.io

---

## Getting Help

- Check the full implementation plan: `docs/ADMIN_DASHBOARD_PLAN.md`
- Check API specifications: `docs/ADMIN_API_SPECIFICATION.md`
- Check UI specifications: `docs/ADMIN_UI_SPECIFICATION.md`

---

**Document Version:** 1.0  
**Last Updated:** December 25, 2025

