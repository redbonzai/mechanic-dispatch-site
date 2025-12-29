import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ServiceRequestDetailComponent } from './service-request-detail.component';
import { ServiceRequestsService } from '../../services/service-requests.service';
import {
  AdminServiceRequestDetail,
  ServiceRequestStatus,
} from '../../models/service-request.model';

describe('ServiceRequestDetailComponent', () => {
  let component: ServiceRequestDetailComponent;
  let fixture: ComponentFixture<ServiceRequestDetailComponent>;
  let mockService: jasmine.SpyObj<ServiceRequestsService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockRoute: any;

  const mockRequest: AdminServiceRequestDetail = {
    id: '123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '555-1234',
    addressLine1: '123 Main St',
    addressLine2: 'Apt 4',
    city: 'Boston',
    state: 'MA',
    postalCode: '02101',
    country: 'USA',
    vehicleMake: 'Toyota',
    vehicleModel: 'Camry',
    vehicleYear: 2020,
    status: ServiceRequestStatus.AUTHORIZED,
    amountCents: 15000,
    finalAmountCents: null,
    stripePaymentIntentId: 'pi_123',
    finalPaymentIntentId: null,
    stripeCustomerId: 'cus_123',
    stripePaymentMethodId: 'pm_123',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T12:00:00Z'),
    workLogs: [],
    reviews: [],
  };

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('ServiceRequestsService', [
      'getById',
      'capture',
      'cancel',
      'finalize',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('123'),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [ServiceRequestDetailComponent],
      providers: [
        { provide: ServiceRequestsService, useValue: mockService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceRequestDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load request on init', () => {
    mockService.getById.and.returnValue(of(mockRequest));

    fixture.detectChanges();

    expect(mockService.getById).toHaveBeenCalledWith('123');
    expect(component.request()).toEqual(mockRequest);
    expect(component.loading()).toBe(false);
    expect(component.finalizeAmount()).toBe(150);
  });

  it('should handle load error', () => {
    mockService.getById.and.returnValue(
      throwError(() => new Error('Load failed'))
    );

    fixture.detectChanges();

    expect(component.error()).toBe('Failed to load service request');
    expect(component.loading()).toBe(false);
  });

  it('should set error when no ID provided', () => {
    mockRoute.snapshot.paramMap.get.and.returnValue(null);

    fixture.detectChanges();

    expect(component.error()).toBe('No request ID provided');
  });

  it('should navigate back to list', () => {
    component.goBack();

    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/admin/service-requests',
    ]);
  });

  it('should capture payment', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    mockService.getById.and.returnValue(of(mockRequest));
    mockService.capture.and.returnValue(of(void 0));

    component.request.set(mockRequest);
    component.onCapture();

    expect(mockService.capture).toHaveBeenCalledWith('123');
    expect(component.actionLoading()).toBe(false);
  });

  it('should not capture payment if not confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.request.set(mockRequest);

    component.onCapture();

    expect(mockService.capture).not.toHaveBeenCalled();
  });

  it('should handle capture error', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    mockService.capture.and.returnValue(
      throwError(() => new Error('Capture failed'))
    );
    component.request.set(mockRequest);

    component.onCapture();

    expect(component.actionError()).toBe('Failed to capture payment');
    expect(component.actionLoading()).toBe(false);
  });

  it('should cancel request', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    mockService.getById.and.returnValue(of(mockRequest));
    mockService.cancel.and.returnValue(of(void 0));

    component.request.set(mockRequest);
    component.onCancel();

    expect(mockService.cancel).toHaveBeenCalledWith('123');
    expect(component.actionLoading()).toBe(false);
  });

  it('should not cancel request if not confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.request.set(mockRequest);

    component.onCancel();

    expect(mockService.cancel).not.toHaveBeenCalled();
  });

  it('should handle cancel error', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    mockService.cancel.and.returnValue(
      throwError(() => new Error('Cancel failed'))
    );
    component.request.set(mockRequest);

    component.onCancel();

    expect(component.actionError()).toBe('Failed to cancel request');
    expect(component.actionLoading()).toBe(false);
  });

  it('should open finalize modal', () => {
    component.openFinalizeModal();

    expect(component.showFinalizeModal()).toBe(true);
  });

  it('should close finalize modal', () => {
    component.showFinalizeModal.set(true);
    component.actionError.set('Some error');

    component.closeFinalizeModal();

    expect(component.showFinalizeModal()).toBe(false);
    expect(component.actionError()).toBeNull();
  });

  it('should finalize request', () => {
    mockService.getById.and.returnValue(of(mockRequest));
    mockService.finalize.and.returnValue(of(void 0));

    component.request.set(mockRequest);
    component.finalizeAmount.set(175.5);
    component.onFinalize();

    expect(mockService.finalize).toHaveBeenCalledWith('123', 17550);
  });

  it('should reject finalize with zero amount', () => {
    component.request.set(mockRequest);
    component.finalizeAmount.set(0);

    component.onFinalize();

    expect(component.actionError()).toBe('Amount must be greater than zero');
    expect(mockService.finalize).not.toHaveBeenCalled();
  });

  it('should reject finalize with negative amount', () => {
    component.request.set(mockRequest);
    component.finalizeAmount.set(-10);

    component.onFinalize();

    expect(component.actionError()).toBe('Amount must be greater than zero');
    expect(mockService.finalize).not.toHaveBeenCalled();
  });

  it('should handle finalize error', () => {
    mockService.finalize.and.returnValue(
      throwError(() => new Error('Finalize failed'))
    );
    component.request.set(mockRequest);
    component.finalizeAmount.set(150);

    component.onFinalize();

    expect(component.actionError()).toBe('Failed to finalize request');
    expect(component.actionLoading()).toBe(false);
  });

  it('should return correct status class', () => {
    expect(component.getStatusClass(ServiceRequestStatus.PENDING)).toBe(
      'status-pending'
    );
    expect(component.getStatusClass(ServiceRequestStatus.FINALIZED)).toBe(
      'status-finalized'
    );
  });

  it('should format date correctly', () => {
    const formatted = component.formatDate('2024-01-15T10:30:00Z');
    expect(formatted).toContain('Jan');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2024');
  });

  it('should format currency correctly', () => {
    expect(component.formatCurrency(15000)).toBe('$150.00');
    expect(component.formatCurrency(12550)).toBe('$125.50');
  });

  it('should format minutes correctly', () => {
    expect(component.formatMinutes(0)).toBe('0m');
    expect(component.formatMinutes(30)).toBe('30m');
    expect(component.formatMinutes(60)).toBe('1h');
    expect(component.formatMinutes(90)).toBe('1h 30m');
    expect(component.formatMinutes(120)).toBe('2h');
  });

  it('should determine when capture is allowed', () => {
    component.request.set({
      ...mockRequest,
      status: ServiceRequestStatus.AUTHORIZED,
    });
    expect(component.canCapture()).toBe(true);

    component.request.set({
      ...mockRequest,
      status: ServiceRequestStatus.PENDING,
    });
    expect(component.canCapture()).toBe(false);
  });

  it('should determine when cancel is allowed', () => {
    component.request.set({
      ...mockRequest,
      status: ServiceRequestStatus.PENDING,
    });
    expect(component.canCancel()).toBe(true);

    component.request.set({
      ...mockRequest,
      status: ServiceRequestStatus.AUTHORIZED,
    });
    expect(component.canCancel()).toBe(true);

    component.request.set({
      ...mockRequest,
      status: ServiceRequestStatus.CAPTURED,
    });
    expect(component.canCancel()).toBe(false);
  });

  it('should determine when finalize is allowed', () => {
    component.request.set({
      ...mockRequest,
      status: ServiceRequestStatus.CAPTURED,
    });
    expect(component.canFinalize()).toBe(true);

    component.request.set({
      ...mockRequest,
      status: ServiceRequestStatus.AUTHORIZED,
    });
    expect(component.canFinalize()).toBe(false);
  });
});
