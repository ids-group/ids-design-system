---
category: Forms & inputs
---
Time field — clock-icon trigger button(s) opening a panel of scrollable Hours/Minutes (and AM/PM in 12h format) listbox columns, with "Now" and "Done" footer actions. Sizes `sm`/`md`/`lg` align with Input/Select.

- Value is a canonical 24h `"HH:MM"` string (`"14:30"`), or `[start, end]` when `mode="range"`. Pass `value` + `onValueChange` (controlled) or just an initial `value`.
- **The field owns its own open state — there is no `openSegment` prop.** Clicking a trigger opens the columns as a CDK overlay PORTALED to `document.body`, so they float below the field rather than flowing inside the host, and no prop shows them open in a static card.
- `format="12h"` adds the AM/PM column and 12-hour trigger text (default `'24h'`); the stored value stays 24h. `minuteStep={15}` thins the minutes column.
- Constraints: `minTime`/`maxTime` (`"HH:MM"`, inclusive) and a `disabledTime` predicate grey out unpickable cells; in range mode the end panel's floor is automatically the chosen start, and picking a later start bumps an earlier end.
- `clearable` shows an inline × on the single-mode trigger when a value is set. `placeholder` (default `"--:--"`) fills empty triggers. Error text goes in `hint` with `invalid`.
- Keyboard inside the columns: ArrowUp/Down move and select, Home/End jump, ArrowLeft/Right hop between columns, Escape closes. Scrolling a column with the wheel, touch or scrollbar selects the centred cell as it passes the centre and leaves the panel open; one wheel notch moves about one row.

```tsx
<TimePicker
  value={slot}
  onValueChange={setSlot}
  minTime="06:00"
  maxTime="18:00"
  minuteStep={15}
  hint="Depot collection window 06:00–18:00"
/>
```
