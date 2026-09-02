import * as React from 'react';
import { Progress } from '@ids-group-ltd/ids-design-system';

const col: React.CSSProperties = { display: 'grid', gap: 16, width: 360 };
const caption: React.CSSProperties = {
  font: '600 12px/1.4 var(--font-sans)',
  color: 'var(--text-secondary)',
  marginBottom: 4,
};

/** Determinate values 0–100 on the default accent. */
export const Determinate = () => (
  <div style={col}>
    <div>
      <div style={caption}>Manifest upload · 12%</div>
      <Progress value={12} ariaLabel="Manifest upload" />
    </div>
    <div>
      <div style={caption}>Route optimisation · 30%</div>
      <Progress value={30} ariaLabel="Route optimisation" />
    </div>
    <div>
      <div style={caption}>Depot scan import · 70%</div>
      <Progress value={70} ariaLabel="Depot scan import" />
    </div>
    <div>
      <div style={caption}>Plan recompute · 100%</div>
      <Progress value={100} ariaLabel="Plan recompute" />
    </div>
  </div>
);

/** Status variants recolour the bar — success / warning / error. */
export const Variants = () => (
  <div style={col}>
    <div>
      <div style={caption}>success · 70%</div>
      <Progress variant="success" value={70} ariaLabel="Deliveries completed" />
    </div>
    <div>
      <div style={caption}>warning · 92%</div>
      <Progress variant="warning" value={92} ariaLabel="Lane 04 capacity" />
    </div>
    <div>
      <div style={caption}>error · 100%</div>
      <Progress variant="error" value={100} ariaLabel="Storage quota" />
    </div>
  </div>
);

/** Unknown duration — looping sweep, no `value`/`aria-valuenow`. */
export const Indeterminate = () => (
  <div style={col}>
    <div>
      <div style={caption}>Fetching asset register…</div>
      <Progress indeterminate ariaLabel="Fetching asset register" />
    </div>
  </div>
);
