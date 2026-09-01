import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { DS_TOAST_CONFIG } from 'ds';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // The region is unlimited without this, and the toast section fires five at once.
    { provide: DS_TOAST_CONFIG, useValue: { maxVisible: 3 } },
  ],
};
