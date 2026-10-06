import * as React from 'react';

/**
 * Modal — the real ModalComponent, run by Angular behind `<ds-modal>`.
 * Centered dialog over a scrim — port of `ds-modal`. Renders INLINE (no portal): the `.modal-backdrop` scrim is `position: fixed; inset: 0`, so it covers the whole viewport unless an ancestor forms a containing block (`transform`, `filter` or `contain`) — for contained specimens either wrap it in one, or set `staticPreview` (the DS's own docs mechanism) to render the bare card in normal flow with no scrim.
 */
export interface ModalProps {
  /** Open state, two-way bound. */
  open?: boolean;
  onOpenChange?: (value: boolean) => void;
  /** Dialog width. */
  size?: (('sm' | 'md' | 'lg') | 'xl' | 'fullscreen');
  /** Severity, forwarded to the card. Null (default) is a neutral dialog. `false` and `undefined` land on null too, so `[status]="isDangerous && 'error'"` binds. */
  status?: ('info' | 'success' | 'warning' | 'error') | null;
  /** Dialog title, shown in the header and used for `aria-labelledby`. */
  title?: string;
  /** Secondary line under the title. Not part of the accessible name. */
  subtitle?: string | null;
  /** Fires once the close (leave) animation finishes. */
  onClosed?: (value: void) => void;
  /** Fires when the projected `dsModalConfirm` action is pressed. The modal stays open. */
  onConfirmed?: (value: void) => void;
  /** Draws the rules under the header and over the actions; off also tightens the vertical padding. Unset falls back to `DS_CONFIG.modal.dividers`, then `true`. */
  dividers?: boolean | null;
  /** When false, clicking the scrim does not close the modal. */
  closeOnBackdrop?: boolean;
  /** When true, neither backdrop click nor Escape closes the modal. */
  persistent?: boolean;
  staticPreview?: boolean;
  /** Content for the `[eyebrow]` slot. */
  eyebrow?: React.ReactNode;
  /** Content for the `[title-badge]` slot. */
  titleBadge?: React.ReactNode;
  /** Content for the `[body]` slot. */
  body?: React.ReactNode;
  /** Content for the `[impact]` slot. */
  impact?: React.ReactNode;
  /** Content for the `[actions]` slot. */
  actions?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Modal: React.ComponentType<ModalProps>;
