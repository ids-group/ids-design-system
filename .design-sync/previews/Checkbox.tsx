import * as React from 'react';
import { Checkbox } from '@ids-group-ltd/ids-design-system';

const col: React.CSSProperties = { display: 'grid', gap: 12, width: 320 };
const row: React.CSSProperties = { display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' };

/** The five visual states — unchecked, checked, mixed, and both disabled looks. */
export const States = () => (
  <div style={col}>
    <Checkbox label="Signature required on delivery" />
    <Checkbox label="Fragile — handle with care" checked />
    <Checkbox label="All depot alerts" indeterminate />
    <Checkbox label="Saturday delivery" disabled />
    <Checkbox label="Customs declared" checked disabled />
  </div>
);

/** sm / md / lg boxes with matching label type scale. */
export const Sizes = () => (
  <div style={row}>
    <Checkbox size="sm" label="Small" />
    <Checkbox size="md" label="Medium" />
    <Checkbox size="lg" label="Large" />
  </div>
);

/** Required marker, helper hint, and the invalid (error) treatment. */
export const Validation = () => (
  <div style={col}>
    <Checkbox label="Accept carrier terms" required />
    <Checkbox label="Notify recipient by SMS" hint="Sent to the number on the order." />
    <Checkbox label="Accept carrier terms" hint="You must accept the terms to book the collection." invalid />
  </div>
);
