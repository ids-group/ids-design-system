import * as React from 'react';
import { StatusDot } from '@ids-group-ltd/ids-design-system';

const row: React.CSSProperties = { display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' };

/** The DS predefines NO statuses — the app wires `--ds-status-dot-color`
 *  per `[data-status]` key. Here each wrapper sets it inline. */
const line = (color: string | null, label: string, status: string) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      ...(color ? { ['--ds-status-dot-color' as string]: color } : {}),
    }}
    className="t-s"
  >
    <StatusDot status={status} ariaLabel={label} /> {label}
  </span>
);

/** Consumer-wired lifecycle colours next to their labels. */
export const Statuses = () => (
  <div style={row}>
    {line('var(--success)', 'Delivered', 'delivered')}
    {line('var(--info)', 'In transit', 'in-transit')}
    {line('var(--warning)', 'Held at depot', 'held')}
    {line('var(--error)', 'Delayed', 'delayed')}
  </div>
);

/** Without a wired key the dot renders the muted neutral colour. */
export const Neutral = () => (
  <div style={row}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} className="t-s">
      <StatusDot ariaLabel="Draft" /> Draft
    </span>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} className="t-s">
      <StatusDot status="planning" ariaLabel="Planning" /> Planning
    </span>
  </div>
);
