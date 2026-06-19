import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { BASE_URL, ENVIRONMENT_NAME } from '@app/common';
import { environment } from '@app/common/config';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    { provide: BASE_URL, useValue: environment.baseUrl },
    { provide: ENVIRONMENT_NAME, useValue: environment.name },
  ],
};
