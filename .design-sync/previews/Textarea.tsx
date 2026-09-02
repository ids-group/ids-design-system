import * as React from 'react';
import { Textarea } from '@ids-group-ltd/ids-design-system';

const col: React.CSSProperties = { display: 'grid', gap: 16, width: 360 };

/** Label + placeholder + hint, and a filled field. */
export const Basic = () => (
  <div style={col}>
    <Textarea
      label="Delivery instructions"
      placeholder="Gate codes, safe places, access notes…"
      hint="Shared with the driver on the day."
    />
    <Textarea
      label="Damage report"
      value="Outer carton crushed on the left side; inner packaging intact. Photos attached to consignment IDS-88412."
    />
  </div>
);

/** Error, disabled and read-only treatments. */
export const States = () => (
  <div style={col}>
    <Textarea label="Reason for return" hint="A reason is required to raise an RMA." invalid required />
    <Textarea label="Customs notes" value="Auto-filled from the commodity code." disabled />
    <Textarea
      label="Generated summary"
      value="Route LDS-04: 38 drops, 2 collections. Depart Cross Green 06:15."
      readOnly
    />
  </div>
);

/** sm / md / lg paddings and type scale. */
export const Sizes = () => (
  <div style={col}>
    <Textarea size="sm" label="Small" placeholder="Compact field" rows={2} />
    <Textarea size="md" label="Medium" placeholder="Default field" rows={2} />
    <Textarea size="lg" label="Large" placeholder="Roomy field" rows={2} />
  </div>
);

/** maxLength caps input and shows a live current/max counter next to the hint. */
export const CharacterCounter = () => (
  <div style={col}>
    <Textarea
      label="Label note"
      value="Leave at the side gate, ring twice."
      maxLength={80}
      hint="Printed on the parcel label."
    />
  </div>
);

/** Autosize grows with content between minRows and maxRows, then scrolls. */
export const Autosize = () => (
  <div style={col}>
    <Textarea
      label="Handover notes"
      autosize
      minRows={2}
      maxRows={6}
      value={'Recipient works nights — do not knock before 10:00.\nUse the intercom for unit 12.\nDog on site: friendly, but keep the gate shut.'}
    />
  </div>
);
