import * as React from 'react';
import { cx, host, nextControlId } from '../lib/util';
import { Icon, type IconName } from '../lib/Icon';

export type TabsVariant = 'line' | 'pills';
export type TabsOrientation = 'horizontal' | 'vertical';

export interface TabProps {
  /** Text shown in the tab button. */
  label: string;
  /** Icon shown before the label. */
  icon?: IconName | null;
  /** Numeric badge shown after the label. */
  count?: number | null;
  /** Excludes the tab from selection and keyboard navigation. */
  disabled?: boolean;
  /** Identifier emitted by `onTabClosed`. Falls back to `label` when omitted. */
  value?: string | null;
  /** Panel content, rendered by the parent `Tabs` when this tab is active. */
  children?: React.ReactNode;
}

/** Declarative tab definition — port of `ds-tab`. Renders nothing itself
 *  (the Angular host is `display: none`); the parent `Tabs` reads its props
 *  to build the tab bar and renders `children` inside the active panel. */
export function Tab(_props: TabProps): React.ReactElement | null {
  return null;
}

export interface TabsProps {
  /** Index of the active tab. Controlled when `onSelectedIndexChange` is
   *  provided; otherwise the component manages its own state seeded from
   *  this value. Default 0. */
  selectedIndex?: number;
  /** Emits the new index whenever the active tab changes. */
  onSelectedIndexChange?: (index: number) => void;
  /** Visual style of the tab strip. Default 'line'. */
  variant?: TabsVariant;
  /** When true, a tab's content is instantiated only on first activation and
   *  kept alive thereafter. When false (default), only the active panel renders. */
  lazy?: boolean;
  /** When true, the tab strip scrolls horizontally instead of wrapping. The
   *  active tab is scrolled into view on selection. */
  scrollable?: boolean;
  /** When true, each tab shows a close button. Clicking it emits `onTabClosed`
   *  with the tab's `value` (or label as fallback) and does not switch to that
   *  tab. The host is responsible for removing the tab from its children. */
  closable?: boolean;
  /** Whether the tab list and panel are stacked horizontally (default) or the
   *  tab list runs vertically beside the panel. */
  orientation?: TabsOrientation;
  /** Emitted when a close button is clicked (or Delete is pressed on a focused
   *  tab). Carries the tab's `value`, or its `label` when `value` is not set. */
  onTabClosed?: (value: string) => void;
  /** `Tab` elements only. */
  children?: React.ReactNode;
}

interface TabMeta {
  label: string;
  icon: IconName | null;
  count: number | null;
  disabled: boolean;
  value: string | null;
  content: React.ReactNode;
}

/** Tabbed panels — port of `ds-tabs`. Compose with `Tab` children; the tab
 *  BAR is rendered by this parent from the children's props (APG tabs pattern
 *  with roving tabindex and automatic activation). */
export function Tabs({
  selectedIndex,
  onSelectedIndexChange,
  variant = 'line',
  lazy = false,
  scrollable = false,
  closable = false,
  orientation = 'horizontal',
  onTabClosed,
  children,
}: TabsProps) {
  const [uid] = React.useState(() => nextControlId('ds-tabs'));
  const [ownIndex, setOwnIndex] = React.useState(selectedIndex ?? 0);
  const idx = onSelectedIndexChange ? (selectedIndex ?? 0) : ownIndex;
  const setIdx = (i: number) => {
    if (!onSelectedIndexChange) setOwnIndex(i);
    onSelectedIndexChange?.(i);
  };

  const tabs: TabMeta[] = React.Children.toArray(children)
    .filter(
      (child): child is React.ReactElement<TabProps> =>
        React.isValidElement(child) && child.type === Tab,
    )
    .map((el) => ({
      label: el.props.label,
      icon: el.props.icon ?? null,
      count: el.props.count ?? null,
      disabled: el.props.disabled ?? false,
      value: el.props.value ?? null,
      content: el.props.children,
    }));

  /** Tracks which tab indices have ever been activated (for lazy rendering). */
  const [activated, setActivated] = React.useState<ReadonlySet<number>>(
    () => new Set([selectedIndex ?? 0]),
  );
  React.useEffect(() => {
    if (!lazy) return;
    setActivated((prev) => (prev.has(idx) ? prev : new Set([...prev, idx])));
  }, [lazy, idx]);

  const buttonRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const tabId = (i: number) => `${uid}-tab-${i}`;
  const panelId = (i: number) => `${uid}-panel-${i}`;

  const isPanelVisible = (i: number): boolean =>
    lazy ? activated.has(i) || i === idx : i === idx;

  const select = (i: number, disabled: boolean) => {
    if (disabled) return;
    setIdx(i);
    if (scrollable) {
      buttonRefs.current[i]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  };

  const closeTab = (i: number) => {
    const tab = tabs[i];
    if (!tab) return;
    onTabClosed?.(tab.value ?? tab.label);
  };

  /** Roving keyboard navigation across the tablist (APG automatic activation).
   *  Arrow axis follows orientation; both axes stay active for discoverability. */
  const onKeydown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const count = tabs.length;
    if (!count) return;
    if (closable && event.key === 'Delete') {
      event.preventDefault();
      closeTab(index);
      return;
    }
    const isVertical = orientation === 'vertical';
    const forwardKey = isVertical ? 'ArrowDown' : 'ArrowRight';
    const backwardKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
    const forward =
      event.key === forwardKey ||
      (!isVertical && event.key === 'ArrowDown') ||
      (isVertical && event.key === 'ArrowRight');
    const backward =
      event.key === backwardKey ||
      (!isVertical && event.key === 'ArrowUp') ||
      (isVertical && event.key === 'ArrowLeft');

    let next: number;
    if (forward) {
      next = (index + 1) % count;
    } else if (backward) {
      next = (index - 1 + count) % count;
    } else if (event.key === 'Home') {
      next = 0;
    } else if (event.key === 'End') {
      next = count - 1;
    } else {
      return;
    }
    event.preventDefault();
    // Skip disabled tabs in the travel direction.
    const step = backward || event.key === 'End' ? -1 : 1;
    let guard = 0;
    while (tabs[next]?.disabled && guard < count) {
      next = (next + step + count) % count;
      guard++;
    }
    select(next, tabs[next]?.disabled ?? false);
    buttonRefs.current[next]?.focus();
  };

  const tablistClasses = cx(
    'tabs',
    variant === 'pills' && 'pills',
    scrollable && 'scrollable',
    orientation === 'vertical' && 'vertical',
  );

  return host(
    'ds-tabs',
    { class: cx(orientation === 'vertical' && 'vertical-host') || undefined },
    <div role="tablist" className={tablistClasses} aria-orientation={orientation}>
      {tabs.map((tab, i) => (
        <button
          key={i}
          ref={(el) => {
            buttonRefs.current[i] = el;
          }}
          type="button"
          role="tab"
          id={tabId(i)}
          className={cx('tab', i === idx && 'active', tab.disabled && 'disabled')}
          aria-selected={i === idx}
          aria-controls={panelId(i)}
          tabIndex={i === idx ? 0 : -1}
          disabled={tab.disabled}
          onClick={() => select(i, tab.disabled)}
          onKeyDown={(e) => onKeydown(e, i)}
        >
          {tab.icon && <Icon name={tab.icon} size={14} />}
          <span>{tab.label}</span>
          {tab.count !== null && <span className="badge neutral count">{tab.count}</span>}
          {closable && (
            <span
              className="tab-close"
              aria-label={`Close ${tab.label}`}
              onClick={(e) => {
                e.stopPropagation();
                closeTab(i);
              }}
            >
              <Icon name="x" size={12} />
            </span>
          )}
        </button>
      ))}
    </div>,
    tabs.map((tab, i) =>
      isPanelVisible(i) ? (
        <div
          key={i}
          className="panel"
          role="tabpanel"
          tabIndex={0}
          id={panelId(i)}
          aria-labelledby={tabId(i)}
          hidden={i !== idx}
        >
          {tab.content}
        </div>
      ) : null,
    ),
  );
}
