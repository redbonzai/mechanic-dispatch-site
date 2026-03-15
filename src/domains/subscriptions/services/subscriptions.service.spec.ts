import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../../database/prisma.service';
import { SUBSCRIPTION_PLANS } from '../constants/subscription-plans';
import Stripe from 'stripe';

// Mock the Stripe SDK
jest.mock('stripe');
const MockedStripe = Stripe as jest.MockedClass<typeof Stripe>;

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let prisma: jest.Mocked<PrismaService>;
  let stripeInstance: jest.Mocked<Stripe>;

  const mockMechanic = {
    id: 'mech_1',
    name: 'Test Mechanic',
    email: 'mechanic@example.com',
    stripeCustomerId: null,
    subscription: null,
  };

  const mockStripeSubscription = {
    id: 'sub_test123',
    status: 'trialing',
    trial_end: Math.floor(Date.now() / 1000) + 7 * 86400,
    current_period_start: Math.floor(Date.now() / 1000),
    current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400,
    cancel_at_period_end: false,
    metadata: { mechanicId: 'mech_1', tier: 'PRO' },
  } as unknown as Stripe.Subscription;

  const mockPrisma = {
    mechanic: {
      findUnique: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
    },
    mechanicSubscription: {
      findUnique: jest.fn(),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    // Set up Stripe mock before the module is compiled so it's available in the constructor
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';

    stripeInstance = {
      customers: {
        create: jest.fn().mockResolvedValue({ id: 'cus_test123' }),
        update: jest.fn().mockResolvedValue({}),
      },
      paymentMethods: {
        attach: jest.fn().mockResolvedValue({}),
      },
      subscriptions: {
        create: jest.fn().mockResolvedValue(mockStripeSubscription),
        update: jest.fn().mockResolvedValue({}),
      },
    } as unknown as jest.Mocked<Stripe>;

    MockedStripe.mockImplementation(() => stripeInstance);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    prisma = module.get(PrismaService);

    // Swap the internal stripe instance with our mock
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (service as any).stripe = stripeInstance;

    // Default $transaction executes callback immediately
    mockPrisma.$transaction.mockImplementation(
      async (arg: unknown) => {
        if (typeof arg === 'function') {
          return (arg as (tx: unknown) => Promise<unknown>)(mockPrisma);
        }
        return Promise.all(arg as Promise<unknown>[]);
      },
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── getPlans ───────────────────────────────────────────────────────────────

  describe('getPlans', () => {
    it('should return all subscription plans', async () => {
      const plans = await service.getPlans();

      expect(plans).toHaveLength(Object.keys(SUBSCRIPTION_PLANS).length);
      expect(plans.every((p) => p.tier && p.name && p.priceMonthly)).toBe(true);
    });

    it('should include trial days in plan data', async () => {
      const plans = await service.getPlans();
      plans.forEach((plan) => {
        expect(plan.trialDays).toBeGreaterThan(0);
      });
    });
  });

  // ── createSubscription ────────────────────────────────────────────────────

  describe('createSubscription', () => {
    beforeEach(() => {
      mockPrisma.mechanic.findUnique.mockResolvedValue(mockMechanic);
    });

    it('should create a Stripe subscription and persist it', async () => {
      const result = await service.createSubscription('mech_1', {
        tier: 'PRO',
        paymentMethodId: 'pm_test123',
      });

      expect(stripeInstance.subscriptions.create).toHaveBeenCalled();
      expect(result.subscriptionId).toBe('sub_test123');
      expect(result.status).toBe('trialing');
    });

    it('should create a new Stripe customer when none exists', async () => {
      await service.createSubscription('mech_1', {
        tier: 'PRO',
        paymentMethodId: 'pm_test123',
      });

      expect(stripeInstance.customers.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'mechanic@example.com' }),
      );
    });

    it('should reuse existing Stripe customer', async () => {
      mockPrisma.mechanic.findUnique.mockResolvedValue({
        ...mockMechanic,
        stripeCustomerId: 'cus_existing',
      });

      await service.createSubscription('mech_1', {
        tier: 'PRO',
        paymentMethodId: 'pm_test123',
      });

      expect(stripeInstance.customers.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when mechanic does not exist', async () => {
      mockPrisma.mechanic.findUnique.mockResolvedValue(null);

      await expect(
        service.createSubscription('non-existent', {
          tier: 'PRO',
          paymentMethodId: 'pm_test',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when subscription already active', async () => {
      mockPrisma.mechanic.findUnique.mockResolvedValue({
        ...mockMechanic,
        subscription: { id: 'existing-sub' },
      });

      await expect(
        service.createSubscription('mech_1', {
          tier: 'PRO',
          paymentMethodId: 'pm_test',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid tier', async () => {
      await expect(
        service.createSubscription('mech_1', {
          tier: 'INVALID' as 'PRO',
          paymentMethodId: 'pm_test',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── cancelSubscription ────────────────────────────────────────────────────

  describe('cancelSubscription', () => {
    it('should schedule cancellation at period end', async () => {
      mockPrisma.mechanicSubscription.findUnique.mockResolvedValue({
        mechanicId: 'mech_1',
        stripeSubscriptionId: 'sub_test123',
      });

      const result = await service.cancelSubscription('mech_1');

      expect(stripeInstance.subscriptions.update).toHaveBeenCalledWith(
        'sub_test123',
        { cancel_at_period_end: true },
      );
      expect(result.cancelled).toBe(true);
    });

    it('should throw NotFoundException when no subscription exists', async () => {
      mockPrisma.mechanicSubscription.findUnique.mockResolvedValue(null);

      await expect(service.cancelSubscription('mech_1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── getSubscriptionStatus ─────────────────────────────────────────────────

  describe('getSubscriptionStatus', () => {
    it('should return INACTIVE when no subscription found', async () => {
      mockPrisma.mechanicSubscription.findUnique.mockResolvedValue(null);

      const result = await service.getSubscriptionStatus('mech_1');

      expect(result).toEqual({ status: 'INACTIVE', tier: null });
    });

    it('should return subscription data when found', async () => {
      const mockSub = {
        mechanicId: 'mech_1',
        status: 'ACTIVE',
        tier: 'PRO',
        currentPeriodEnd: new Date(),
      };
      mockPrisma.mechanicSubscription.findUnique.mockResolvedValue(mockSub);

      const result = await service.getSubscriptionStatus('mech_1');

      expect(result).toEqual(mockSub);
    });
  });

  // ── handleSubscriptionUpdated ─────────────────────────────────────────────

  describe('handleSubscriptionUpdated', () => {
    const buildEvent = (
      status: string,
      mechanicId = 'mech_1',
      tier = 'PRO',
    ) =>
      ({
        id: 'sub_webhook',
        status,
        cancel_at_period_end: false,
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400,
        trial_end: null,
        metadata: { mechanicId, tier },
      }) as unknown as Stripe.Subscription;

    it('should update mechanic to ACTIVE on active subscription', async () => {
      await service.handleSubscriptionUpdated(buildEvent('active'));

      expect(mockPrisma.mechanic.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ subscriptionStatus: 'ACTIVE' }),
        }),
      );
    });

    it('should update mechanic to TRIALING on trialing subscription', async () => {
      await service.handleSubscriptionUpdated(buildEvent('trialing'));

      expect(mockPrisma.mechanic.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ subscriptionStatus: 'TRIALING' }),
        }),
      );
    });

    it('should set isActive=false on canceled subscription', async () => {
      await service.handleSubscriptionUpdated(buildEvent('canceled'));

      expect(mockPrisma.mechanic.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            subscriptionStatus: 'CANCELLED',
            isActive: false,
          }),
        }),
      );
    });

    it('should set isActive=false on past_due subscription', async () => {
      await service.handleSubscriptionUpdated(buildEvent('past_due'));

      expect(mockPrisma.mechanic.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isActive: false }),
        }),
      );
    });

    it('should do nothing when no mechanicId in metadata', async () => {
      const event = buildEvent('active', '');

      await service.handleSubscriptionUpdated(event);

      expect(mockPrisma.mechanic.update).not.toHaveBeenCalled();
    });
  });
});
