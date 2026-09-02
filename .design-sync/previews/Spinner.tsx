import * as React from 'react';
import { Spinner } from '@ids-group-ltd/ids-design-system';

/** sm / md / lg spinner sizes. */
export const Sizes = () => (
  <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
    <Spinner size="sm" />
    <Spinner />
    <Spinner size="lg" />
  </div>
);
