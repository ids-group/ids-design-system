---
category: Forms & inputs
---
Time field — clock-icon trigger button(s) opening a panel of scrollable Hours/Minutes (and AM/PM in 12h format) listbox columns, with "Now" and "Done" footer actions. Sizes `sm`/`md`/`lg` align with Input/Select.

- Value is a canonical 24h `"HH:MM"` string (`"14:30"`), or `[start, end]` when `mode="range"`. Pass `value` + `onValueChange` (controlled) or just an initial `value`.
- `openSegment` + `onOpenSegmentChange` control which trigger's panel is open: `'single'` (single mode), `'start'`/`'end'` (range mode), `null` closed. The open panel renders inline inside the host below the field — pass `openSegment` to show the columns statically.
- `format="12h"` adds the AM/PM column and 12-hour trigger text (default `'24h'`); the stored value stays 24h. `minuteStep={15}` thins the minutes column.
- Constraints: `minTime`/`maxTime` (`"HH:MM"`, inclusive) and a `disabledTime` predicate grey out unpickable cells; in range mode the end panel's floor is automatically the chosen start, and picking a later start bumps an earlier end.
- `clearable` shows an inline × on the single-mode trigger when a value is set. `placeholder` (default `"--:--"`) fills empty triggers. Error text goes in `hint` with `invalid`.
- Keyboard inside the columns: ArrowUp/Down move and select, Home/End jump, ArrowLeft/Right hop between columns, Escape closes.

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
