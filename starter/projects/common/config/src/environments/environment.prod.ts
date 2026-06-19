import { Environment } from '@app/common';

export const environment: Environment = {
  name: 'production',
  baseUrl: 'https://api.example.com',
  sentryDsn: '',
  features: {
    enableProfiler: false,
  },
};
