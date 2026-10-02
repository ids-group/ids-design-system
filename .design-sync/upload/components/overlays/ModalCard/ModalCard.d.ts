import * as React from 'react';

/**
 * ModalCard — the real ModalCardComponent, run by Angular behind `<ds-x-modal-card>`.
 * Bare dialog card — port of `ds-modal-card`: the modal surface with header, body, impact and actions but **no scrim or positioning**. It renders in normal flow, which makes it the right choice for static specimens (the DS docs compare sizes side by side exactly this way); `Modal` composes it inside the backdrop for the real dialog.
 */
export interface ModalCardProps {
  /** Card width. */
  size?: (('sm' | 'md' | 'lg') | 'xl' | 'fullscreen');
  /** Severity: drives the icon-badge tint, title colour, DEFAULT icon and ARIA role. Null (default) is a neutral dialog; `icon` overrides the picked icon. `false` and `undefined` land on null too, so `[status]="isDangerous && 'error'"` binds. */
  status?: ('info' | 'success' | 'warning' | 'error') | null;
  /** Card title, shown in the header and used for `aria-labelledby`. */
  title?: string;
  /** Secondary line under the title. Not part of the accessible name. */
  subtitle?: string | null;
  /** Shows the header close button. */
  showClose?: boolean;
  /** Draws the rules under the header and over the actions; off also tightens the vertical padding. Unset falls back to `DS_CONFIG.modal.dividers`, then `true`. */
  dividers?: boolean | null;
  /** Icon badge shown next to the title. Overrides the icon `status` would pick. */
  icon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'slash' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | (string & {}) /* +69 more */ | null;
  /** ARIA role. Unset, an error or warning becomes `alertdialog`; anything else stays `dialog`. */
  dialogRole?: 'dialog' | 'alertdialog' | null;
  /** Fires when the header close button is clicked. */
  onClosed?: (value: void) => void;
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

export declare const ModalCard: React.ComponentType<ModalCardProps>;
