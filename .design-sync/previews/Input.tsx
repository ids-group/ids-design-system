import * as React from 'react';
import { Input, Button } from '@ids-group-ltd/ids-design-system';

const col: React.CSSProperties = { display: 'grid', gap: 16, width: 320 };

/** Label above the field, helper text below. */
export const Basic = () => (
  <div style={col}>
    <Input label="Email address" placeholder="you@company.co.uk" hint="Work email preferred." />
    <Input label="Company" placeholder="IDS Group Ltd" required />
    <Input label="VAT number" placeholder="GB 123 4567 89" optional />
  </div>
);

/** Validation + interaction states. */
export const States = () => (
  <div style={col}>
    <Input label="Username" value="mikhail.shyshla" invalid hint="This username is already taken." />
    <Input label="Delivery postcode" value="EC1A 1BB" success="We deliver to this area." />
    <Input label="Account ID" value="IDS-0042" disabled />
    <Input label="Reference" value="PO-2026-1183" readOnly />
    <Input label="Domain" value="ids-group" loading hint="Checking availability…" />
  </div>
);

/** sm / md / lg field heights — aligned with button and select. */
export const Sizes = () => (
  <div style={col}>
    <Input size="sm" label="Small" placeholder="32px control" />
    <Input size="md" label="Medium" placeholder="40px control" />
    <Input size="lg" label="Large" placeholder="48px control" />
  </div>
);

/** Floating label sits inside a taller control. */
export const FloatingLabel = () => (
  <div style={col}>
    <Input label="Recipient name" value="Amelia Barnes" />
    <Input label="Phone" placeholder=" " />
  </div>
);

/** Search is clearable by default; password gets a show/hide toggle;
 *  maxLength adds a live character counter. */
export const Affordances = () => (
  <div style={col}>
    <Input type="search" ariaLabel="Search shipments" placeholder="Search shipments…" value="fragile" />
    <Input type="password" label="Password" value="hunter2-rosebud" passwordToggle />
    <Input label="Tracking note" value="Leave at the side gate" maxLength={40} />
  </div>
);
