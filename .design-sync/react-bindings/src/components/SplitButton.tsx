import * as React from 'react';
import { cx, host } from '../lib/util';
import { Icon, type IconName } from '../lib/Icon';

export type SplitButtonVariant = 'primary' | 'outline';

export interface SplitButtonItem {
  label: string;
  value?: string;
  icon?: IconName;
  disabled?: boolean;
  error?: boolean;
}

export interface SplitButtonProps {
  /** Label text on the main button. */
  label?: string;
  /** Visual style — primary (solid) or outline. */
  variant?: SplitButtonVariant;
  /** Icon shown on the main button, before the label. */
  icon?: IconName | null;
  /** Disables both the main button and the dropdown trigger. */
  disabled?: boolean;
  /** Items listed in the dropdown menu. */
  menuItems?: readonly SplitButtonItem[];
  /** Accessible name for the dropdown trigger. */
  menuLabel?: string;
  /** Dropdown open state. Controlled when `onOpenChange` is provided;
   *  otherwise the component manages its own state seeded from this value.
   *  The open menu renders INLINE inside the host (no portal). */
  open?: boolean;
  /** Emits the new open state when the trigger is toggled or an item closes the menu. */
  onOpenChange?: (open: boolean) => void;
  /** Fires when the main button (not the dropdown trigger) is clicked. */
  onPressed?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Fires with the chosen menu item (selecting also closes the menu). */
  onItemSelected?: (item: SplitButtonItem) => void;
  /** Extra main-button content, after `icon`/`label` (the `<ng-content>` slot). */
  children?: React.ReactNode;
}

/** Main action + chevron menu trigger in one fused control — port of
 *  `ds-split-button`. The dropdown is a popover-hosted menu; this binding
 *  renders it inline inside the host when `open` (the re-scoped CSS only
 *  reaches descendants of the host tag — no portals). */
export function SplitButton({
  label = '',
  variant = 'primary',
  icon = null,
  disabled = false,
  menuItems = [],
  menuLabel = 'More actions',
  open,
  onOpenChange,
  onPressed,
  onItemSelected,
  children,
}: SplitButtonProps) {
  const [ownOpen, setOwnOpen] = React.useState(open ?? false);
  const isOpen = onOpenChange ? (open ?? false) : ownOpen;
  const setOpen = (next: boolean) => {
    if (!onOpenChange) setOwnOpen(next);
    onOpenChange?.(next);
  };

  // ds-menu's roving tabindex at rest: exactly one enabled item is tabbable.
  const firstEnabledIndex = menuItems.findIndex((item) => !item.disabled);

  const onItemSelect = (item: SplitButtonItem) => {
    if (item.disabled) return;
    // ds-menu-item closes the containing popover itself on select.
    onItemSelected?.(item);
    setOpen(false);
  };

  return host(
    'ds-split-button',
    { class: cx(variant === 'primary' && 'primary', variant === 'outline' && 'outline') },
    <button
      type="button"
      className="main"
      disabled={disabled}
      onClick={(e) => onPressed?.(e)}
    >
      {icon && <Icon name={icon} size={18} />}
      {label && <span className="label">{label}</span>}
      {children}
    </button>,
    <button
      type="button"
      className={cx('toggle', isOpen && 'open')}
      aria-haspopup="menu"
      aria-expanded={isOpen}
      aria-label={menuLabel}
      disabled={disabled}
      onClick={() => setOpen(!isOpen)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowDown' && !isOpen) {
          e.preventDefault();
          setOpen(true);
        }
      }}
    >
      {/* Angular puts class="chevron" on the ds-icon HOST (drives the open-state
          rotation via `.toggle.open .chevron`). */}
      <Icon name="chevronDown" size={18} className="chevron" />
    </button>,
    // Inline port of `ds-popover align="end" panelRole="presentation"` hosting
    // a `ds-menu` of `ds-menu-item`s — same markup/classes, rendered in place.
    host(
      'ds-popover',
      null,
      isOpen && (
        <div className="popover" role="presentation">
          {host(
            'ds-menu',
            null,
            <ul className="menu" role="menu">
              {menuItems.map((item, i) =>
                host(
                  'ds-menu-item',
                  { key: item.value ?? item.label, role: 'none' },
                  <button
                    className={cx('menu-item', item.error && 'error')}
                    type="button"
                    role="menuitem"
                    tabIndex={i === firstEnabledIndex ? 0 : -1}
                    disabled={item.disabled}
                    onClick={() => onItemSelect(item)}
                  >
                    {item.icon ? (
                      <Icon name={item.icon} size={16} />
                    ) : (
                      <span className="menu-item-icon" />
                    )}
                    <span>{item.label}</span>
                  </button>,
                ),
              )}
            </ul>,
          )}
        </div>
      ),
    ),
  );
}
