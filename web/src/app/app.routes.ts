import { Routes } from '@angular/router';
import { RequestComponent } from './request/request.component';
import { LandingComponent } from './landing/landing.component';
import { ServicesComponent } from './services/services.component';
import { OilChangeComponent } from './services/oil-change/oil-change.component';
import { BatteryReplacementComponent } from './services/battery-replacement/battery-replacement.component';
import { BrakePadReplacementComponent } from './services/brake-pad-replacement/brake-pad-replacement.component';
import { CarNotStartingComponent } from './services/car-not-starting/car-not-starting.component';
import { PrePurchaseInspectionComponent } from './services/pre-purchase-inspection/pre-purchase-inspection.component';
import { CheckEngineLightComponent } from './services/check-engine-light/check-engine-light.component';
import { TowingRoadsideComponent } from './services/towing-roadside/towing-roadside.component';
import { PricingComponent } from './pages/pricing/pricing.component';
import { ReviewsComponent } from './pages/reviews/reviews.component';
import { AboutMechanicsComponent } from './pages/about-mechanics/about-mechanics.component';
import { CareersComponent } from './pages/careers/careers.component';
import { MechanicProfileComponent } from './pages/mechanic-profile/mechanic-profile.component';
import { ContactComponent } from './pages/contact/contact.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'request', component: RequestComponent },
  { path: 'pricing', component: PricingComponent },
  { path: 'reviews', component: ReviewsComponent },
  { path: 'about-mechanics', component: AboutMechanicsComponent },
  { path: 'careers', component: CareersComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'become-a-mechanic', redirectTo: '/careers', pathMatch: 'full' },
  { path: 'mechanic/:id', component: MechanicProfileComponent },
  { path: 'mechanic/:id/:slug', component: MechanicProfileComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'services/oil-change', component: OilChangeComponent },
  { path: 'services/battery-replacement', component: BatteryReplacementComponent },
  { path: 'services/brake-pad-replacement', component: BrakePadReplacementComponent },
  { path: 'services/car-not-starting', component: CarNotStartingComponent },
  { path: 'services/pre-purchase-inspection', component: PrePurchaseInspectionComponent },
  { path: 'services/check-engine-light', component: CheckEngineLightComponent },
  { path: 'services/towing-roadside', component: TowingRoadsideComponent },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes),
  },
  { path: '**', redirectTo: '' },
];

