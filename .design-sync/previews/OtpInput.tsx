import * as React from 'react';
import { OtpInput } from '@ids-group-ltd/ids-design-system';

const col: React.CSSProperties = { display: 'grid', gap: 20, justifyItems: 'start' };

/** 6-digit numeric code, partially entered, with a helper hint. */
export const Basic = () => (
  <div style={col}>
    <OtpInput
      length={6}
      value="482"
      ariaLabel="Delivery verification code"
      hint="Enter the 6-digit code from the consignee's SMS."
    />
  </div>
);

/** 4-digit PIN with mask — cells render password dots. */
export const MaskedPin = () => (
  <div style={col}>
    <OtpInput length={4} mask value="7301" ariaLabel="Driver terminal PIN" />
  </div>
);

/** Alphanumeric mode accepts letters — e.g. a collection reference. */
export const Alphanumeric = () => (
  <div style={col}>
    <OtpInput length={6} mode="alphanumeric" value="Q7K2FD" ariaLabel="Collection reference" />
  </div>
);

/** Error and disabled treatments. */
export const States = () => (
  <div style={col}>
    <OtpInput
      length={6}
      value="119402"
      invalid
      ariaLabel="Delivery verification code — error"
      hint="That code is incorrect. Ask the consignee to resend it."
    />
    <OtpInput length={6} value="52" disabled ariaLabel="Delivery verification code — disabled" />
  </div>
);
