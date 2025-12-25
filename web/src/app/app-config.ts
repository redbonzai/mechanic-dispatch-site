import { InjectionToken } from '@angular/core';

export interface AppConfig {
  apiBase: string;
  stripePublishableKey: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');














