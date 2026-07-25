import * as React from 'react';
import { cx, host, nextControlId } from '../lib/util';
import { Icon, type IconName } from '../lib/Icon';
import { Button } from './Button';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
export type ModalConfirmTone = 'default' | 'error';

export interface ModalCardProps {
  /** Card width — sm/md/lg/xl/fullscreen. Default 'md'. */
  size?: ModalSize;
  /** Renders the error styling (icon badge and card accent). */
  error?: boolean;
  /** Card title, shown in the header and used for `aria-labelledby`. */
  title: string;
  /** Shows the header close button. Default true. */
  showClose?: boolean;
  /** Icon badge shown next to the title. */
  icon?: IconName | null;
  /** ARIA role for the dialog element. */
  dialogRole?: 'dialog' | 'alertdialog';
  /** id of the element that describes the dialog — set on the host, mirroring
   *  how `ds-modal-confirm` binds `attr.aria-describedby` in Angular. */
  ariaDescribedBy?: string;
  /** Fires when the header close button is clicked. */
  onClosed?: () => void;
  /** Main dialog content (the `[body]` slot). */
  children?: React.ReactNode;
  /** Affected-records / consequence block under the body (the `[impact]`
   *  slot). Hidden entirely when empty (`.impact:empty`). */
  impact?: React.ReactNode;
  /** Footer action buttons (the `[actions]` slot). NOTE: the footer strip
   *  (padding + top border) renders even when this is empty — same as Angular. */
  actions?: React.ReactNode;
}

/** Bare dialog card — port of `ds-modal-card`. The card without any scrim or
 *  positioning: render it in flow for static specimens (the DS docs compare
 *  sizes side by side exactly this way), or let `Modal` wrap it in the
 *  backdrop. Host is `display: contents`; `.modal` is the visible surface. */
export function ModalCard({
  size = 'md',
  error = false,
  title,
  showClose = true,
  icon = null,
  dialogRole = 'dialog',
  ariaDescribedBy,
  onClosed,
  children,
  impact,
  actions,
}: ModalCardProps) {
  const [titleId] = React.useState(() => nextControlId('ds-modal-title'));

  return host(
    'ds-modal-card',
    { 'aria-describedby': ariaDescribedBy },
    <div
      aria-modal="true"
      role={dialogRole}
      className={cx('modal', size, error && 'error')}
      aria-labelledby={titleId}
    >
      <div className="header">
        {icon && (
          <span className={cx('icon-badge', error && 'error')}>
            <Icon name={icon} size={20} />
          </span>
        )}

        <h2 className="title" id={titleId}>{title}</h2>

        {showClose && (
          <button
            className="close"
            type="button"
            aria-label="Close dialog"
            onClick={() => onClosed?.()}
          >
            <Icon name="x" size={16} />
          </button>
        )}
      </div>

      <div className="body">
        {children}
        <div className="impact">{impact}</div>
      </div>

      <div className="actions">{actions}</div>
    </div>,
  );
}

export interface ModalProps {
  /** Open state. Controlled when `onOpenChange` is provided; otherwise the
   *  component manages its own state seeded from this value. Defaults to
   *  true (Angular defaults to false) so the dialog renders statically. */
  open?: boolean;
  /** Emits the new open state — backdrop click, Escape or the close button. */
  onOpenChange?: (open: boolean) => void;
  /** Dialog width — sm/md/lg/xl/fullscreen. Default 'md'. */
  size?: ModalSize;
  /** Renders the error styling on the modal card. */
  error?: boolean;
  /** Dialog title, shown in the header and used for `aria-labelledby`. */
  title: string;
  /** When false, clicking the scrim does not close the modal. Default true. */
  closeOnBackdrop?: boolean;
  /** When true, neither backdrop click nor Escape closes the modal — only
   *  programmatic or explicit close button. */
  persistent?: boolean;
  /** DS's own docs mechanism (the `DsStaticPreview` host directive): renders
   *  the bare card in normal flow (`.modal-static`, display:contents) instead
   *  of the fixed full-viewport `.modal-backdrop` — no scrim, no dismissal.
   *  Always rendered regardless of `open`, exactly like Angular. */
  staticPreview?: boolean;
  /** Fires when the dialog is dismissed. Angular fires this after the leave
   *  animation; inline there is none, so it fires immediately. */
  onClosed?: () => void;
  /** Main dialog content (the `[body]` slot). */
  children?: React.ReactNode;
  /** Affected-records / consequence block under the body (the `[impact]` slot). */
  impact?: React.ReactNode;
  /** Footer action buttons (the `[actions]` slot). */
  actions?: React.ReactNode;
}

/** Centered dialog over a scrim — port of `ds-modal`. Renders INLINE (no
 *  portal): the `.modal-backdrop` scrim is `position: fixed; inset: 0`, so it
 *  covers the viewport unless an ancestor forms a containing block (transform/
 *  filter/contain) — wrap previews in one, or set `staticPreview` to drop the
 *  scrim and render the card in flow. Focus trap, body scroll lock and the
 *  enter/leave animations of the Angular component are not reproduced. */
export function Modal({
  open,
  onOpenChange,
  size = 'md',
  error = false,
  title,
  closeOnBackdrop = true,
  persistent = false,
  staticPreview = false,
  onClosed,
  children,
  impact,
  actions,
}: ModalProps) {
  const [ownOpen, setOwnOpen] = React.useState(open ?? true);
  const isOpen = onOpenChange ? (open ?? true) : ownOpen;
  const setOpen = (next: boolean) => {
    if (!onOpenChange) setOwnOpen(next);
    onOpenChange?.(next);
  };

  const close = () => {
    // Mirrors Angular's onClose(): a no-op in static preview.
    if (staticPreview) return;
    setOpen(false);
    onClosed?.();
  };

  const onBackdrop = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (persistent || !closeOnBackdrop) return;
    close();
  };

  return host(
    'ds-modal',
    null,
    (isOpen || staticPreview) && (
      <div
        className={staticPreview ? 'modal-static' : 'modal-backdrop'}
        onClick={onBackdrop}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && !persistent) close();
        }}
      >
        <ModalCard
          size={size}
          error={error}
          title={title}
          onClosed={close}
          impact={impact}
          actions={actions}
        >
          {children}
        </ModalCard>
      </div>
    ),
  );
}

export interface ModalConfirmProps {
  /** Dialog title. */
  title: string;
  /** Body message, wired to the dialog via `aria-describedby`. */
  message?: string;
  /** Confirm button label. Default 'Confirm'. */
  confirmLabel?: string;
  /** Cancel button label. Default 'Cancel'. */
  cancelLabel?: string;
  /** 'error' renders the danger styling and an error-coloured confirm button. */
  tone?: ModalConfirmTone;
  /** Icon badge shown next to the title. */
  icon?: IconName;
  /** When set, the confirm button stays disabled until the user types this
   *  exact phrase — a guard for high-stakes destructive actions. */
  typeToConfirm?: string;
  /** Resolution callback — true on confirm, false on cancel (the Angular
   *  service also resolves false on backdrop click / Escape). */
  onResolved?: (confirmed: boolean) => void;
}

/** Confirmation dialog card — port of `ds-modal-confirm`, the UI that
 *  `ModalService.confirm(options)` raises in Angular. Props flatten
 *  `ModalConfirmOptions` 1:1; `onResolved` mirrors the promise resolution.
 *  Renders the `alertdialog` card only, in flow — in Angular the service
 *  supplies the centred CDK overlay + scrim around it. */
export function ModalConfirm({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  icon,
  typeToConfirm,
  onResolved,
}: ModalConfirmProps) {
  const [uid] = React.useState(() => nextControlId('ds-modal-confirm'));
  const messageId = `${uid}-message`;
  const [typed, setTyped] = React.useState('');
  const confirmDisabled = !!typeToConfirm && typed !== typeToConfirm;

  return host(
    'ds-modal-confirm',
    null,
    <ModalCard
      dialogRole="alertdialog"
      title={title}
      error={tone === 'error'}
      icon={icon ?? null}
      showClose={false}
      ariaDescribedBy={message ? messageId : undefined}
      actions={
        <>
          <Button color="neutral" variant="outline" onPressed={() => onResolved?.(false)}>
            {cancelLabel}
          </Button>

          <Button
            color={tone === 'error' ? 'error' : 'primary'}
            disabled={confirmDisabled}
            onPressed={() => {
              if (!confirmDisabled) onResolved?.(true);
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {message && (
        <p className="message" id={messageId}>{message}</p>
      )}

      {typeToConfirm && (
        <label className="confirm-field">
          <span className="confirm-hint">
            Type <b>{typeToConfirm}</b> to confirm
          </span>

          <input
            type="text"
            className="confirm-input"
            autoComplete="off"
            spellCheck={false}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
          />
        </label>
      )}
    </ModalCard>,
  );
}
