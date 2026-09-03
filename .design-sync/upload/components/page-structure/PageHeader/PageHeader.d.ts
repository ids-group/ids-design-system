import * as React from 'react';

/**
 * PageHeader — the real PageHeaderComponent, run by Angular behind `<ds-page-header>`.
 * Top-of-page block (`ds-page-header`) — eyebrow/title/subtitle stack with a breadcrumb trail above, an actions area on the trailing edge, an optional meta row and an optional tabs strip below. The `title` renders as the page `h1`.
 */
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
  /** Content for the `[breadcrumbs]` slot. */
  breadcrumbs?: React.ReactNode;
  /** Content for the `[title-badge]` slot. */
  titleBadge?: React.ReactNode;
  /** Content for the `[meta]` slot. */
  meta?: React.ReactNode;
  /** Content for the `[actions]` slot. */
  actions?: React.ReactNode;
  /** Content for the `[tabs]` slot. */
  tabs?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const PageHeader: React.ComponentType<PageHeaderProps>;
