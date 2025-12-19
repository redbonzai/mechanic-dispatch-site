import { ServiceRequestStatus } from '../enums/service-request-status.enum';

export interface ServiceRequestProps {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  amountCents: number;
  finalAmountCents?: number | null;
  stripePaymentIntentId?: string | null;
  finalPaymentIntentId?: string | null;
  stripeCustomerId?: string | null;
  stripePaymentMethodId?: string | null;
  status: ServiceRequestStatus;
}

export class ServiceRequest {
  private constructor(private readonly props: ServiceRequestProps) {}

  static create(props: ServiceRequestProps): ServiceRequest {
    return new ServiceRequest(props);
  }

  get id(): string {
    return this.props.id;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get email(): string {
    return this.props.email;
  }

  get phone(): string {
    return this.props.phone;
  }

  get addressLine1(): string {
    return this.props.addressLine1;
  }

  get addressLine2(): string | null | undefined {
    return this.props.addressLine2 ?? null;
  }

  get city(): string {
    return this.props.city;
  }

  get state(): string {
    return this.props.state;
  }

  get postalCode(): string {
    return this.props.postalCode;
  }

  get country(): string {
    return this.props.country;
  }

  get vehicleMake(): string {
    return this.props.vehicleMake;
  }

  get vehicleModel(): string {
    return this.props.vehicleModel;
  }

  get vehicleYear(): number {
    return this.props.vehicleYear;
  }

  get amountCents(): number {
    return this.props.amountCents;
  }

  get finalAmountCents(): number | null | undefined {
    return this.props.finalAmountCents ?? null;
  }

  get stripePaymentIntentId(): string | null | undefined {
    return this.props.stripePaymentIntentId ?? null;
  }

  get finalPaymentIntentId(): string | null | undefined {
    return this.props.finalPaymentIntentId ?? null;
  }

  get stripeCustomerId(): string | null | undefined {
    return this.props.stripeCustomerId ?? null;
  }

  get stripePaymentMethodId(): string | null | undefined {
    return this.props.stripePaymentMethodId ?? null;
  }

  get status(): ServiceRequestStatus {
    return this.props.status;
  }

  withStripePaymentIntentId(id: string): ServiceRequest {
    return ServiceRequest.create({
      ...this.props,
      stripePaymentIntentId: id,
    });
  }

  withStripeMetadata(metadata: {
    customerId?: string | null;
    paymentMethodId?: string | null;
    finalPaymentIntentId?: string | null;
    finalAmountCents?: number | null;
  }): ServiceRequest {
    return ServiceRequest.create({
      ...this.props,
      stripeCustomerId: metadata.customerId ?? this.props.stripeCustomerId,
      stripePaymentMethodId: metadata.paymentMethodId ?? this.props.stripePaymentMethodId,
      finalPaymentIntentId: metadata.finalPaymentIntentId ?? this.props.finalPaymentIntentId,
      finalAmountCents: metadata.finalAmountCents ?? this.props.finalAmountCents,
    });
  }

  withStatus(status: ServiceRequestStatus): ServiceRequest {
    return ServiceRequest.create({
      ...this.props,
      status,
    });
  }

  toJSON(): ServiceRequestProps {
    return { ...this.props };
  }
}




