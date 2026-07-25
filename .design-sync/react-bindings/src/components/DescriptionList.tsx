import * as React from 'react';
import { host } from '../lib/util';
import { Icon } from '../lib/Icon';

/** horizontal = label column + value; stacked = label above value. */
export type DescriptionListOrientation = 'horizontal' | 'stacked';

/** React stand-in for the Angular parent-component injection: items read the
 *  list's orientation to derive their own `stacked` host class. */
const DescriptionListContext = React.createContext<DescriptionListOrientation>('horizontal');

export interface DescriptionListProps {
  /** horizontal = label column + value; stacked = label above value. */
  orientation?: DescriptionListOrientation;
  /** The `DescriptionItem` children. */
  children?: React.ReactNode;
}

/** Term/detail pairs — port of `ds-description-list`. A flex column of
 *  `DescriptionItem` rows; the label column width is themeable via
 *  `--ds-description-list-label-w`. */
export function DescriptionList({ orientation = 'horizontal', children }: DescriptionListProps) {
  return host(
    'ds-description-list',
    { class: orientation === 'stacked' ? 'stacked' : undefined },
    <DescriptionListContext.Provider value={orientation}>
      {children}
    </DescriptionListContext.Provider>,
  );
}

export interface DescriptionItemProps {
  /** The label. Plain text; rich values go in `children`. */
  term?: string;
  /** When set, a copy button appears that copies this string to the clipboard. */
  copyValue?: string | null;
  /** The value content (the definition). */
  children?: React.ReactNode;
}

/** One term/detail pair — port of `ds-description-item`. Renders a
 *  `role="term"` label and a `role="definition"` value; derives its layout
 *  from the enclosing `DescriptionList`'s orientation. */
export function DescriptionItem({ term = '', copyValue = null, children }: DescriptionItemProps) {
  const orientation = React.useContext(DescriptionListContext);
  const stacked = orientation === 'stacked';
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    if (!copyValue) return;
    await navigator.clipboard?.writeText(copyValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return host(
    'ds-description-item',
    {
      role: 'group',
      class: stacked ? 'stacked' : undefined,
    },
    <span className="term" role="term">
      {term}
    </span>,
    <div className="details" role="definition">
      <span className="value">{children}</span>

      {copyValue && (
        <button
          type="button"
          className="copy"
          aria-label={copied ? 'Copied' : 'Copy value'}
          onClick={copy}
        >
          <Icon name={copied ? 'check' : 'copy'} size={14} />
        </button>
      )}
    </div>,
  );
}
