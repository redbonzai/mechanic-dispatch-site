import { Test, TestingModule } from '@nestjs/testing';
import { RequestsService } from './requests.service';
import { ServiceRequestRepository } from '../repositories/service-request.repository';
import { PaymentAdapterAbstract } from '../payments/payment-adapter.abstract';
import {
  SERVICE_REQUEST_REPOSITORY,
  MECHANIC_WORK_LOG_REPOSITORY,
  PAYMENT_ADAPTER,
  MechanicWorkLogRepository,
} from '../interfaces';
import { ServiceRequestStatus } from '../enums/service-request-status.enum';
import { ServiceRequest } from '../entities/service-request.entity';
import Stripe from 'stripe';

describe('RequestsService', () => {
  let service: RequestsService;
  let requestRepository: jest.Mocked<ServiceRequestRepository>;
  let workLogRepository: jest.Mocked<MechanicWorkLogRepository>;
  let paymentAdapter: jest.Mocked<PaymentAdapterAbstract>;

  const mockServiceRequest = ServiceRequest.create({
    id: 'req_1',
    createdAt: new Date(),
    updatedAt: new Date(),
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '555-1234',
    addressLine1: '123 Main St',
    addressLine2: null,
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94102',
    country: 'US',
    vehicleMake: 'Toyota',
    vehicleModel: 'Camry',
    vehicleYear: 2020,
    amountCents: 6000,
    finalAmountCents: null,
    stripePaymentIntentId: 'pi_test_123',
    finalPaymentIntentId: null,
    stripeCustomerId: 'cus_test_123',
    stripePaymentMethodId: null,
    status: ServiceRequestStatus.PENDING,
  });

  beforeEach(async () => {
    const mockRequestRepo = {
      create: jest.fn(),
      updateStatus: jest.fn(),
      updateStatusByPaymentIntent: jest.fn(),
      findById: jest.fn(),
      updatePaymentMetadata: jest.fn(),
    };

    const mockWorkLogRepo = {
      create: jest.fn(),
    };

    const mockPaymentAdapter = {
      getOrCreateCustomer: jest.fn(),
      createManualCaptureIntent: jest.fn(),
      capture: jest.fn(),
      cancel: jest.fn(),
      refund: jest.fn(),
      retrievePaymentIntent: jest.fn(),
      chargeOffSession: jest.fn(),
      constructEventFromPayload: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        {
          provide: SERVICE_REQUEST_REPOSITORY,
          useValue: mockRequestRepo,
        },
        {
          provide: MECHANIC_WORK_LOG_REPOSITORY,
          useValue: mockWorkLogRepo,
        },
        {
          provide: PAYMENT_ADAPTER,
          useValue: mockPaymentAdapter,
        },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
    requestRepository = module.get(SERVICE_REQUEST_REPOSITORY);
    workLogRepository = module.get(MECHANIC_WORK_LOG_REPOSITORY);
    paymentAdapter = module.get(PAYMENT_ADAPTER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRequest', () => {
    it('should create a service request with payment intent', async () => {
      const createData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-1234',
        addressLine1: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94102',
        country: 'US',
        vehicleMake: 'Toyota',
        vehicleModel: 'Camry',
        vehicleYear: 2020,
      };

      paymentAdapter.getOrCreateCustomer.mockResolvedValue({
        id: 'cus_test_123',
        email: 'john@example.com',
        name: 'John Doe',
        phone: '555-1234',
      });

      paymentAdapter.createManualCaptureIntent.mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret',
        payment_method: null,
      });

      requestRepository.create.mockResolvedValue(mockServiceRequest);

      const result = await service.createRequest(createData);

      expect(result.requestId).toBeDefined();
      expect(result.clientSecret).toBe('pi_test_123_secret');
      expect(result.customerId).toBe('cus_test_123');
      expect(paymentAdapter.getOrCreateCustomer).toHaveBeenCalled();
      expect(paymentAdapter.createManualCaptureIntent).toHaveBeenCalled();
      expect(requestRepository.create).toHaveBeenCalled();
    });

    it('should cancel payment intent if request creation fails', async () => {
      paymentAdapter.getOrCreateCustomer.mockResolvedValue({
        id: 'cus_test_123',
        email: 'john@example.com',
        name: 'John Doe',
      });

      paymentAdapter.createManualCaptureIntent.mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret',
        payment_method: null,
      });

      requestRepository.create.mockRejectedValue(new Error('Database error'));
      paymentAdapter.cancel.mockResolvedValue({} as Stripe.PaymentIntent);

      await expect(
        service.createRequest({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '555-1234',
          addressLine1: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94102',
          country: 'US',
          vehicleMake: 'Toyota',
          vehicleModel: 'Camry',
          vehicleYear: 2020,
        }),
      ).rejects.toThrow('Database error');

      expect(paymentAdapter.cancel).toHaveBeenCalledWith('pi_test_123');
    });
  });

  describe('capture', () => {
    it('should capture payment and update status', async () => {
      requestRepository.findById.mockResolvedValue(mockServiceRequest);
      paymentAdapter.capture.mockResolvedValue({
        id: 'pi_test_123',
        status: 'succeeded',
      } as Stripe.PaymentIntent);
      requestRepository.updateStatus.mockResolvedValue(undefined);

      const result = await service.capture('req_1');

      expect(result.status).toBe('succeeded');
      expect(paymentAdapter.capture).toHaveBeenCalledWith('pi_test_123');
      expect(requestRepository.updateStatus).toHaveBeenCalledWith(
        'req_1',
        ServiceRequestStatus.CAPTURED,
      );
    });

    it('should throw error when request not found', async () => {
      requestRepository.findById.mockResolvedValue(null);

      await expect(service.capture('non-existent')).rejects.toThrow(
        'Service request is missing an authorized payment',
      );
    });

    it('should throw error when payment intent missing', async () => {
      const requestWithoutPayment = ServiceRequest.create({
        ...mockServiceRequest.toJSON(),
        stripePaymentIntentId: null,
      });
      requestRepository.findById.mockResolvedValue(requestWithoutPayment);

      await expect(service.capture('req_1')).rejects.toThrow(
        'Service request is missing an authorized payment',
      );
    });
  });

  describe('cancel', () => {
    it('should cancel payment and update status', async () => {
      requestRepository.findById.mockResolvedValue(mockServiceRequest);
      paymentAdapter.cancel.mockResolvedValue({
        id: 'pi_test_123',
        status: 'canceled',
      } as Stripe.PaymentIntent);
      requestRepository.updateStatus.mockResolvedValue(undefined);

      const result = await service.cancel('req_1');

      expect(result.status).toBe('canceled');
      expect(paymentAdapter.cancel).toHaveBeenCalledWith('pi_test_123');
      expect(requestRepository.updateStatus).toHaveBeenCalledWith(
        'req_1',
        ServiceRequestStatus.CANCELLED,
      );
    });
  });

  describe('finalize', () => {
    it('should finalize request with additional charge', async () => {
      const requestWithPaymentMethod = ServiceRequest.create({
        ...mockServiceRequest.toJSON(),
        stripePaymentMethodId: 'pm_test_123',
      });

      requestRepository.findById.mockResolvedValue(requestWithPaymentMethod);
      paymentAdapter.chargeOffSession.mockResolvedValue({
        id: 'pi_final_123',
        status: 'succeeded',
      } as Stripe.PaymentIntent);
      requestRepository.updatePaymentMetadata.mockResolvedValue(undefined);
      requestRepository.updateStatus.mockResolvedValue(undefined);

      const result = await service.finalize('req_1', 8000);

      expect(result.finalAmountCents).toBe(8000);
      expect(result.additionalChargeCents).toBe(2000);
      expect(result.finalPaymentIntentId).toBe('pi_final_123');
      expect(paymentAdapter.chargeOffSession).toHaveBeenCalled();
    });

    it('should throw error when final amount is less than initial', async () => {
      requestRepository.findById.mockResolvedValue(mockServiceRequest);

      await expect(service.finalize('req_1', 5000)).rejects.toThrow(
        'Final amount cannot be less than the initial authorization',
      );
    });
  });

  describe('recordWorkLog', () => {
    it('should create a work log entry', async () => {
      const workLogData = {
        serviceRequestId: 'req_1',
        mechanicName: 'Test Mechanic',
        hoursWorkedMinutes: 120,
        payoutPercentage: 80,
        notes: 'Test notes',
      };

      workLogRepository.create.mockResolvedValue({
        id: 'log_1',
        ...workLogData,
        createdAt: new Date(),
      } as any);

      const result = await service.recordWorkLog(workLogData);

      expect(result).toBeDefined();
      expect(workLogRepository.create).toHaveBeenCalledWith(workLogData);
    });
  });
});


