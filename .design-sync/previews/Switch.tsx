import * as React from 'react';
import { Switch } from '@ids-group-ltd/ids-design-system';

const col: React.CSSProperties = { display: 'grid', gap: 12, width: 320 };
const row: React.CSSProperties = { display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' };

/** Off / on plus both disabled looks. */
export const States = () => (
  <div style={col}>
    <Switch label="Send dispatch notifications" />
    <Switch label="Auto-assign nearest driver" checked />
    <Switch label="Weekend routing" disabled />
    <Switch label="Fuel surcharge" checked disabled />
  </div>
);

/** Success and error track colours for status-flavoured toggles. */
export const Variants = () => (
  <div style={col}>
    <Switch variant="success" label="Live tracking" checked />
    <Switch variant="error" label="Depot locked" checked />
  </div>
);

/** sm / md / lg tracks with matching label type scale. */
export const Sizes = () => (
  <div style={row}>
    <Switch size="sm" label="Small" />
    <Switch size="md" label="Medium" />
    <Switch size="lg" label="Large" />
  </div>
);

/** Required marker, helper hint, and the invalid (error) treatment. */
export const Validation = () => (
  <div style={col}>
    <Switch label="Share telemetry" required />
    <Switch label="Email notifications" checked hint="Sent to dispatch@ids-group.co.uk." />
    <Switch label="Email notifications" hint="At least one notification channel must stay active." invalid />
  </div>
);
