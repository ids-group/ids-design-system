import { ApplicationConfig } from '@angular/core';
import { provideDsConfig } from '@ids-group-ltd/ids-design-system/core';

export const appConfig: ApplicationConfig = {
  providers: [provideDsConfig({ timePicker: {} })],
};
