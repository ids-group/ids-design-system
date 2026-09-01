import * as React from 'react';
import { FieldMessage } from '@ids-group-ltd/ids-design-system';

const col: React.CSSProperties = { display: 'grid', gap: 14, width: 420 };

/** Every state with its own glyph: hint, error, success, warning. */
export const States = () => (
  <div style={col}>
    <FieldMessage text="We only use this to send delivery updates." />
    <FieldMessage state="error" text="Enter a valid postcode." />
    <FieldMessage state="success" text="Postcode verified." />
    <FieldMessage state="warning" text="This depot closes at 17:00." />
  </div>
);

/** `icon` overrides the state glyph; `false` removes it entirely. */
export const Icons = () => (
  <div style={col}>
    <FieldMessage state="warning" text="Default warning glyph." />
    <FieldMessage state="warning" icon="clock" text="Overridden glyph." />
    <FieldMessage state="error" icon={false} text="No glyph at all." />
  </div>
);

/** `reserve` keeps the line's height when there is no text, so a form does not jump. */
export const Reserved = () => (
  <div style={col}>
    <FieldMessage reserve text="" />
    <FieldMessage reserve state="error" text="Now the message appears, and nothing moved." />
  </div>
);
