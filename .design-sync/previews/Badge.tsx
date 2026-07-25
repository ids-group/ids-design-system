import * as React from 'react';
import { Badge } from '@ids-group-ltd/ids-design-system';

const row: React.CSSProperties = { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' };

/** Default (neutral) chips — colour comes from the consumer's status wiring;
 *  unset status renders the neutral surface. */
export const Labels = () => (
  <div style={row}>
    <Badge>Draft</Badge>
    <Badge withDot>In transit</Badge>
    <Badge solid>New</Badge>
  </div>
);

/** Numeric counts — capped at `max`, shown as "max+" beyond it. */
export const Counts = () => (
  <div style={row}>
    <Badge count={3} />
    <Badge count={12} />
    <Badge count={140} />
    <Badge count={140} max={120} />
  </div>
);
