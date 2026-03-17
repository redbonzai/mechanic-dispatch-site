import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { UserAuthService } from './services/user-auth.service';
import { MechanicAuthService } from './services/mechanic-auth.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    const mockUserAuth = {
      isLoggedIn: signal(false),
      currentUser: signal(null),
      searchVehicle: signal({ make: '', model: '', year: '' }),
      logout: jasmine.createSpy('logout'),
    };
    const mockMechAuth = {
      isLoggedIn: signal(false),
      currentMechanic: signal(null),
      logout: jasmine.createSpy('logout'),
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterModule.forRoot([])],
      providers: [
        { provide: UserAuthService, useValue: mockUserAuth },
        { provide: MechanicAuthService, useValue: mockMechAuth },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have a menuOpen signal initialized to false', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.menuOpen()).toBe(false);
  });
});

