import * as React from 'react';

/**
 * ModalCard — the real ModalCardComponent, run by Angular behind `<ds-x-modal-card>`.
 * Bare dialog card — port of `ds-modal-card`: the modal surface with header, body, impact and actions but **no scrim or positioning**. It renders in normal flow, which makes it the right choice for static specimens (the DS docs compare sizes side by side exactly this way); `Modal` composes it inside the backdrop for the real dialog.
 */
export interface ModalCardProps {
  /** Card width — sm/md/lg/xl/fullscreen. */
  size?: (('sm' | 'md' | 'lg') | 'xl' | 'fullscreen');
  /** Severity — drives the icon-badge tint, the title colour, the DEFAULT icon and the ARIA role, which is the same set `ds-alert`'s variant drives. Null (the default) is a neutral dialog. It picks an icon as well as a tint because a tint alone signals by colour only; `icon` overrides the pick. `false` and `undefined` land on null too, so a template can bind the short `[status]="isDangerous && 'error'"` instead of spelling out the ternary. */
  status?: ('info' | 'success' | 'warning' | 'error') | null;
  /** Card title, shown in the header and used for `aria-labelledby`. */
  title?: string;
  /** Secondary line under the title. Not part of the accessible name. */
  subtitle?: string | null;
  /** Shows the header close button. */
  showClose?: boolean;
  /** Draws the rules under the header and over the actions. Turning them off also tightens the vertical padding they were sized for. Unset falls back to `DS_CONFIG.modal.dividers`, then `true`. */
  dividers?: boolean | null;
  /** Icon badge shown next to the title. Overrides the icon `status` would pick. */
  icon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | 'warn' | (string & {}) /* +68 more */ | null;
  /** ARIA role. Unset, an error or warning becomes `alertdialog` — the role for a dialog that interrupts with something the reader must act on — and anything else stays `dialog`. Same split `ds-alert` makes between `alert` and `status`. */
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
