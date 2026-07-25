import * as React from 'react';
import { cx, host } from '../lib/util';
import { Icon, type IconName } from '../lib/Icon';

/** Item data shape used by app-level nav configs — port of `SidenavItemModel`. */
export interface SidenavItemModel {
  id: string;
  label: string;
  href?: string;
  active?: boolean;
  badge?: number | null;
  hasAlert?: boolean;
}

/** React stand-in for the Angular `SIDENAV` injection token: `Sidenav`
 *  publishes its collapsed state; `SidenavItem` reads it for the collapsed
 *  aria-label. Standalone items behave as expanded (false). */
const SidenavContext = React.createContext(false);

export interface SidenavProps {
  /** Collapses the rail to icon-only width; read by nested `SidenavItem`/`SidenavGroup`. */
  collapsed?: boolean;
  /** Brand text at the top of the rail (auto letter-mark + name). For a custom
   *  logo image/SVG, pass `brandSlot` instead. */
  brand?: string;
  /** Letter-mark glyph when it differs from the brand's first letter (e.g. an
   *  "A" tile beside the "MyAdmin" wordmark). Empty = first letter of `brand`. */
  logoLetter?: string;
  /** Custom logo markup (the `[brand]` slot), rendered before the letter-mark. */
  brandSlot?: React.ReactNode;
  /** Custom wordmark markup (the `[dsBrandName]` slot). When set, it renders
   *  inside `.brand-name` instead of the plain `brand` text; the letter-mark
   *  tile still comes from `logoLetter`/`brand`, so a wordmark alone renders
   *  with no tile. */
  brandName?: React.ReactNode;
  /** `SidenavGroup`/`SidenavItem` children (plus e.g. a `SidenavFooter`). */
  children?: React.ReactNode;
}

/** Vertical navigation rail — port of `ds-sidenav`. The host carries
 *  `.sidenav` (+ `.collapsed`) — the class the item/group collapsed styles
 *  key off — so keep items/groups inside this component when using
 *  `collapsed`. Compose inside `AppShell`'s `sidenav` prop. */
export function Sidenav({
  collapsed = false,
  brand = '',
  logoLetter = '',
  brandSlot,
  brandName,
  children,
}: SidenavProps) {
  const hasBrandName = brandName != null;

  return host(
    'ds-sidenav',
    { class: cx('sidenav', collapsed && 'collapsed') },
    <div className="brand">
      {brandSlot}
      {(brand || hasBrandName) && (
        <>
          {(logoLetter || brand) && (
            <span className="mark">{logoLetter || brand.charAt(0)}</span>
          )}
          <span className="brand-name">{hasBrandName ? brandName : brand}</span>
        </>
      )}
    </div>,
    <SidenavContext.Provider value={collapsed}>{children}</SidenavContext.Provider>,
  );
}

export interface SidenavGroupProps {
  /** Group heading text. */
  label?: string;
  /** Optional group icon; omit to pass custom content via `iconSlot` instead. */
  icon?: IconName | null;
  /** When true, the label/icon row becomes a clickable header that expands/collapses the group. */
  expandable?: boolean;
  /** Open state (two-way `model()` in Angular). Controlled when
   *  `onExpandedChange` is provided; otherwise internal state seeded from this
   *  value. Defaults open so a non-expandable group always shows its items. */
  expanded?: boolean;
  /** Emits the new open state when the expandable header is toggled. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Custom header icon markup (the `[ds-group-icon]` slot) — used only when
   *  `icon` is not set and the group is `expandable`. */
  iconSlot?: React.ReactNode;
  /** The group's `SidenavItem` children (nested groups also work). */
  children?: React.ReactNode;
}

/** Labelled/collapsible section of the rail — port of `ds-sidenav-group`.
 *  Non-expandable: renders a small uppercase `.group-label`. Expandable:
 *  renders a `.group-header` toggle button (icon, title, rotating caret) and
 *  hides the indented `.group-body` when closed. Collapsed rail hides the
 *  label/title/caret via the ancestor `.sidenav.collapsed` class. */
export function SidenavGroup({
  label = '',
  icon = null,
  expandable = false,
  expanded,
  onExpandedChange,
  iconSlot,
  children,
}: SidenavGroupProps) {
  const [ownExpanded, setOwnExpanded] = React.useState(expanded ?? true);
  const isExpanded = onExpandedChange ? (expanded ?? true) : ownExpanded;

  const toggle = () => {
    if (!expandable) return;
    if (!onExpandedChange) setOwnExpanded(!isExpanded);
    onExpandedChange?.(!isExpanded);
  };

  const bodyHidden = expandable && !isExpanded;

  return host(
    'ds-sidenav-group',
    null,
    expandable ? (
      <button
        type="button"
        className="group-header"
        aria-expanded={isExpanded}
        onClick={toggle}
      >
        {icon ? (
          <Icon className="group-icon" name={icon} size={18} />
        ) : (
          <span className="group-icon">{iconSlot}</span>
        )}
        {label && <span className="group-title">{label}</span>}
        <Icon
          className={cx('group-caret', isExpanded && 'open')}
          name="chevronDown"
          size={14}
        />
      </button>
    ) : (
      label && <span className="group-label">{label}</span>
    ),
    <div
      className={cx('group-body', bodyHidden && 'hidden')}
      inert={bodyHidden ? true : undefined}
    >
      {children}
    </div>,
  );
}

export interface SidenavItemProps {
  /** Icon shown before the label; omit to pass a custom icon via `iconSlot` instead. */
  icon?: IconName | null;
  /** Visible link text; also used as the aria-label when the rail is collapsed. */
  label: string;
  /** Link target. Defaults to `'#'` when empty. (The Angular `routerLink`
   *  input has no React equivalent — use `href` or intercept clicks.) */
  href?: string;
  /** Applies the active style and sets `aria-current="page"`. */
  active?: boolean;
  /** Numeric count shown at the end of the item. */
  badge?: number | null;
  /** Shows an alert dot alongside the badge. */
  hasAlert?: boolean;
  /** Disables the item — non-navigable and styled as inactive. */
  disabled?: boolean;
  /** Custom leading icon markup (the `[icon]` slot) — used only when `icon` is not set. */
  iconSlot?: React.ReactNode;
  /** Arbitrary trailing content (the `[trailing]` slot) — status pill, icon, etc. */
  trailing?: React.ReactNode;
}

/** Single nav link — port of `ds-sidenav-item`. Renders an anchor with icon,
 *  label, optional trailing slot, count badge and alert dot. Inside a
 *  collapsed `Sidenav` the item shows icon-only (label/badge hidden, alert dot
 *  pinned) and names itself via `aria-label`. (Angular also shows a right-side
 *  tooltip on hover when collapsed — hover-only, not ported.) */
export function SidenavItem({
  icon = null,
  label,
  href = '',
  active = false,
  badge = null,
  hasAlert = false,
  disabled = false,
  iconSlot,
  trailing,
}: SidenavItemProps) {
  const collapsed = React.useContext(SidenavContext);

  return host(
    'ds-sidenav-item',
    null,
    <a
      href={href || '#'}
      className={cx('item', active && 'active', disabled && 'disabled')}
      aria-label={collapsed ? label : undefined}
      aria-current={active ? 'page' : undefined}
      aria-disabled={disabled ? 'true' : undefined}
      tabIndex={disabled ? -1 : undefined}
    >
      {icon ? (
        <Icon className="icon" name={icon} size={20} />
      ) : (
        <span className="icon">{iconSlot}</span>
      )}
      {label && <span className="item-label">{label}</span>}
      <span className="trailing">{trailing}</span>
      {badge !== null && <span className="count">{badge}</span>}
      {hasAlert && <span className="alert" />}
    </a>,
  );
}
