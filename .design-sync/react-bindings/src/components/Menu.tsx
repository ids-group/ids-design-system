import * as React from 'react';
import { cx, host } from '../lib/util';
import { Icon, type IconName } from '../lib/Icon';

export interface MenuProps {
  /** `MenuItem` / `MenuDivider` children. */
  children?: React.ReactNode;
}

/** Menu list surface — port of `ds-menu`. Renders the `role="menu"` list and
 *  handles ArrowUp/ArrowDown/Home/End focus movement between enabled items
 *  (the Angular roving-tabindex nav, DOM-driven here). Standalone it draws its
 *  own border; projected inside a `Popover` the DS CSS drops the frame so the
 *  popover's surface shows through. */
export function Menu({ children }: MenuProps) {
  const ref = React.useRef<HTMLElement>(null);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const items = Array.from(
      ref.current?.querySelectorAll<HTMLButtonElement>('button.menu-item:not([disabled])') ?? [],
    );
    if (!items.length) return;
    const from = items.findIndex((el) => el.contains(event.target as Node));
    let next: number;
    switch (event.key) {
      case 'ArrowDown':
        next = (from + 1) % items.length;
        break;
      case 'ArrowUp':
        next = (from - 1 + items.length) % items.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = items.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    items[next]?.focus();
  };

  return host(
    'ds-menu',
    { ref, onKeyDown },
    <ul className="menu" role="menu">
      {children}
    </ul>,
  );
}

export interface MenuItemProps {
  /** Leading icon shown before the label. */
  icon?: IconName | null;
  /** Disables the item. */
  disabled?: boolean;
  /** Renders the item in an error/destructive style. */
  error?: boolean;
  /** Roving tabindex — inside a `Menu`, keep exactly one enabled item `true`
   *  and the rest `false`. Default true (a standalone item stays reachable). */
  tabbable?: boolean;
  /** Custom leading visual (the `<ng-content select="[icon]">` slot) — used
   *  only when `icon` is not set; an empty slot still reserves alignment. */
  iconSlot?: React.ReactNode;
  /** Optional submenu content (the Angular `TemplateRef` input) — typically a
   *  nested `Menu` in a `Popover`. Renders INLINE beside the item when
   *  `submenuOpen` (or after click when uncontrolled). */
  submenu?: React.ReactNode;
  /** Static open state for the submenu panel. */
  submenuOpen?: boolean;
  /** Fires on click, unless the item is disabled or opens a submenu. */
  onPressed?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Item label content. */
  children?: React.ReactNode;
}

/** Single menu entry — port of `ds-menu-item`. The host is `role="none"` so
 *  the `menu` → `menuitem` ARIA ownership stays intact; the inner button is
 *  the `role="menuitem"` control. Selecting an item does NOT auto-close a
 *  containing Popover here (no DI in React) — close it in `onPressed`. */
export function MenuItem({
  icon = null,
  disabled = false,
  error = false,
  tabbable = true,
  iconSlot,
  submenu,
  submenuOpen,
  onPressed,
  children,
}: MenuItemProps) {
  const hasSubmenu = submenu != null;
  const [ownSubOpen, setOwnSubOpen] = React.useState(submenuOpen ?? false);
  const isSubmenuOpen = hasSubmenu && (submenuOpen ?? ownSubOpen);

  const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (hasSubmenu) {
      if (submenuOpen === undefined) setOwnSubOpen(true);
      return;
    }
    onPressed?.(event);
  };

  return host(
    'ds-menu-item',
    {
      role: 'none',
      // Anchor for the inline submenu panel (Angular portals it via CDK).
      style: hasSubmenu ? { position: 'relative' } : undefined,
    },
    <button
      className={cx('menu-item', error && 'error', hasSubmenu && 'has-submenu')}
      type="button"
      role="menuitem"
      tabIndex={tabbable ? 0 : -1}
      disabled={disabled}
      aria-haspopup={hasSubmenu ? 'menu' : undefined}
      aria-expanded={hasSubmenu ? isSubmenuOpen : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (hasSubmenu && e.key === 'ArrowRight') {
          e.preventDefault();
          e.stopPropagation();
          if (submenuOpen === undefined) setOwnSubOpen(true);
        }
        if (hasSubmenu && (e.key === 'Escape' || e.key === 'ArrowLeft')) {
          if (submenuOpen === undefined) setOwnSubOpen(false);
        }
      }}
    >
      {icon ? (
        <Icon name={icon} size={16} />
      ) : (
        <span className="menu-item-icon">{iconSlot}</span>
      )}
      <span>{children}</span>
      {hasSubmenu && <Icon className="submenu-chevron" name="chevronRight" size={14} />}
    </button>,
    isSubmenuOpen && (
      <span style={{ position: 'absolute', left: '100%', top: 0, zIndex: 1, width: 'max-content' }}>
        {submenu}
      </span>
    ),
  );
}

/** Non-focusable separator between menu groups — port of `ds-menu-divider`. */
export function MenuDivider() {
  return host(
    'ds-menu-divider',
    { role: 'separator', 'aria-orientation': 'horizontal' },
    <hr className="divider" aria-hidden="true" />,
  );
}
