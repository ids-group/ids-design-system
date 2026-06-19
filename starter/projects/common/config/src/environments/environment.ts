import { Environment } from '@app/common';

// Default (development) environment. Replaced per build configuration via
// angular.json `fileReplacements` (environment.prod.ts, .test.ts, etc.).
export const environment: Environment = {
  name: 'development',
  baseUrl: 'http://localhost:3000',
  features: {
    enableProfiler: true,
  },
};
