import * as React from 'react';

/**
 * FieldGroup — the real FieldGroupComponent, run by Angular behind `<ds-x-field-group>`.
 * Joins adjacent form controls into one visual field — a select beside an input, a prefix button before a search. The controls keep their own behaviour; only the box is shared.
 */
export interface FieldGroupProps {
  /** Segment height — the field family's scale, so a group lines up with a plain field beside it. Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** Draws the error border on the whole group. A single segment cannot be invalid on its own: the border belongs to the group. */
  invalid?: boolean;
  /** Dims the group. Disable the CONTROLS too — this is the chrome, not their interactivity. */
  disabled?: boolean;
  /** Fills the container instead of hugging its segments. */
  fullWidth?: boolean;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const FieldGroup: React.ComponentType<FieldGroupProps>;
