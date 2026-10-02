import * as React from 'react';

/**
 * Accordion — the real AccordionComponent, run by Angular behind `<ds-accordion>`.
 * Bordered stack of collapsible sections. Wraps `AccordionItem` children; the host itself carries the outer border + `radius-lg`, and a hairline divider renders between adjacent items automatically.
 */
export interface AccordionProps {
  /** When false, opening one item closes the others. */
  multiple?: boolean;
  /** Which way the closed chevron points on every item: `right` turns down when an item opens, `down` turns up. */
  chevron?: ('right' | 'down');
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Accordion: React.ComponentType<AccordionProps>;
