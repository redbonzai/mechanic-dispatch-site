/**
 * AdminAuthGuard
 * 
 * Route guard to protect admin routes from unauthorized access.
 * Redirects to login page if user is not authenticated.
 * 
 * @authority docs/admin/SECURITY_REQUIREMENTS.md
 */

import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AdminAuthService
  ) {}

  /**
   * Determine if route can be activated
   * 
   * @param route - Activated route snapshot
   * @param state - Router state snapshot
   * @returns True if authenticated, false otherwise
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // Not authenticated - redirect to login
    this.router.navigate(['/admin/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }
}
