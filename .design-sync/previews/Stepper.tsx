import * as React from 'react';
import { Stepper } from '@ids-group-ltd/ids-design-system';

const journey = ['Booked', 'Collected', 'At hub', 'Out for delivery', 'Delivered'] as const;

/** Horizontal wizard — completed checks, filled current node, outlined
 *  upcoming numerals. (Steps flex to fill, so the container sets the width.) */
export const Horizontal = () => (
  <div style={{ width: 560 }}>
    <Stepper steps={journey} current={2} />
  </div>
);

/** labelPosition="inline" — compact header row, caption beside each node. */
export const InlineLabels = () => (
  <Stepper labelPosition="inline" steps={journey} current={2} />
);

/** errorSteps marks failed steps; error wins over completed/current/upcoming. */
export const WithError = () => (
  <div style={{ width: 560 }}>
    <Stepper
      steps={['Booked', 'Collected', 'Customs check', 'Delivery', 'POD']}
      current={3}
      errorSteps={[2]}
    />
  </div>
);

/** Vertical orientation — steps stack top-to-bottom, connectors run down. */
export const Vertical = () => (
  <Stepper orientation="vertical" steps={journey} current={2} />
);
