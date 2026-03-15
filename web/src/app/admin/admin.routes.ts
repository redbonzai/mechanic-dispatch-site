import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UsersListComponent } from './components/users/users-list.component';
import { UserDetailComponent } from './components/users/user-detail.component';
import { UserCreateComponent } from './components/users/user-create.component';
import { AdminAuthGuard } from './guards/admin-auth.guard';

export const adminRoutes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Admin Login - FixGuide',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AdminAuthGuard],
    title: 'Admin Dashboard - FixGuide',
  },
  {
    path: 'users',
    canActivate: [AdminAuthGuard],
    children: [
      {
        path: '',
        component: UsersListComponent,
        title: 'Admin Users - FixGuide',
      },
      {
        path: 'create',
        component: UserCreateComponent,
        title: 'Create Admin User - FixGuide',
      },
      {
        path: ':id',
        component: UserDetailComponent,
        title: 'Admin User Details - FixGuide',
      },
    ],
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
