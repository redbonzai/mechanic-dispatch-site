export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  searchCount: number;
  isEmailVerified?: boolean;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  vin?: string;
  licensePlate?: string;
  plateState?: string;
  notes?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserAuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Mechanic {
  id: string;
  email?: string;
  name: string;
  slug: string;
  bio?: string;
  shopName?: string;
  phone?: string;
  website?: string;
  imageUrl?: string;
  location: string;
  yearsExperience: number;
  rating: number;
  reviewCount: number;
  profileViews: number;
  searchAppearances: number;
  linkClicks: number;
  subscriptionStatus: SubscriptionStatus;
  subscriptionTier?: SubscriptionTier;
  trialEndsAt?: string;
  certifications: string[];
  skills: Array<{ skill: { id: string; name: string; category?: string } }>;
  isActive: boolean;
}

export type SubscriptionStatus =
  | 'INACTIVE'
  | 'TRIALING'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'CANCELLED';

export type SubscriptionTier = 'BASIC' | 'PRO' | 'PREMIUM';

export interface MechanicAuthResponse {
  mechanic: Mechanic;
  accessToken: string;
  refreshToken: string;
}

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  priceMonthly: number;
  features: string[];
  trialDays: number;
}
