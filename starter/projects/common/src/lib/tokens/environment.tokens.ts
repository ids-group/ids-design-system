import { InjectionToken } from '@angular/core';
import { EnvironmentName } from '../models/environment.model';

/** API base URL for the active environment (provided in app.config from `environment`). */
export const BASE_URL = new InjectionToken<string>('BASE_URL');

/** Name of the active environment (development/test/uat/staging/prototype/production). */
export const ENVIRONMENT_NAME = new InjectionToken<EnvironmentName>(
  'ENVIRONMENT_NAME',
);
