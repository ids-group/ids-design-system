import * as React from 'react';
import { cx, host } from '../lib/util';

export interface PageHeaderProps {
  /** Small label shown above the title. */
  eyebrow?: string;
  /** Page title, rendered as the `h1`. */
  title?: string;
  /** Supporting line shown under the title. */
  subtitle?: string;
  /** Tightens spacing for dense layouts. */
  compact?: boolean;
  /** Shows a rule under the whole header. */
  divider?: boolean;
  /** Shows a rule under the meta row only. */
  metaDivider?: boolean;
  /** Breadcrumb trail rendered above the title row (the `[breadcrumbs]`
   *  slot) — typically a `<Breadcrumbs items={…} />`. */
  breadcrumbs?: React.ReactNode;
  /** Inline pill next to the title (the `[title-badge]` slot) —
   *  typically one `<Badge>`. */
  titleBadge?: React.ReactNode;
  /** Meta row items under the subtitle (the `[meta]` slot). The row hides
   *  itself when it has no element children. */
  meta?: React.ReactNode;
  /** Primary action area on the trailing edge (the `[actions]` slot). */
  actions?: React.ReactNode;
  /** Tabs strip below the title row (the `[tabs]` slot) — typically a
   *  `<Tabs>`. When present, the header's own bottom divider is suppressed
   *  (the strip supplies its own border). */
  tabs?: React.ReactNode;
}

/** Top-of-page block — port of `ds-page-header`. Eyebrow/title/subtitle
 *  stack with breadcrumbs above, actions on the trailing edge, an optional
 *  meta row and an optional tabs strip below. */
export function PageHeader({
  eyebrow = '',
  title = '',
  subtitle = '',
  compact = false,
  divider = false,
  metaDivider = false,
  breadcrumbs,
  titleBadge,
  meta,
  actions,
  tabs,
}: PageHeaderProps) {
  const classes = cx(
    'page-header',
    compact && 'compact',
    divider && 'with-divider',
    metaDivider && 'with-meta-divider',
  );

  return host(
    'ds-page-header',
    null,
    <header className={classes}>
      {breadcrumbs}

      <div className="row title-row">
        <div className="title-block">
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}

          <div className="title-line">
            {title && <h1 className="title">{title}</h1>}

            {titleBadge}
          </div>

          {subtitle && <p className="subtitle">{subtitle}</p>}

          <div className="meta">{meta}</div>
        </div>

        <div className="actions">{actions}</div>
      </div>

      {/* In Angular the consumer's projected element carries the `tabs`
          attribute, which the stylesheet's `.page-header:has(> [tabs])`
          divider-suppression rule matches. A `[tabs]`-attributed wrapper
          keeps that contract (host() used for its loose attribute typing). */}
      {tabs != null && host('div', { tabs: '' }, tabs)}
    </header>,
  );
}
