import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ServiceRequestsListComponent } from './components/service-requests/service-requests-list.component';
import { ServiceRequestDetailComponent } from './components/service-requests/service-request-detail.component';
import { UsersListComponent } from './components/users/users-list.component';
import { UserDetailComponent } from './components/users/user-detail.component';
import { UserCreateComponent } from './components/users/user-create.component';
import { AdminAuthGuard } from './guards/admin-auth.guard';

/**
 * Admin Feature Routes
 *
 * All routes except /login are protected by AdminAuthGuard.
 * JWT authentication required for dashboard access.
 */
export const adminRoutes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Admin Login - Mechanic Dispatch',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AdminAuthGuard],
    title: 'Admin Dashboard - Mechanic Dispatch',
  },
  {
    path: 'service-requests',
    canActivate: [AdminAuthGuard],
    children: [
      {
        path: '',
        component: ServiceRequestsListComponent,
        title: 'Service Requests - Admin - Mechanic Dispatch',
      },
      {
        path: ':id',
        component: ServiceRequestDetailComponent,
        title: 'Service Request Details - Admin - Mechanic Dispatch',
      },
    ],
  },
  {
    path: 'users',
    canActivate: [AdminAuthGuard],
    children: [
      {
        path: '',
        component: UsersListComponent,
        title: 'Admin Users - Mechanic Dispatch',
      },
      {
        path: 'create',
        component: UserCreateComponent,
        title: 'Create Admin User - Mechanic Dispatch',
      },
      {
        path: ':id',
        component: UserDetailComponent,
        title: 'Admin User Details - Mechanic Dispatch',
      },
    ],
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
