import * as React from 'react';

/**
 * Accordion — the real AccordionComponent, run by Angular behind `<ds-accordion>`.
 * Bordered stack of collapsible sections. Wraps `AccordionItem` children; the host itself carries the outer border + `radius-lg`, and a hairline divider renders between adjacent items automatically.
 */
export interface AccordionProps {
  /** When false, opening one item automatically closes all others. */
  multiple?: boolean;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Accordion: React.ComponentType<AccordionProps>;
