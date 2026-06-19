import { Environment } from '@app/common';

export const environment: Environment = {
  name: 'test',
  baseUrl: 'https://api.test.example.com',
  sentryDsn: '',
  features: {
    enableProfiler: true,
  },
};
