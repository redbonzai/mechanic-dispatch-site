import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../../database/prisma.service';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import {
  SUBSCRIPTION_PLANS,
  SubscriptionTierKey,
} from '../constants/subscription-plans';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);
  private readonly stripe: Stripe;

  constructor(private readonly prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
      apiVersion: '2024-06-20',
    });
  }

  async getPlans() {
    return Object.values(SUBSCRIPTION_PLANS).map((plan) => ({
      tier: plan.tier,
      name: plan.name,
      priceMonthly: plan.priceMonthly,
      features: plan.features,
      trialDays: plan.trialDays,
    }));
  }

  async createSubscription(mechanicId: string, dto: CreateSubscriptionDto) {
    const mechanic = await this.prisma.mechanic.findUnique({
      where: { id: mechanicId },
      include: { subscription: true },
    });

    if (!mechanic) throw new NotFoundException('Mechanic not found');
    if (mechanic.subscription) {
      throw new BadRequestException(
        'Active subscription already exists. Use upgrade/cancel instead.',
      );
    }

    const plan = SUBSCRIPTION_PLANS[dto.tier as SubscriptionTierKey];
    if (!plan) throw new BadRequestException('Invalid subscription tier');

    const priceId = plan.priceId();
    if (!priceId) {
      throw new BadRequestException(
        `Stripe Price ID not configured for tier ${dto.tier}`,
      );
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId = mechanic.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        email: mechanic.email ?? undefined,
        name: mechanic.name,
        metadata: { mechanicId },
      });
      stripeCustomerId = customer.id;
      await this.prisma.mechanic.update({
        where: { id: mechanicId },
        data: { stripeCustomerId },
      });
    }

    // Attach payment method to customer
    await this.stripe.paymentMethods.attach(dto.paymentMethodId, {
      customer: stripeCustomerId,
    });
    await this.stripe.customers.update(stripeCustomerId, {
      invoice_settings: { default_payment_method: dto.paymentMethodId },
    });

    // Create subscription with 7-day trial
    const subscription = await this.stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: priceId }],
      trial_period_days: plan.trialDays,
      expand: ['latest_invoice.payment_intent'],
      metadata: { mechanicId, tier: dto.tier },
    });

    const trialEnd = subscription.trial_end
      ? new Date(subscription.trial_end * 1000)
      : null;

    // Persist subscription record
    await this.prisma.$transaction([
      this.prisma.mechanicSubscription.create({
        data: {
          mechanicId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId,
          tier: dto.tier,
          status: subscription.status === 'trialing' ? 'TRIALING' : 'ACTIVE',
          currentPeriodStart: new Date(
            subscription.current_period_start * 1000,
          ),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          trialStart: trialEnd
            ? new Date(subscription.current_period_start * 1000)
            : null,
          trialEnd,
        },
      }),
      this.prisma.mechanic.update({
        where: { id: mechanicId },
        data: {
          stripeCustomerId,
          stripeSubscriptionId: subscription.id,
          subscriptionStatus:
            subscription.status === 'trialing' ? 'TRIALING' : 'ACTIVE',
          subscriptionTier: dto.tier,
          subscriptionStartAt: new Date(
            subscription.current_period_start * 1000,
          ),
          subscriptionEndAt: new Date(subscription.current_period_end * 1000),
          trialEndsAt: trialEnd,
          isActive: true,
        },
      }),
    ]);

    return {
      subscriptionId: subscription.id,
      status: subscription.status,
      trialEnd,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    };
  }

  async cancelSubscription(mechanicId: string) {
    const subscription = await this.prisma.mechanicSubscription.findUnique({
      where: { mechanicId },
    });
    if (!subscription) throw new NotFoundException('No active subscription');

    await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await this.prisma.$transaction([
      this.prisma.mechanicSubscription.update({
        where: { mechanicId },
        data: { cancelAtPeriodEnd: true },
      }),
      this.prisma.mechanic.update({
        where: { id: mechanicId },
        data: { subscriptionStatus: 'CANCELLED' },
      }),
    ]);

    return { cancelled: true, message: 'Subscription will end at period end' };
  }

  async getSubscriptionStatus(mechanicId: string) {
    const subscription = await this.prisma.mechanicSubscription.findUnique({
      where: { mechanicId },
    });
    if (!subscription) {
      return { status: 'INACTIVE', tier: null };
    }
    return subscription;
  }

  /** Called by webhook handler on Stripe subscription events */
  async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription) {
    const mechanicId = stripeSubscription.metadata?.mechanicId;
    if (!mechanicId) return;

    const statusMap: Record<string, string> = {
      active: 'ACTIVE',
      trialing: 'TRIALING',
      past_due: 'PAST_DUE',
      canceled: 'CANCELLED',
      incomplete: 'INACTIVE',
      incomplete_expired: 'INACTIVE',
      unpaid: 'PAST_DUE',
      paused: 'INACTIVE',
    };

    const status = statusMap[stripeSubscription.status] ?? 'INACTIVE';
    const isActive = status === 'ACTIVE' || status === 'TRIALING';
    const tier =
      (stripeSubscription.metadata?.tier as
        | 'BASIC'
        | 'PRO'
        | 'PREMIUM'
        | undefined) ?? undefined;

    await this.prisma.$transaction(async (tx) => {
      await tx.mechanic.update({
        where: { id: mechanicId },
        data: {
          subscriptionStatus: status as
            | 'INACTIVE'
            | 'TRIALING'
            | 'ACTIVE'
            | 'PAST_DUE'
            | 'CANCELLED',
          subscriptionTier: tier,
          isActive,
          subscriptionEndAt: new Date(
            stripeSubscription.current_period_end * 1000,
          ),
        },
      });

      await tx.mechanicSubscription
        .update({
          where: { mechanicId },
          data: {
            status: status as
              | 'INACTIVE'
              | 'TRIALING'
              | 'ACTIVE'
              | 'PAST_DUE'
              | 'CANCELLED',
            currentPeriodStart: new Date(
              stripeSubscription.current_period_start * 1000,
            ),
            currentPeriodEnd: new Date(
              stripeSubscription.current_period_end * 1000,
            ),
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          },
        })
        .catch(() => null);
    });

    this.logger.log(
      `Subscription updated for mechanic ${mechanicId}: ${status}`,
    );
  }
}
