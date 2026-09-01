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

    // Without a cap the region is unlimited, and the section that fires five at once
    // could bury the page under them — which is also why the cap demo showed nothing.
    { provide: DS_TOAST_CONFIG, useValue: { maxVisible: 3 } },
  ],
};
