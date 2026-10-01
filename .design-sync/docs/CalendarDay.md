---
category: Forms & inputs
---
One day cell in a calendar grid - `ds-calendar-day`, the button DatePicker builds its month out of. It has no component of its own to place: render a DatePicker, which draws every cell.

- A cell takes these states independently: selected, today, muted (a leading or trailing day from a neighbouring month), disabled.
- A range tints the span between its two ends and rounds both of them.
