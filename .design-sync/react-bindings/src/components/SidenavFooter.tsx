import * as React from 'react';
import { cx, host } from '../lib/util';
import { Icon, type IconName } from '../lib/Icon';
import { Avatar } from './Avatar';
import { Popover } from './Popover';
import { Menu, MenuItem } from './Menu';

/** A notification rendered in the sidenav Alerts popover. The footer is
 *  domain-agnostic: the layout derives its own alerts and feeds them in. */
export interface SidenavAlertItem {
  readonly id: string;
  readonly icon: IconName;
  /** Tone of the leading icon chip (reuses the DS status palette). */
  readonly variant: 'success' | 'warning' | 'error' | 'info';
  readonly title: string;
  readonly body: string;
  /** Relative/display timestamp, e.g. "Jul 23". */
  readonly at: string;
  /** Optional route passed to `onNavigate` when the alert is clicked. */
  readonly route?: string;
}

/** A single global-search hit rendered in the sidenav Search popover. */
export interface SidenavSearchResult {
  readonly id: string;
  /** Primary line (entity/section name). */
  readonly label: string;
  /** Optional secondary line (reference, email, type…). */
  readonly sublabel?: string;
  readonly icon?: IconName;
  /** Group heading the hit is filed under, e.g. "Sections". */
  readonly group: string;
  /** Route passed to `onNavigate` on select. */
  readonly route: string;
  /** Optional query params — used to deep-open in-page detail views. */
  readonly queryParams?: Record<string, string>;
}

/** A query -> results function supplied by the layout to the shared footer. */
export type SidenavSearchProvider = (
  query: string,
) => readonly SidenavSearchResult[];

interface SearchGroup {
  group: string;
  items: SidenavSearchResult[];
}

export interface SidenavFooterProps {
  /** Signed-in user's display name; empty hides the whole profile block. */
  userName?: string;
  /** Secondary line under the user name. */
  userRole?: string;
  /** Show the unread dot on the Alerts row. */
  alerts?: boolean;
  /** Icon-only mode — pass the same value as the parent `Sidenav`. */
  collapsed?: boolean;
  /** When set, the Search row opens a live results popover; unset keeps it inert. */
  searchProvider?: SidenavSearchProvider | null;
  /** When non-null (even empty) the Alerts row opens a list popover; null keeps it inert. */
  alertItems?: readonly SidenavAlertItem[] | null;
  /** Route for the account menu's "Your profile"; empty = the item is a no-op. */
  profileRoute?: string;
  /** Emitted when the Collapse row is pressed; the parent owns the collapsed state. */
  onCollapseToggled?: () => void;
  /** Emitted when the Alerts popover is opened, so the layout can mark-all-read. */
  onAlertsOpened?: () => void;
  /** Emitted when "Sign out" is chosen; the layout owns the actual logout flow. */
  onSignOutSelected?: () => void;
  /** Replaces the Angular `Router.navigate` — called with the route (and
   *  query params) of a chosen search result, alert, or the profile item. */
  onNavigate?: (route: string, queryParams?: Record<string, string>) => void;
  /** Static open state for the Search popover (internal toggle when omitted). */
  searchOpen?: boolean;
  /** Static open state for the Alerts popover (internal toggle when omitted). */
  alertsOpen?: boolean;
  /** Static open state for the account menu popover (internal toggle when omitted). */
  accountMenuOpen?: boolean;
  /** Static search text (internal state when omitted) — lets previews render results. */
  query?: string;
}

/** Bottom block of the app sidenav — port of `ds-sidenav-footer`. Quick
 *  actions (Search / Alerts / Collapse) and the signed-in user with an account
 *  menu. Pinned to the bottom via `margin-top: auto` — place it as the last
 *  child of `Sidenav`. Popovers render INLINE in the column (no portal), so an
 *  open panel pushes the rows below it. */
export function SidenavFooter({
  userName = '',
  userRole = '',
  alerts = false,
  collapsed = false,
  searchProvider = null,
  alertItems = null,
  profileRoute = '',
  onCollapseToggled,
  onAlertsOpened,
  onSignOutSelected,
  onNavigate,
  searchOpen,
  alertsOpen,
  accountMenuOpen,
  query,
}: SidenavFooterProps) {
  const [ownSearchOpen, setOwnSearchOpen] = React.useState(searchOpen ?? false);
  const [ownAlertsOpen, setOwnAlertsOpen] = React.useState(alertsOpen ?? false);
  const [ownAccountOpen, setOwnAccountOpen] = React.useState(accountMenuOpen ?? false);
  const [ownQuery, setOwnQuery] = React.useState(query ?? '');
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const isSearchOpen = searchOpen ?? ownSearchOpen;
  const isAlertsOpen = alertsOpen ?? ownAlertsOpen;
  const isAccountOpen = accountMenuOpen ?? ownAccountOpen;
  const currentQuery = query ?? ownQuery;

  const setQuery = (value: string) => {
    if (query === undefined) setOwnQuery(value);
  };
  const closeSearch = () => {
    if (searchOpen === undefined) setOwnSearchOpen(false);
  };

  const initials = (() => {
    const parts = userName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
  })();

  /** Run the provider for the current query, grouped by `group` for display. */
  const searchGroups = (provider: SidenavSearchProvider): SearchGroup[] => {
    const trimmed = currentQuery.trim();
    if (!trimmed) return [];
    const groups: SearchGroup[] = [];
    for (const result of provider(trimmed)) {
      let group = groups.find((candidate) => candidate.group === result.group);
      if (!group) {
        group = { group: result.group, items: [] };
        groups.push(group);
      }
      group.items.push(result);
    }
    return groups;
  };

  const goResult = (result: SidenavSearchResult) => {
    setQuery('');
    onNavigate?.(result.route, result.queryParams);
  };

  /** Activate the top result (Enter key). Returns whether a result was opened. */
  const goFirst = (provider: SidenavSearchProvider): boolean => {
    const first = searchGroups(provider)[0]?.items[0];
    if (!first) return false;
    goResult(first);
    return true;
  };

  const goAlert = (alert: SidenavAlertItem) => {
    if (alert.route) onNavigate?.(alert.route);
  };

  const goProfile = () => {
    if (profileRoute) onNavigate?.(profileRoute);
  };

  const groups = searchProvider ? searchGroups(searchProvider) : [];

  return host(
    'ds-sidenav-footer',
    { class: cx(collapsed && 'collapsed') || undefined },
    searchProvider ? (
      <React.Fragment key="search">
        <button
          type="button"
          className="row"
          aria-label="Search"
          aria-expanded={isSearchOpen}
          onClick={() => {
            if (searchOpen === undefined) setOwnSearchOpen(!isSearchOpen);
          }}
        >
          <Icon name="search" size={20} />
          <span className="label">Search</span>
        </button>
        <Popover align="start" panelRole="dialog" panelLabel="Search" open={isSearchOpen}>
          <div className="search-panel">
            <div className="search-box">
              <Icon name="search" size={18} />
              <input
                ref={searchInputRef}
                type="text"
                className="search-input"
                placeholder="Search…"
                autoComplete="off"
                aria-label="Search"
                value={currentQuery}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && goFirst(searchProvider)) closeSearch();
                  if (e.key === 'Escape') closeSearch();
                }}
              />
              {currentQuery && (
                <button
                  type="button"
                  className="clear"
                  aria-label="Clear"
                  onClick={() => {
                    setQuery('');
                    searchInputRef.current?.focus();
                  }}
                >
                  <Icon name="x" size={16} />
                </button>
              )}
            </div>
            {currentQuery.trim() ? (
              groups.length ? (
                groups.map((group) => (
                  <React.Fragment key={group.group}>
                    <p className="heading">{group.group}</p>
                    {group.items.map((result) => (
                      <button
                        key={result.id}
                        type="button"
                        className="result"
                        onClick={() => {
                          closeSearch();
                          goResult(result);
                        }}
                      >
                        {result.icon && <Icon name={result.icon} size={16} />}
                        <span className="text">
                          <span className="title">{result.label}</span>
                          {result.sublabel && <span className="subtitle">{result.sublabel}</span>}
                        </span>
                      </button>
                    ))}
                  </React.Fragment>
                ))
              ) : (
                <p className="empty">No matches for “{currentQuery.trim()}”.</p>
              )
            ) : (
              <p className="empty">Type to search.</p>
            )}
          </div>
        </Popover>
      </React.Fragment>
    ) : (
      <button key="search" type="button" className="row">
        <Icon name="search" size={20} />
        <span className="label">Search</span>
      </button>
    ),
    alertItems ? (
      <React.Fragment key="alerts">
        <button
          type="button"
          className="row"
          aria-label="Alerts"
          aria-expanded={isAlertsOpen}
          onClick={() => {
            if (!isAlertsOpen) onAlertsOpened?.();
            if (alertsOpen === undefined) setOwnAlertsOpen(!isAlertsOpen);
          }}
        >
          <Icon name="bell" size={20} />
          <span className="label">Alerts</span>
          {alerts && <span className="dot" aria-hidden="true" />}
        </button>
        <Popover align="start" panelRole="dialog" panelLabel="Alerts" open={isAlertsOpen}>
          <div className="alerts-panel">
            <p className="heading">Alerts</p>
            {alertItems.length ? (
              alertItems.map((alert) => (
                <button
                  key={alert.id}
                  type="button"
                  className="alert"
                  onClick={() => {
                    if (alertsOpen === undefined) setOwnAlertsOpen(false);
                    goAlert(alert);
                  }}
                >
                  <span className={`icon ${alert.variant}`}>
                    <Icon name={alert.icon} size={16} />
                  </span>
                  <span className="text">
                    <span className="header">
                      <span className="title">{alert.title}</span>
                      {alert.at && <span className="time">{alert.at}</span>}
                    </span>
                    <span className="body">{alert.body}</span>
                  </span>
                </button>
              ))
            ) : (
              <p className="empty">You’re all caught up.</p>
            )}
          </div>
        </Popover>
      </React.Fragment>
    ) : (
      <button key="alerts" type="button" className="row">
        <Icon name="bell" size={20} />
        <span className="label">Alerts</span>
        {alerts && <span className="dot" aria-hidden="true" />}
      </button>
    ),
    <button key="collapse" type="button" className="row" onClick={() => onCollapseToggled?.()}>
      <Icon name={collapsed ? 'chevronRight' : 'chevronLeft'} size={20} />
      <span className="label">Collapse</span>
    </button>,
    userName && (
      <React.Fragment key="profile">
        <div className="divider" />
        <div className="profile">
          <Avatar size="sm" initials={initials} />
          <span className="profile-text">
            <span className="name">{userName}</span>
            {userRole && <span className="role">{userRole}</span>}
          </span>
          <button
            type="button"
            className="more"
            aria-label="Account menu"
            aria-expanded={isAccountOpen}
            onClick={() => {
              if (accountMenuOpen === undefined) setOwnAccountOpen(!isAccountOpen);
            }}
          >
            <Icon name="moreV" size={18} />
          </button>
          <Popover align="end" panelRole="menu" panelLabel="Account" open={isAccountOpen}>
            <Menu>
              <p className="heading">Signed in as {userName}</p>
              <MenuItem icon="user" onPressed={goProfile}>
                Your profile
              </MenuItem>
              <MenuItem icon="settings">Account settings</MenuItem>
              <MenuItem icon="help">Help &amp; support</MenuItem>
              <div className="separator" />
              <MenuItem icon="logout" error onPressed={() => onSignOutSelected?.()}>
                Sign out
              </MenuItem>
            </Menu>
          </Popover>
        </div>
      </React.Fragment>
    ),
  );
}
