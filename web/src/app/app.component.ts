import { Component, HostListener, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserAuthService } from './services/user-auth.service';
import { MechanicAuthService } from './services/mechanic-auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  readonly currentYear = new Date().getFullYear();
  menuOpen = signal(false);
  userMenuOpen = signal(false);
  mobileMenuOpen = signal(false);

  constructor(
    readonly userAuth: UserAuthService,
    readonly mechAuth: MechanicAuthService,
  ) {}

  toggleUserMenu(event: Event) {
    event.stopPropagation();
    this.userMenuOpen.update((v) => !v);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update((v) => !v);
  }

  logoutUser() {
    this.userAuth.logout();
    this.userMenuOpen.set(false);
  }

  logoutMechanic() {
    this.mechAuth.logout();
    this.userMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-wrap')) {
      this.userMenuOpen.set(false);
    }
  }
}
