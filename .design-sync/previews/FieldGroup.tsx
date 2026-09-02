import * as React from 'react';
import { FieldGroup, Input, Select, Button } from '@ids-group-ltd/ids-design-system';

const codes = [
  { value: 'uk', label: '+44' },
  { value: 'ie', label: '+353' },
];

const col: React.CSSProperties = { display: 'grid', gap: 16, width: 420 };

/** A select joined to an input — the seam between them collapses to one border. */
export const Joined = () => (
  <div style={col}>
    <FieldGroup size="md" fullWidth>
      <Select size="md" options={codes} value="uk" />
      <Input size="md" placeholder="7700 900123" />
    </FieldGroup>
  </div>
);

/** `size` must match the children's own size, or the seam shows. */
export const Sizes = () => (
  <div style={col}>
    <FieldGroup size="sm" fullWidth>
      <Select size="sm" options={codes} value="uk" />
      <Input size="sm" placeholder="Small" />
    </FieldGroup>
    <FieldGroup size="lg" fullWidth>
      <Select size="lg" options={codes} value="ie" />
      <Input size="lg" placeholder="Large" />
    </FieldGroup>
  </div>
);

/** `invalid` and `disabled` paint the whole group, so it reads as one control. */
export const States = () => (
  <div style={col}>
    <FieldGroup size="md" fullWidth invalid>
      <Select size="md" options={codes} value="uk" />
      <Input size="md" value="not a number" />
    </FieldGroup>
    <FieldGroup size="md" fullWidth disabled>
      <Input size="md" value="Locked" disabled />
      <Button disabled>Apply</Button>
    </FieldGroup>
  </div>
);
