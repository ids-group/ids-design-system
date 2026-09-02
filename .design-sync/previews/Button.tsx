import * as React from 'react';
import { Button } from '@ids-group-ltd/ids-design-system';

const row: React.CSSProperties = { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' };

/** The four canonical fill patterns at the default primary colour. */
export const Variants = () => (
  <div style={row}>
    <Button>Save changes</Button>
    <Button variant="tonal">Duplicate</Button>
    <Button variant="outline">Preview</Button>
    <Button variant="ghost">Cancel</Button>
  </div>
);

/** Colour families on the solid + tonal fills (the recommended pairings). */
export const Colors = () => (
  <div style={{ display: 'grid', gap: 12 }}>
    <div style={row}>
      <Button>Primary</Button>
      <Button color="secondary">Secondary</Button>
      <Button color="tertiary">Tertiary</Button>
      <Button color="success">Approve</Button>
      <Button color="error">Delete</Button>
    </div>
    <div style={row}>
      <Button color="neutral" variant="tonal">Neutral tonal</Button>
      <Button color="warning" variant="tonal">Hold order</Button>
      <Button color="error" variant="outline">Remove</Button>
      <Button color="neutral" variant="ghost">Dismiss</Button>
    </div>
  </div>
);

/** sm / md / lg = 32 / 40 / 48px — aligned with input and select heights. */
export const Sizes = () => (
  <div style={row}>
    <Button size="sm">Small</Button>
    <Button size="md">Medium</Button>
    <Button size="lg">Large</Button>
  </div>
);

/** Leading/trailing icons and the subtext slot. */
export const WithIcons = () => (
  <div style={row}>
    <Button icon="plus">New shipment</Button>
    <Button variant="outline" trailingIcon="chevronDown">Actions</Button>
    <Button variant="tonal" icon="download" subtext="CSV, ~2 MB">Export report</Button>
  </div>
);

/** Disabled blocks interaction; loading disables and shows the busy state. */
export const States = () => (
  <div style={row}>
    <Button disabled>Disabled</Button>
    <Button loading>Saving…</Button>
    <Button variant="outline" disabled>Disabled outline</Button>
  </div>
);

/** Full-width — for mobile primary CTAs and full-bleed form submits. */
export const FullWidth = () => (
  <div style={{ width: 320 }}>
    <Button fullWidth>Place order</Button>
  </div>
);
