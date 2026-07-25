import * as React from 'react';
import { cx, host, nextControlId } from '../lib/util';
import { Icon } from '../lib/Icon';

/** Registration a projected AccordionItem makes with its parent Accordion —
 *  the React stand-in for Angular's `ACCORDION` injection token, used to
 *  enforce single-open mode. */
interface AccordionEntry {
  /** Closes this item (sets expanded to false). */
  close: () => void;
}

interface AccordionContextValue {
  register: (entry: AccordionEntry) => () => void;
  /** Called when an item opens; the coordinator may close other items. */
  notifyOpen: (entry: AccordionEntry) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

export interface AccordionProps {
  /** When false, opening one item automatically closes all others. */
  multi?: boolean;
  /** The `AccordionItem` children. */
  children?: React.ReactNode;
}

/** Bordered stack of collapsible sections — port of `ds-accordion`. Wraps
 *  `AccordionItem` children; the host carries the outer border + radius. */
export function Accordion({ multi = true, children }: AccordionProps) {
  const entriesRef = React.useRef<AccordionEntry[]>([]);
  const multiRef = React.useRef(multi);
  multiRef.current = multi;

  const register = React.useCallback((entry: AccordionEntry) => {
    entriesRef.current.push(entry);
    return () => {
      const i = entriesRef.current.indexOf(entry);
      if (i !== -1) entriesRef.current.splice(i, 1);
    };
  }, []);

  const notifyOpen = React.useCallback((opened: AccordionEntry) => {
    if (multiRef.current) return;
    for (const entry of entriesRef.current) {
      if (entry !== opened) entry.close();
    }
  }, []);

  const context = React.useMemo<AccordionContextValue>(
    () => ({ register, notifyOpen }),
    [register, notifyOpen],
  );

  return host(
    'ds-accordion',
    null,
    <AccordionContext.Provider value={context}>{children}</AccordionContext.Provider>,
  );
}

export interface AccordionItemProps {
  /** Header text shown in the toggle button. */
  title: string;
  /** Open state. Controlled when `onExpandedChange` is provided; otherwise the
   *  component manages its own state seeded from this value. Default false. */
  expanded?: boolean;
  /** Emits the new open state on toggle (and when single-open mode closes it). */
  onExpandedChange?: (expanded: boolean) => void;
  /** Disables the toggle button; state stays as-is. */
  disabled?: boolean;
  /** Trailing header content next to the title (the `[badge]` slot). */
  badge?: React.ReactNode;
  /** Body content, revealed while expanded. */
  children?: React.ReactNode;
}

/** One collapsible section — port of `ds-accordion-item`. Renders a header
 *  toggle button (title, optional `badge`, rotating chevron) and a body region
 *  that expands via the `is-open` grid animation. */
export function AccordionItem({
  title,
  expanded,
  onExpandedChange,
  disabled = false,
  badge,
  children,
}: AccordionItemProps) {
  const accordion = React.useContext(AccordionContext);
  const [uid] = React.useState(() => nextControlId('ds-accordion'));
  const headId = `${uid}-head`;
  const bodyId = `${uid}-body`;

  const [ownExpanded, setOwnExpanded] = React.useState(expanded ?? false);
  const isExpanded = onExpandedChange ? (expanded ?? false) : ownExpanded;
  const setExpanded = (next: boolean) => {
    if (!onExpandedChange) setOwnExpanded(next);
    onExpandedChange?.(next);
  };
  const setExpandedRef = React.useRef(setExpanded);
  setExpandedRef.current = setExpanded;

  // Stable registration entry — `close` always reaches the latest setter.
  const entryRef = React.useRef<AccordionEntry | null>(null);
  if (!entryRef.current) {
    entryRef.current = { close: () => setExpandedRef.current(false) };
  }

  React.useEffect(() => accordion?.register(entryRef.current!), [accordion]);

  // Notify the coordinator only on a true open transition (mirrors the Angular effect).
  const previousExpandedRef = React.useRef(false);
  React.useEffect(() => {
    if (isExpanded && !previousExpandedRef.current) {
      accordion?.notifyOpen(entryRef.current!);
    }
    previousExpandedRef.current = isExpanded;
  }, [isExpanded, accordion]);

  const toggle = () => {
    if (disabled) return;
    setExpanded(!isExpanded);
  };

  return host(
    'ds-accordion-item',
    null,
    <button
      type="button"
      className="head"
      id={headId}
      aria-expanded={isExpanded}
      aria-controls={bodyId}
      disabled={disabled || undefined}
      aria-disabled={disabled ? 'true' : undefined}
      onClick={toggle}
    >
      <span>{title}</span>

      {badge}

      <Icon name="chevronRight" className="chev" size={16} />
    </button>,
    <div
      className={cx('body', isExpanded && 'is-open')}
      role="region"
      id={bodyId}
      aria-labelledby={headId}
      inert={isExpanded ? undefined : true}
    >
      <div className="body-inner">
        <div className="body-content">{children}</div>
      </div>
    </div>,
  );
}
