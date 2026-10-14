import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideDsConfig } from '@ids-group-ltd/ids-design-system/core';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'en-US' },
    provideDsConfig({
      locale: 'en-US',
      datePicker: { dateFormat: 'DD/MM/YYYY' },
    }),
  ],
};
