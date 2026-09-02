import * as React from 'react';
import { Card, Skeleton } from '@ids-group-ltd/ids-design-system';

/** Line placeholders — size the host with `width`/`height`. */
export const TextLines = () => (
  <div style={{ display: 'grid', gap: 8, width: 320 }}>
    <Skeleton width="100%" height="14px" />
    <Skeleton width="100%" height="14px" />
    <Skeleton width="60%" height="14px" />
  </div>
);

/** `circle` for avatar/dot stand-ins; `inline` sits in a text run. */
export const Shapes = () => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
    <Skeleton width="40px" height="40px" circle />
    <Skeleton width="64px" height="64px" circle />
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} className="t-s">
      ETA <Skeleton inline width="48px" height="12px" />
    </span>
  </div>
);

/** A loading shipment card — circle avatar + heading and body lines. */
export const CardPlaceholder = () => (
  <div style={{ width: 320 }}>
    <Card elevation="raised" padding="md">
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <Skeleton width="40px" height="40px" circle />
        <div style={{ display: 'grid', gap: 6, flex: 1 }}>
          <Skeleton width="70%" height="14px" />
          <Skeleton width="40%" height="12px" />
        </div>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        <Skeleton width="100%" height="12px" />
        <Skeleton width="100%" height="12px" />
        <Skeleton width="55%" height="12px" />
      </div>
    </Card>
  </div>
);
