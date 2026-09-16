/** Whether the label-and-value table under a chart's plot is offered, and how. It is the non-visual
 *  route to the numbers, so `'none'` belongs only where the same data is already in a table on the
 *  page. */
export type ChartDataTable = 'toggle' | 'visible' | 'none';

/** Whether a chart draws its own bordered, padded box. `'auto'` draws it; `'none'` leaves the
 *  chart bare, for a chart placed inside a card the page has already drawn. */
export type ChartFrame = 'auto' | 'none';

/** Where a chart-value formatter is printing: the compact `'tick'` label on the value axis, or
 *  `'tooltip'` everywhere else a value is spelled out in full — the annex table, the generated
 *  description, and a value printed beside a mark. */
export type ChartFormatLocation = 'tick' | 'tooltip';

/** Formats every value a chart prints — the annex table and the generated description included.
 *  Called with the location it is formatting for, so one function can abbreviate on the axis and
 *  spell the value out everywhere else. */
export type ChartValueFormat = (
  value: number,
  location: ChartFormatLocation,
) => string;
