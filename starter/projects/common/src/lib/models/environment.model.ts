export type EnvironmentName =
  | 'development'
  | 'test'
  | 'prototype'
  | 'uat'
  | 'staging'
  | 'production';

export interface Environment {
  name: EnvironmentName;
  baseUrl: string;
  features: {
    enableProfiler: boolean;
  };
}
