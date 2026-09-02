import * as React from 'react';
import { PasswordRules } from '@ids-group-ltd/ids-design-system';

const rules = [
  { label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
  { label: 'One uppercase letter', test: (value: string) => /[A-Z]/.test(value) },
  { label: 'One number', test: (value: string) => /\d/.test(value) },
  { label: 'One symbol', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

const col: React.CSSProperties = { display: 'grid', gap: 20, width: 420 };

/** Nothing typed yet — every rule is pending, and the user sees what is expected. */
export const Empty = () => (
  <div style={col}>
    <PasswordRules value="" rules={rules} listId="pw-empty" />
  </div>
);

/** Partly satisfied: met rules tick, the rest stay visible. */
export const Partial = () => (
  <div style={col}>
    <PasswordRules value="Shipment1" rules={rules} listId="pw-partial" />
  </div>
);

/** All four met. */
export const AllMet = () => (
  <div style={col}>
    <PasswordRules value="Shipment1!" rules={rules} listId="pw-met" />
  </div>
);

/** `columns={2}` for a long rule set in a narrow card. */
export const TwoColumns = () => (
  <div style={{ width: 420 }}>
    <PasswordRules value="Shipment1" rules={rules} columns={2} listId="pw-cols" />
  </div>
);
