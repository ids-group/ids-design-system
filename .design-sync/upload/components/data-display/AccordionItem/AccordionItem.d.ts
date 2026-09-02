import * as React from 'react';

/**
 * AccordionItem — the real AccordionItemComponent, run by Angular behind `<ds-accordion-item>`.
 * One collapsible section inside an `Accordion`: a full-width header toggle button (title, optional `badge` content, chevron that rotates 90° when open) above a body region that expands with a grid animation.
 */
export interface AccordionItemProps {
  /** Header text shown in the toggle button. */
  title?: string;
  /** Open state, two-way bound. */
  expanded?: boolean;
  onExpandedChange?: (value: boolean) => void;
  /** Disables the toggle button; state stays as-is. */
  disabled?: boolean;
  /** Content for the `[badge]` slot. */
  badge?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const AccordionItem: React.ComponentType<AccordionItemProps>;
