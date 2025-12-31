import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UsersListComponent } from './users-list.component';
import { AdminUsersService } from '../../services/admin-users.service';
import { AdminUserListItem, AdminRole } from '../../models';

describe('UsersListComponent', () => {
  let component: UsersListComponent;
  let fixture: ComponentFixture<UsersListComponent>;
  let mockAdminUsersService: jasmine.SpyObj<AdminUsersService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockUsers: AdminUserListItem[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      isActive: true,
      createdAt: new Date('2024-01-01').toISOString(),
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'super-admin',
      isActive: true,
      createdAt: new Date('2024-01-02').toISOString(),
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'moderator',
      isActive: false,
      createdAt: new Date('2024-01-03').toISOString(),
    },
  ];

  beforeEach(async () => {
    mockAdminUsersService = jasmine.createSpyObj('AdminUsersService', ['getUsers']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [UsersListComponent],
      providers: [
        { provide: AdminUsersService, useValue: mockAdminUsersService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load users on init', () => {
      mockAdminUsersService.getUsers.and.returnValue(
        of({
          items: mockUsers,
          pagination: {
            page: 1,
            limit: 20,
            total: mockUsers.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        })
      );

      fixture.detectChanges();

      expect(mockAdminUsersService.getUsers).toHaveBeenCalled();
      expect(component.users()).toEqual(mockUsers);
      expect(component.totalItems()).toBe(3);
      expect(component.loading()).toBe(false);
    });

    it('should correctly process the new paginated user data structure', () => {
      const paginatedResponse = {
        items: mockUsers,
        pagination: {
          page: 2,
          limit: 10,
          total: 50,
          totalPages: 5,
          hasNext: true,
          hasPrev: true,
        },
      };

      mockAdminUsersService.getUsers.and.returnValue(of(paginatedResponse));

      fixture.detectChanges();

      // Verify users array is correctly set
      expect(component.users()).toEqual(mockUsers);
      expect(component.users().length).toBe(3);

      // Verify all pagination properties are correctly processed
      expect(component.currentPage()).toBe(2);
      expect(component.pageSize()).toBe(10);
      expect(component.totalItems()).toBe(50);
      expect(component.totalPages()).toBe(5);
      expect(component.hasNext()).toBe(true);
      expect(component.hasPrev()).toBe(true);

      // Verify loading state is cleared
      expect(component.loading()).toBe(false);
      expect(component.error()).toBeNull();
    });

    it('should handle error when loading users fails', () => {
      const error = new Error('Failed to load users');
      mockAdminUsersService.getUsers.and.returnValue(throwError(() => error));

      fixture.detectChanges();

      expect(component.error()).toBe('Failed to load users');
      expect(component.loading()).toBe(false);
    });
  });

  describe('filtering', () => {
    beforeEach(() => {
      mockAdminUsersService.getUsers.and.returnValue(
        of({
          items: mockUsers,
          pagination: {
            page: 1,
            limit: 20,
            total: mockUsers.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        })
      );
    });

    it('should filter by role', () => {
      component.onRoleFilterChange('admin');

      expect(mockAdminUsersService.getUsers).toHaveBeenCalledWith(
        jasmine.objectContaining({ role: 'admin' })
      );
    });

    it('should apply the role filter and refetch users when onRoleFilterChange is called', () => {
      fixture.detectChanges();
      mockAdminUsersService.getUsers.calls.reset();

      // Change role filter to 'super-admin'
      component.onRoleFilterChange('super-admin');

      // Verify role filter is set
      expect(component.roleFilter()).toBe('super-admin');

      // Verify page is reset to 1
      expect(component.currentPage()).toBe(1);

      // Verify service was called with the role filter
      expect(mockAdminUsersService.getUsers).toHaveBeenCalledTimes(1);
      expect(mockAdminUsersService.getUsers).toHaveBeenCalledWith(
        jasmine.objectContaining({
          role: 'super-admin',
          page: 1,
          limit: 20,
        })
      );
    });

    // it('should handle clearing role filter by passing empty string', () => {
    //   fixture.detectChanges();
    //   component.roleFilter.set('admin');
    //   mockAdminUsersService.getUsers.calls.reset();
    //
    //   // Clear the role filter
    //   component.onRoleFilterChange('');
    //
    //   // Verify role filter is cleared
    //   expect(component.roleFilter()).toBe('');
    //
    //   // Verify page is reset to 1
    //   expect(component.currentPage()).toBe(1);
    //
    //   // Verify service was called without role parameter
    //   expect(mockAdminUsersService.getUsers).toHaveBeenCalledTimes(1);
    //   const callArgs = mockAdminUsersService.getUsers.calls.mostRecent().args[0];
    //   expect(callArgs.role).toBeUndefined();
    // });

    it('should handle clearing role filter by passing empty string', () => {
      fixture.detectChanges();
      component.roleFilter.set('admin');
      mockAdminUsersService.getUsers.calls.reset();

      component.onRoleFilterChange('');

      expect(component.roleFilter()).toBe('');
      expect(component.currentPage()).toBe(1);

      expect(mockAdminUsersService.getUsers).toHaveBeenCalledTimes(1);

      const lastCall = mockAdminUsersService.getUsers.calls.mostRecent();
      expect(lastCall.args.length).toBeGreaterThan(0);

      const callArgs = lastCall.args[0] as { role?: string };
      expect(callArgs.role).toBeUndefined();
    });

    it('should filter by active status', () => {
      component.onActiveFilterChange(true);

      expect(mockAdminUsersService.getUsers).toHaveBeenCalledWith(
        jasmine.objectContaining({ isActive: true })
      );
    });

    it('should filter by inactive status', () => {
      component.onActiveFilterChange(false);

      expect(mockAdminUsersService.getUsers).toHaveBeenCalledWith(
        jasmine.objectContaining({ isActive: false })
      );
    });

    it('should filter by search term', () => {
      component.onSearchChange('john');

      expect(mockAdminUsersService.getUsers).toHaveBeenCalledWith(
        jasmine.objectContaining({ search: 'john' })
      );
    });

    it('should reset filters by changing them back to empty', () => {
      component.onRoleFilterChange('admin');
      component.onActiveFilterChange(true);
      component.onSearchChange('test');

      component.onRoleFilterChange('');
      component.onActiveFilterChange('');
      component.onSearchChange('');

      expect(component.roleFilter()).toBe('');
      expect(component.activeFilter()).toBe('');
      expect(component.searchQuery()).toBe('');
    });
  });

  describe('pagination', () => {
    beforeEach(() => {
      mockAdminUsersService.getUsers.and.returnValue(
        of({
          items: mockUsers,
          pagination: {
            page: 1,
            limit: 20,
            total: 100,
            totalPages: 5,
            hasNext: true,
            hasPrev: false,
          },
        })
      );
      fixture.detectChanges();
    });

    it('should load next page', () => {
      // Configure mock to return page 2 data
      mockAdminUsersService.getUsers.and.returnValue(
        of({
          items: mockUsers,
          pagination: {
            page: 2,
            limit: 20,
            total: 100,
            totalPages: 5,
            hasNext: true,
            hasPrev: true,
          },
        })
      );

      component.onPageChange(2);
      expect(component.currentPage()).toBe(2);
      expect(mockAdminUsersService.getUsers).toHaveBeenCalledWith(
        jasmine.objectContaining({ page: 2 })
      );
    });

    it('should update the current page and refetch users when onPageChange is called', () => {
      mockAdminUsersService.getUsers.calls.reset();

      // Mock response for page 3
      mockAdminUsersService.getUsers.and.returnValue(
        of({
          items: mockUsers,
          pagination: {
            page: 3,
            limit: 20,
            total: 100,
            totalPages: 5,
            hasNext: true,
            hasPrev: true,
          },
        })
      );

      // Change to page 3
      component.onPageChange(3);

      // Verify current page is updated
      expect(component.currentPage()).toBe(3);

      // Verify service was called with correct page number
      expect(mockAdminUsersService.getUsers).toHaveBeenCalledTimes(1);
      expect(mockAdminUsersService.getUsers).toHaveBeenCalledWith(
        jasmine.objectContaining({
          page: 3,
          limit: 20,
        })
      );

      // Verify pagination state is updated after fetch
      expect(component.hasNext()).toBe(true);
      expect(component.hasPrev()).toBe(true);
    });

    it('should load previous page', () => {
      component.currentPage.set(2);
      component.onPageChange(1);

      expect(component.currentPage()).toBe(1);
      expect(mockAdminUsersService.getUsers).toHaveBeenCalledWith(
        jasmine.objectContaining({ page: 1 })
      );
    });

    it('should handle hasNext and hasPrev flags', () => {
      expect(component.hasNext()).toBe(true);
      expect(component.hasPrev()).toBe(false);
    });

    it('should update pagination state from response', () => {
      expect(component.totalPages()).toBe(5);
      expect(component.totalItems()).toBe(100);
    });
  });

  describe('navigation', () => {
    it('should navigate to create user page', () => {
      component.onCreateUser();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/users/create']);
    });

    it('should navigate to the user creation page when onCreateUser is called', () => {
      mockRouter.navigate.calls.reset();

      component.onCreateUser();

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/users/create']);
    });

    it('should navigate to user detail page', () => {
      component.onUserClick('123');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/users', '123']);
    });

    it('should navigate to the specific user detail page when onUserClick is called', () => {
      mockRouter.navigate.calls.reset();

      const userId = 'user-abc-123';
      component.onUserClick(userId);

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/users', userId]);
    });

    it('should navigate to different user detail pages for different user IDs', () => {
      mockRouter.navigate.calls.reset();

      component.onUserClick('user-1');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/users', 'user-1']);

      component.onUserClick('user-2');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/users', 'user-2']);

      expect(mockRouter.navigate).toHaveBeenCalledTimes(2);
    });
  });

  describe('badge classes', () => {
    it('should return correct role badge class', () => {
      expect(component.getRoleBadgeClass('super-admin')).toBe('badge-super-admin');
      expect(component.getRoleBadgeClass('admin')).toBe('badge-admin');
      expect(component.getRoleBadgeClass('moderator')).toBe('badge-moderator');
    });

    it('should return correct status badge class', () => {
      expect(component.getStatusBadgeClass(true)).toBe('badge-active');
      expect(component.getStatusBadgeClass(false)).toBe('badge-inactive');
    });

    it('should return correct status text', () => {
      expect(component.getStatusText(true)).toBe('Active');
      expect(component.getStatusText(false)).toBe('Inactive');
    });
  });
});
