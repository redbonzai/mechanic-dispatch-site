import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ServiceRequestsListComponent } from './service-requests-list.component';
import { ServiceRequestsService } from '../../services/service-requests.service';
import {
  AdminServiceRequestListItem,
  ServiceRequestListResponse,
  ServiceRequestStatus,
} from '../../models/service-request.model';

describe('ServiceRequestsListComponent', () => {
  let component: ServiceRequestsListComponent;
  let fixture: ComponentFixture<ServiceRequestsListComponent>;
  let mockService: jasmine.SpyObj<ServiceRequestsService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockRequests: AdminServiceRequestListItem[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '555-1234',
      vehicleMake: 'Toyota',
      vehicleModel: 'Camry',
      vehicleYear: 2020,
      status: ServiceRequestStatus.PENDING,
      amountCents: 15000,
      finalAmountCents: null,
      city: 'Boston',
      state: 'MA',
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z'),
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '555-5678',
      vehicleMake: 'Honda',
      vehicleModel: 'Civic',
      vehicleYear: 2019,
      status: ServiceRequestStatus.FINALIZED,
      amountCents: 20000,
      finalAmountCents: 20000,
      city: 'Cambridge',
      state: 'MA',
      createdAt: new Date('2024-01-02T10:00:00Z'),
      updatedAt: new Date('2024-01-02T12:00:00Z'),
    },
  ];

  const mockResponse: ServiceRequestListResponse = {
    items: mockRequests,
    pagination: {
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('ServiceRequestsService', ['list']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ServiceRequestsListComponent],
      providers: [
        { provide: ServiceRequestsService, useValue: mockService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceRequestsListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load requests on init', () => {
    mockService.list.and.returnValue(of(mockResponse));

    fixture.detectChanges();

    expect(mockService.list).toHaveBeenCalled();
    expect(component.requests().length).toBe(2);
    expect(component.totalRequests()).toBe(2);
    expect(component.totalPages()).toBe(1);
    expect(component.loading()).toBe(false);
  });

  it('should handle load error', () => {
    mockService.list.and.returnValue(
      throwError(() => new Error('Load failed'))
    );

    fixture.detectChanges();

    expect(component.error()).toBe('Failed to load service requests');
    expect(component.loading()).toBe(false);
  });

  it('should filter by status', () => {
    mockService.list.and.returnValue(of(mockResponse));

    component.statusFilter.set('PENDING');
    component.onFilterChange();

    expect(mockService.list).toHaveBeenCalledWith(
      jasmine.objectContaining({ status: 'PENDING' })
    );
  });

  it('should filter by search query', () => {
    mockService.list.and.returnValue(of(mockResponse));

    component.searchQuery.set('john');
    component.onFilterChange();

    expect(mockService.list).toHaveBeenCalledWith(
      jasmine.objectContaining({ search: 'john' })
    );
  });

  it('should filter by date range', () => {
    mockService.list.and.returnValue(of(mockResponse));

    component.startDateFilter.set('2024-01-01');
    component.endDateFilter.set('2024-01-31');
    component.onFilterChange();

    expect(mockService.list).toHaveBeenCalledWith(
      jasmine.objectContaining({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      })
    );
  });

  it('should reset page on filter change', () => {
    mockService.list.and.returnValue(of(mockResponse));

    component.currentPage.set(3);
    component.onFilterChange();

    expect(component.currentPage()).toBe(1);
  });

  it('should change page', () => {
    mockService.list.and.returnValue(of(mockResponse));

    component.totalPages.set(5);
    component.onPageChange(3);

    expect(component.currentPage()).toBe(3);
    expect(mockService.list).toHaveBeenCalled();
  });

  it('should not change to invalid page', () => {
    mockService.list.and.returnValue(of(mockResponse));

    component.currentPage.set(2);
    component.totalPages.set(5);
    component.onPageChange(10);

    expect(component.currentPage()).toBe(2);
  });

  it('should toggle sort order on same column', () => {
    mockService.list.and.returnValue(of(mockResponse));

    component.sortBy.set('customerName');
    component.sortOrder.set('asc');
    component.onSort('customerName');

    expect(component.sortOrder()).toBe('desc');
  });

  it('should set new sort column with desc order', () => {
    mockService.list.and.returnValue(of(mockResponse));

    component.sortBy.set('customerName');
    component.onSort('status');

    expect(component.sortBy()).toBe('status');
    expect(component.sortOrder()).toBe('desc');
  });

  it('should navigate to details page', () => {
    component.viewDetails('123');

    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/admin/service-requests',
      '123',
    ]);
  });

  it('should return correct status class', () => {
    expect(component.getStatusClass('PENDING')).toBe('status-pending');
    expect(component.getStatusClass('FINALIZED')).toBe('status-finalized');
    expect(component.getStatusClass('unknown')).toBe('');
  });

  it('should format date correctly', () => {
    const formatted = component.formatDate('2024-01-15T10:00:00Z');
    expect(formatted).toContain('Jan');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2024');
  });

  it('should format currency correctly', () => {
    const formatted = component.formatCurrency(150.5);
    expect(formatted).toBe('$150.50');
  });

  it('should clear all filters', () => {
    mockService.list.and.returnValue(of(mockResponse));

    component.statusFilter.set('PENDING');
    component.searchQuery.set('john');
    component.startDateFilter.set('2024-01-01');
    component.endDateFilter.set('2024-01-31');
    component.currentPage.set(3);

    component.clearFilters();

    expect(component.statusFilter()).toBe('');
    expect(component.searchQuery()).toBe('');
    expect(component.startDateFilter()).toBe('');
    expect(component.endDateFilter()).toBe('');
    expect(component.currentPage()).toBe(1);
  });

  it('should detect active filters', () => {
    expect(component.hasActiveFilters).toBe(false);

    component.statusFilter.set('PENDING');
    expect(component.hasActiveFilters).toBe(true);

    component.statusFilter.set('');
    component.searchQuery.set('test');
    expect(component.hasActiveFilters).toBe(true);
  });

  it('should generate page numbers correctly', () => {
    component.totalPages.set(10);
    component.currentPage.set(5);

    const pageNumbers = component.pageNumbers;

    expect(pageNumbers).toContain(1);
    expect(pageNumbers).toContain(5);
    expect(pageNumbers).toContain(10);
    expect(pageNumbers).toContain(-1); // ellipsis
  });

  it('should generate simple page numbers for few pages', () => {
    component.totalPages.set(3);
    component.currentPage.set(2);

    const pageNumbers = component.pageNumbers;

    expect(pageNumbers).toEqual([1, 2, 3]);
    expect(pageNumbers).not.toContain(-1);
  });
});
