import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideDsConfig } from 'ds/core';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // Every banner and alert on the site is a specimen, none an event: deciding it here keeps
    // the two announce warnings out of the docs console.
    provideDsConfig({
      banner: { announce: false },
      alert: { announce: false },
    }),
  ],
};
