import { Routes } from '@angular/router';

export const routes: Routes = [
  // Public pages
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./pages/search/search.component').then((m) => m.SearchComponent),
  },
  {
    path: 'mechanics',
    loadComponent: () =>
      import('./pages/mechanics-directory/mechanics-directory.component').then(
        (m) => m.MechanicsDirectoryComponent,
      ),
  },
  {
    path: 'mechanic/:id/:slug',
    loadComponent: () =>
      import('./pages/mechanic-profile/mechanic-profile.component').then(
        (m) => m.MechanicProfileComponent,
      ),
  },
  {
    path: 'mechanic/:id',
    redirectTo: (route) => `/mechanic/${route.params['id']}/profile`,
    pathMatch: 'prefix',
  },
  {
    path: 'pricing',
    loadComponent: () =>
      import('./pages/pricing/pricing.component').then(
        (m) => m.PricingComponent,
      ),
  },
  {
    path: 'reviews',
    loadComponent: () =>
      import('./pages/reviews/reviews.component').then(
        (m) => m.ReviewsComponent,
      ),
  },
  {
    path: 'careers',
    loadComponent: () =>
      import('./pages/careers/careers.component').then(
        (m) => m.CareersComponent,
      ),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact.component').then(
        (m) => m.ContactComponent,
      ),
  },

  // Email verification
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./pages/verify-email/verify-email.component').then(
        (m) => m.VerifyEmailComponent,
      ),
  },
  {
    path: 'mechanic/verify-email',
    loadComponent: () =>
      import('./pages/verify-email/verify-email.component').then(
        (m) => m.VerifyEmailComponent,
      ),
  },

  // User auth
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/auth/user-register/user-register.component').then(
        (m) => m.UserRegisterComponent,
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/user-login/user-login.component').then(
        (m) => m.UserLoginComponent,
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/user-profile.component').then(
        (m) => m.UserProfileComponent,
      ),
  },

  // Mechanic auth & dashboard
  {
    path: 'mechanic-register',
    loadComponent: () =>
      import(
        './pages/auth/mechanic-register/mechanic-register.component'
      ).then((m) => m.MechanicRegisterComponent),
  },
  {
    path: 'mechanic-login',
    loadComponent: () =>
      import('./pages/auth/mechanic-login/mechanic-login.component').then(
        (m) => m.MechanicLoginComponent,
      ),
  },
  {
    path: 'mechanic-dashboard',
    loadComponent: () =>
      import('./pages/mechanic-dashboard/mechanic-dashboard.component').then(
        (m) => m.MechanicDashboardComponent,
      ),
  },

  // Legacy service pages — keep as repair guides
  {
    path: 'services',
    loadComponent: () =>
      import('./services/services.component').then((m) => m.ServicesComponent),
  },
  {
    path: 'services/oil-change',
    loadComponent: () =>
      import('./services/oil-change/oil-change.component').then(
        (m) => m.OilChangeComponent,
      ),
  },
  {
    path: 'services/battery-replacement',
    loadComponent: () =>
      import(
        './services/battery-replacement/battery-replacement.component'
      ).then((m) => m.BatteryReplacementComponent),
  },
  {
    path: 'services/brake-pad-replacement',
    loadComponent: () =>
      import(
        './services/brake-pad-replacement/brake-pad-replacement.component'
      ).then((m) => m.BrakePadReplacementComponent),
  },
  {
    path: 'services/car-not-starting',
    loadComponent: () =>
      import('./services/car-not-starting/car-not-starting.component').then(
        (m) => m.CarNotStartingComponent,
      ),
  },
  {
    path: 'services/pre-purchase-inspection',
    loadComponent: () =>
      import(
        './services/pre-purchase-inspection/pre-purchase-inspection.component'
      ).then((m) => m.PrePurchaseInspectionComponent),
  },
  {
    path: 'services/check-engine-light',
    loadComponent: () =>
      import(
        './services/check-engine-light/check-engine-light.component'
      ).then((m) => m.CheckEngineLightComponent),
  },
  {
    path: 'services/towing-roadside',
    loadComponent: () =>
      import('./services/towing-roadside/towing-roadside.component').then(
        (m) => m.TowingRoadsideComponent,
      ),
  },

  // Admin
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.routes').then((m) => m.adminRoutes),
  },

  // Redirects
  { path: 'request', redirectTo: '/search', pathMatch: 'full' },
  { path: 'about-mechanics', redirectTo: '/mechanics', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];
