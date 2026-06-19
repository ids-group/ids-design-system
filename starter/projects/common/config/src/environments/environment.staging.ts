import { Environment } from '@app/common';

export const environment: Environment = {
  name: 'staging',
  baseUrl: 'https://api.staging.example.com',
  sentryDsn: '',
  features: {
    enableProfiler: false,
  },
};
