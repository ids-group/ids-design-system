# DatePicker

Date field with masked typing (`MM/DD/YYYY`-style per-slot editing) plus a calendar panel — month grid, month/year dropdown pickers, prev/next nav, optional quick-pick presets column. Sizes `sm`/`md`/`lg` align with Input/Select.

- Value: `value` + `onValueChange` (controlled) or just an initial `value`. Single mode takes a `Date | null`; `mode="range"` takes `[start, end]` (`RangeValue`, either end may be null mid-selection).
- **The field owns its own open state — there is no `open` prop.** The calendar is a CDK overlay PORTALED to `document.body`, so it floats over the layout and no prop shows it open in a static card. `month` sets the initial visible month — pass a fixed date (with a fixed `value`) for deterministic renders; otherwise it defaults to the value's month, then `defaultDate`, then today.
- Disabled days: `minDate`/`maxDate` (inclusive bounds) and/or a `disabledDate` predicate. `presets` is `{ label, value: Date | RangeValue }[]` and renders as a button column beside the grid (widens the panel).
- Format/locale: `locale` (default `'en-US'`) drives month/weekday names and the derived mask; `dateFormat` (e.g. `'DD/MM/YYYY'`) overrides it. `firstDayOfWeek` 0=Sun…6=Sat, default 1 (Monday). `allowInput={false}` makes the field readonly (calendar-only picking).
- Typed text that is not a date is a validation error, shown in place of the `hint` only after the form is submitted, so a card never shows it; `invalid` forces error styling. `label`/`required`/`optional`/`ariaLabel` as on Input.
- `--ds-date-picker-max-width` (default `100%`) caps the field's width; with `fullWidth` the field fills its container up to it.
- Keyboard: digits fill mask slots (Backspace/Delete stay within a slot), ArrowDown opens the calendar, arrows/PageUp/PageDown roam the grid, Enter/Space picks, Escape closes.

```tsx
<DatePicker
  label="Delivery date"
  value={new Date(2026, 6, 24)}
  minDate={new Date(2026, 6, 1)}
  onValueChange={setDeliveryDate}
/>
```
