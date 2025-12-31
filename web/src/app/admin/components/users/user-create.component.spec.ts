import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UserCreateComponent } from './user-create.component';
import { AdminUsersService } from '../../services/admin-users.service';
import { AdminUser } from '../../models/admin-user.model';

describe('UserCreateComponent', () => {
  let component: UserCreateComponent;
  let fixture: ComponentFixture<UserCreateComponent>;
  let mockAdminUsersService: jasmine.SpyObj<AdminUsersService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockCreatedUser: AdminUser = {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    isActive: true,
    failedLoginAttempts: 0,
    lastFailedLoginAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    mockAdminUsersService = jasmine.createSpyObj('AdminUsersService', ['createUser']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [UserCreateComponent],
      providers: [
        { provide: AdminUsersService, useValue: mockAdminUsersService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with empty values except role and isActive', () => {
      expect(component.createForm.get('name')?.value).toBe('');
      expect(component.createForm.get('email')?.value).toBe('');
      expect(component.createForm.get('password')?.value).toBe('');
      expect(component.createForm.get('role')?.value).toBe('admin');
      expect(component.createForm.get('isActive')?.value).toBe(true);
    });

    it('should have all required validators', () => {
      const nameControl = component.createForm.get('name');
      const emailControl = component.createForm.get('email');
      const passwordControl = component.createForm.get('password');
      const roleControl = component.createForm.get('role');

      expect(nameControl?.hasError('required')).toBe(true);
      expect(emailControl?.hasError('required')).toBe(true);
      expect(passwordControl?.hasError('required')).toBe(true);
      expect(roleControl?.hasError('required')).toBe(false); // Has default value
    });
  });

  describe('Form Validation', () => {
    it('should validate name minimum length', () => {
      const nameControl = component.createForm.get('name');
      
      nameControl?.setValue('A');
      expect(nameControl?.hasError('minlength')).toBe(true);

      nameControl?.setValue('Ab');
      expect(nameControl?.hasError('minlength')).toBe(false);
    });

    it('should validate email format', () => {
      const emailControl = component.createForm.get('email');

      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBe(true);

      emailControl?.setValue('valid@example.com');
      expect(emailControl?.hasError('email')).toBe(false);
    });

    it('should validate password minimum length', () => {
      const passwordControl = component.createForm.get('password');

      passwordControl?.setValue('short');
      expect(passwordControl?.hasError('minlength')).toBe(true);

      passwordControl?.setValue('longenough');
      expect(passwordControl?.hasError('minlength')).toBe(false);
    });
  });

  describe('onSubmit', () => {
    it('should not submit if form is invalid', () => {
      component.onSubmit();

      expect(mockAdminUsersService.createUser).not.toHaveBeenCalled();
    });

    it('should create user and navigate on success', () => {
      mockAdminUsersService.createUser.and.returnValue(of(mockCreatedUser));

      component.createForm.patchValue({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'admin',
        isActive: true,
      });

      component.onSubmit();

      expect(mockAdminUsersService.createUser).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'admin',
        isActive: true,
      });
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/users', '123']);
      expect(component.submitting()).toBe(false);
    });

    it('should display error on failure', () => {
      const error = { error: { message: 'Email already exists' } };
      mockAdminUsersService.createUser.and.returnValue(throwError(() => error));

      component.createForm.patchValue({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'admin',
      });

      component.onSubmit();

      expect(component.error()).toBe('Email already exists');
      expect(component.submitting()).toBe(false);
    });

    it('should mark all fields as touched if form is invalid', () => {
      spyOn<any>(component, 'markAllAsTouched');

      component.onSubmit();

      expect((component as any).markAllAsTouched).toHaveBeenCalled();
    });
  });

  describe('onCancel', () => {
    it('should navigate back to users list', () => {
      component.onCancel();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/users']);
    });
  });

  describe('hasError', () => {
    it('should return true if field is invalid and touched', () => {
      const nameControl = component.createForm.get('name');
      nameControl?.markAsTouched();
      nameControl?.setValue('');

      expect(component.hasError('name')).toBe(true);
    });

    it('should return false if field is valid', () => {
      const nameControl = component.createForm.get('name');
      nameControl?.markAsTouched();
      nameControl?.setValue('John Doe');

      expect(component.hasError('name')).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should return required error message', () => {
      const nameControl = component.createForm.get('name');
      nameControl?.setErrors({ required: true });

      expect(component.getErrorMessage('name')).toBe('Name is required');
    });

    it('should return email format error message', () => {
      const emailControl = component.createForm.get('email');
      emailControl?.setValue('invalid');
      emailControl?.markAsTouched();

      expect(component.getErrorMessage('email')).toBe('Please enter a valid email address');
    });

    it('should return minlength error message', () => {
      const passwordControl = component.createForm.get('password');
      passwordControl?.setValue('short');
      passwordControl?.markAsTouched();

      expect(component.getErrorMessage('password')).toBe('Password must be at least 8 characters');
    });

    it('should return empty string if no errors', () => {
      const nameControl = component.createForm.get('name');
      nameControl?.setValue('John Doe');

      expect(component.getErrorMessage('name')).toBe('');
    });
  });

  describe('Role Options', () => {
    it('should have three role options', () => {
      expect(component.roleOptions.length).toBe(3);
      expect(component.roleOptions).toContain('super-admin');
      expect(component.roleOptions).toContain('admin');
      expect(component.roleOptions).toContain('moderator');
    });
  });
});
