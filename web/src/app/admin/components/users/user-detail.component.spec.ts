import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UserDetailComponent } from './user-detail.component';
import { AdminUsersService } from '../../services/admin-users.service';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminUser } from '../../models';

describe('UserDetailComponent', () => {
  let component: UserDetailComponent;
  let fixture: ComponentFixture<UserDetailComponent>;
  let mockAdminUsersService: jasmine.SpyObj<AdminUsersService>;
  let mockAdminAuthService: jasmine.SpyObj<AdminAuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockUser: AdminUser = {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
    isActive: true,
    lastFailedLoginAt: null,
    failedLoginAttempts: 0,
    createdAt: '',
    updatedAt: '',
  };

  beforeEach(async () => {
    mockAdminUsersService = jasmine.createSpyObj('AdminUsersService', [
      'getUserById',
      'updateUser',
      'deleteUser',
    ]);
    mockAdminAuthService = jasmine.createSpyObj('AdminAuthService', ['getCurrentUser']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('123'),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [UserDetailComponent],
      providers: [
        { provide: AdminUsersService, useValue: mockAdminUsersService },
        { provide: AdminAuthService, useValue: mockAdminAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load user on init', () => {
      mockAdminUsersService.getUserById.and.returnValue(of(mockUser));
      
      fixture.detectChanges();

      expect(mockAdminUsersService.getUserById).toHaveBeenCalledWith('123');
      expect(component.user()).toEqual(mockUser);
      expect(component.loading()).toBe(false);
    });

    it('should handle error when loading user fails', () => {
      const error = new Error('Failed to load user');
      mockAdminUsersService.getUserById.and.returnValue(throwError(() => error));

      fixture.detectChanges();

      expect(component.error()).toBe('Failed to load user');
      expect(component.loading()).toBe(false);
    });
  });

  describe('onEdit', () => {
    beforeEach(() => {
      mockAdminUsersService.getUserById.and.returnValue(of(mockUser));
      fixture.detectChanges();
    });

    it('should enter edit mode and populate form', () => {
      component.onEdit();

      expect(component.editMode()).toBe(true);
      expect(component.editForm().name).toBe(mockUser.name);
      expect(component.editForm().email).toBe(mockUser.email);
      expect(component.editForm().role).toBe(mockUser.role);
    });
  });

  describe('onSave', () => {
    beforeEach(() => {
      mockAdminUsersService.getUserById.and.returnValue(of(mockUser));
      fixture.detectChanges();
      component.onEdit();
    });

    it('should save changes and exit edit mode', () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      mockAdminUsersService.updateUser.and.returnValue(of(updatedUser));
      
      component.editForm().name = 'Updated Name';
      component.onSave();

      expect(mockAdminUsersService.updateUser).toHaveBeenCalledWith('123', { name: 'Updated Name' });
      expect(component.editMode()).toBe(false);
      expect(component.user()?.name).toBe('Updated Name');
    });

    it('should handle error when saving fails', () => {
      const error = { error: { message: 'Failed to update' } };
      mockAdminUsersService.updateUser.and.returnValue(throwError(() => error));
      
      component.editForm().name = 'Updated Name';
      component.onSave();

      expect(component.error()).toBe('Failed to update');
      expect(component.saving()).toBe(false);
    });
  });

  describe('onDelete', () => {
    beforeEach(() => {
      mockAdminUsersService.getUserById.and.returnValue(of(mockUser));
      mockAdminAuthService.getCurrentUser.and.returnValue({ ...mockUser, id: 'different-id' } as any);
      fixture.detectChanges();
    });

    it('should show delete confirmation', () => {
      component.onDelete();

      expect(component.showDeleteConfirm()).toBe(true);
    });

    it('should delete user and navigate to list', () => {
      mockAdminUsersService.deleteUser.and.returnValue(of(void 0));
      component.onDelete();
      component.onConfirmDelete();

      expect(mockAdminUsersService.deleteUser).toHaveBeenCalledWith('123');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/users']);
    });
  });

  describe('canDelete', () => {
    it('should return false if user is trying to delete themselves', () => {
      mockAdminUsersService.getUserById.and.returnValue(of(mockUser));
      mockAdminAuthService.getCurrentUser.and.returnValue(mockUser as any);
      fixture.detectChanges();

      expect(component.canDelete()).toBe(false);
    });

    it('should return true if deleting a different user', () => {
      mockAdminUsersService.getUserById.and.returnValue(of(mockUser));
      mockAdminAuthService.getCurrentUser.and.returnValue({ ...mockUser, id: 'different-id' } as any);
      fixture.detectChanges();

      expect(component.canDelete()).toBe(true);
    });
  });

  describe('isFormValid', () => {
    beforeEach(() => {
      mockAdminUsersService.getUserById.and.returnValue(of(mockUser));
      fixture.detectChanges();
      component.onEdit();
    });

    it('should return true for valid form', () => {
      expect(component.isFormValid()).toBe(true);
    });

    it('should return false if name is too short', () => {
      component.editForm().name = 'A';
      
      expect(component.isFormValid()).toBe(false);
    });

    it('should return false if email is invalid', () => {
      component.editForm().email = 'invalid-email';
      
      expect(component.isFormValid()).toBe(false);
    });

    it('should return false if password is too short', () => {
      component.editForm().password = 'short';
      
      expect(component.isFormValid()).toBe(false);
    });
  });
});
