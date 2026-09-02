---
category: Forms & inputs
---
Date field with masked typing (`MM/DD/YYYY`-style per-slot editing) plus a calendar panel — month grid, month/year dropdown pickers, prev/next nav, optional quick-pick presets column. Sizes `sm`/`md`/`lg` align with Input/Select.

- Value: `value` + `onValueChange` (controlled) or just an initial `value`. Single mode takes a `Date | null`; `mode="range"` takes `[start, end]` (`RangeValue`, either end may be null mid-selection).
- `open` + `onOpenChange` control the calendar panel (uncontrolled fallback otherwise); the open panel renders inline inside the host — pass `open` to show the calendar statically. `month` sets the initial visible month — pass a fixed date (with a fixed `value`) for deterministic renders; otherwise it defaults to the value's month, then `defaultDate`, then today.
- Disabled days: `minDate`/`maxDate` (inclusive bounds) and/or a `disabledDate` predicate. `presets` is `{ label, value: Date | RangeValue }[]` and renders as a button column beside the grid (widens the panel).
- Format/locale: `locale` (default `'en-US'`) drives month/weekday names and the derived mask; `dateFormat` (e.g. `'DD/MM/YYYY'`) overrides it. `firstDayOfWeek` 0=Sun…6=Sat, default 1 (Monday). `allowInput={false}` makes the field readonly (calendar-only picking).
- Error text replaces the `hint` automatically while typed text is invalid; `invalid` forces error styling. `label`/`required`/`optional`/`ariaLabel` as on Input.
- Keyboard: digits fill mask slots (Backspace/Delete stay within a slot), ArrowDown opens the calendar, arrows/PageUp/PageDown roam the grid, Enter/Space picks, Escape closes.

```tsx
<DatePicker
  label="Delivery date"
  value={new Date(2026, 6, 24)}
  month={new Date(2026, 6, 1)}
  minDate={new Date(2026, 6, 1)}
  onValueChange={setDeliveryDate}
/>
```
