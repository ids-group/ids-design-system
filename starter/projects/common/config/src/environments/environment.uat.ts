import { Environment } from '@app/common';

export const environment: Environment = {
  name: 'uat',
  baseUrl: 'https://api.uat.example.com',
  sentryDsn: '',
  features: {
    enableProfiler: false,
  },
};
