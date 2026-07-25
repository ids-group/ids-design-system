import * as React from 'react';
import { cx, host } from '../lib/util';
import { Icon, type IconName } from '../lib/Icon';

export interface BreadcrumbItem {
  label?: string;
  href?: string;
  icon?: IconName;
}

export interface BreadcrumbsProps {
  /** Crumbs in order; the last entry renders as the non-clickable current page.
   *  (The Angular `BreadcrumbsService` fallback does not exist in React —
   *  always pass items explicitly.) */
  items?: BreadcrumbItem[];
  /** Icon between crumbs. Default 'chevronRight' (the `DS_CONFIG` fallback). */
  separator?: IconName;
  /** Whether crumbs render as links. Default true (the `DS_CONFIG` fallback). */
  clickable?: boolean;
  /** Fires when a clickable crumb with `href` is activated; default navigation
   *  is always prevented — do routing here. */
  onNavigate?: (item: BreadcrumbItem) => void;
}

/** Breadcrumb trail — port of `ds-breadcrumbs`. Items are data (not projected
 *  links); non-last items with `href` render as anchors when `clickable`,
 *  everything else as plain spans. Long labels ellipsize (16ch, 32ch for the
 *  current crumb). */
export function Breadcrumbs({
  items = [],
  separator = 'chevronRight',
  clickable = true,
  onNavigate,
}: BreadcrumbsProps) {
  return host(
    'ds-breadcrumbs',
    null,
    <nav className={cx('breadcrumbs', !clickable && 'is-static')} aria-label="Breadcrumb">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        const crumbContent = (
          <>
            {item.icon && <Icon name={item.icon} size={14} />}
            {item.label && <span className="label">{item.label}</span>}
          </>
        );
        return (
          <React.Fragment key={i}>
            {item.href && !last && clickable ? (
              <a
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.(item);
                }}
              >
                {crumbContent}
              </a>
            ) : (
              <span
                className={cx(last && 'current') || undefined}
                aria-current={last ? 'page' : undefined}
              >
                {crumbContent}
              </span>
            )}
            {!last && (
              <span className="sep" aria-hidden="true">
                <Icon name={separator} size={12} />
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>,
  );
}
