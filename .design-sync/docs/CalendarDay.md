---
category: Forms & inputs
---
One day cell in a calendar grid — the button DatePicker builds its month out of. Rarely used directly; reach for DatePicker unless you are building a custom calendar.

- Children are the day number.
- State flags, all independent: `selected`, `today`, `muted` (a leading/trailing day from a neighbouring month), `disabled`.
- Range flags: `inRange` tints the span, `rangeStart` and `rangeEnd` round the correct end. Set all three on a one-day range.
- `dataDay` carries the ISO date the parent reads back on `onDaySelected`; `ariaLabel` should be the full spoken date, since the visible text is only a number.
- `tabIndex` lets the parent run a roving-tabindex grid — one cell at `0`, the rest at `-1`.
- `onDaySelected` and `onDayKeydown` hand the raw events up; the cell decides nothing itself.

```tsx
<CalendarDay dataDay="2026-09-14" ariaLabel="14 September 2026" selected tabIndex={0}>14</CalendarDay>
```
