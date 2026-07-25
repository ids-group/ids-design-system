import * as React from 'react';
import { host } from '../lib/util';
import { Icon } from '../lib/Icon';

export interface W3wProps {
  /** Marker rendered before the address (e.g. the "///" glyph). */
  prefix?: string;
  /** The three-word address, rendered after `prefix`. */
  address: string;
  /** Makes the address clickable/focusable and copies `prefix` + `address`
   *  to the clipboard. */
  copyable?: boolean;
  /** Fires with `address` after a successful copy. */
  onCopied?: (address: string) => void;
}

/** what3words pill — port of `ds-w3w`. Monospace brand-coloured identifier
 *  (///daring.lion.race) with a danger-red prefix mark; when `copyable` the
 *  whole pill is a button that copies the full identifier to the clipboard. */
export function W3w({ prefix = '///', address, copyable = true, onCopied }: W3wProps) {
  const copy = () => {
    if (!copyable) return;
    const text = `${prefix}${address}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
    }
    onCopied?.(address);
  };

  return host(
    'ds-w3w',
    {
      role: copyable ? 'button' : undefined,
      tabIndex: copyable ? 0 : undefined,
      'aria-label': copyable
        ? `Copy what3words address ${prefix}${address}`
        : undefined,
      onClick: copy,
      onKeyDown: (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
          copy();
        } else if (event.key === ' ') {
          event.preventDefault();
          copy();
        }
      },
    },
    <Icon name="map" size={14} />,
    <span key="addr">
      <span className="mark">{prefix}</span>
      {address}
    </span>,
    copyable && <Icon key="copy" name="copy" size={12} />,
  );
}
