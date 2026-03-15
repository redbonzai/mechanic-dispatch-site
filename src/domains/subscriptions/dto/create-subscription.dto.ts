import { IsEnum, IsString, IsNotEmpty } from 'class-validator';

export enum SubscriptionTierInput {
  BASIC = 'BASIC',
  PRO = 'PRO',
  PREMIUM = 'PREMIUM',
}

export class CreateSubscriptionDto {
  @IsEnum(SubscriptionTierInput)
  tier: SubscriptionTierInput;

  @IsString()
  @IsNotEmpty()
  paymentMethodId: string;
}
