import { InjectionToken } from '@angular/core';

export interface AppConfig {
  stripePublishableKey: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');
