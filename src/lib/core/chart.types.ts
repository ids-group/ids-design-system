/** Whether the label-and-value table under a chart's plot is offered, and how. It is the non-visual
 *  route to the numbers, so `'none'` belongs only where the same data is already in a table on the
 *  page. */
export type ChartDataTable = 'toggle' | 'visible' | 'none';

/** Whether a chart draws its own bordered, padded box. `'auto'` draws it; `'none'` leaves the
 *  chart bare, for a chart placed inside a card the page has already drawn. */
export type ChartFrame = 'auto' | 'none';

/** Formats every value a chart prints — the annex table and the generated description included. */
export type ChartValueFormat = (value: number) => string;
