import * as React from 'react';
import { SplitButton, type SplitButtonItem } from '@ids-group-ltd/ids-design-system';

const row: React.CSSProperties = { display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' };

const saveActions: SplitButtonItem[] = [
  { label: 'Save as…', value: 'save-as', icon: 'copy' },
  { label: 'Save a copy', value: 'copy' },
  { label: 'Discard changes', value: 'discard', icon: 'trash', error: true },
];

const exportActions: SplitButtonItem[] = [
  { label: 'CSV', value: 'csv' },
  { label: 'PDF', value: 'pdf' },
  { label: 'JSON', value: 'json' },
];

const dispatchActions: SplitButtonItem[] = [
  { label: 'Dispatch tomorrow', value: 'tomorrow', icon: 'calendar' },
  { label: 'Assign to driver…', value: 'assign', icon: 'user' },
  { label: 'Cancel dispatch', value: 'cancel', icon: 'x', error: true },
];

/** Primary (solid) and outline variants, closed. Main action fires
 *  immediately; the chevron reveals the alternatives. */
export const Variants = () => (
  <div style={row}>
    <SplitButton label="Save" menuLabel="More save options" menuItems={saveActions} />
    <SplitButton label="Export" variant="outline" menuLabel="Export format" menuItems={exportActions} />
  </div>
);

/** Open state — the popover-hosted menu renders inline beside the control
 *  (no portal); disabled and error items keep their menu styling. */
export const Open = () => (
  <div style={row}>
    <SplitButton label="Save" menuLabel="More save options" menuItems={saveActions} open />
  </div>
);

/** Outline variant open, with a main-button icon. */
export const OutlineOpen = () => (
  <div style={row}>
    <SplitButton
      label="Dispatch"
      icon="truck"
      variant="outline"
      menuLabel="Dispatch options"
      menuItems={dispatchActions}
      open
    />
  </div>
);

/** Disabled greys both the main button and the dropdown trigger. */
export const Disabled = () => (
  <div style={row}>
    <SplitButton label="Save" menuItems={saveActions} disabled />
    <SplitButton label="Export" variant="outline" menuItems={exportActions} disabled />
  </div>
);
