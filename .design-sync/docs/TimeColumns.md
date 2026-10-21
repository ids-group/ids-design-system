---
category: Forms & inputs
---
The scrolling hour/minute (and AM/PM) columns inside TimePicker's panel. Use TimePicker unless you are composing a custom time surface.

- `value` is `HH:mm` (24-hour) regardless of `format`; `format` only changes what is displayed and whether a meridiem column appears.
- `minuteStep` thins the minute column — `5` or `15` for a booking grid, `1` for a precise entry.
- `minTime` / `maxTime` bound the selectable range; `disabledTime` rejects individual times a range cannot express (a break in a schedule).
- `onTimeChange` fires with the full `HH:mm` once every part needed for a valid time is chosen. `onPartPicked` reports which column the user just committed by click or key, for a parent that advances focus; a scroll that ends on a cell fires `onTimeChange` and not `onPartPicked`.

```tsx
<TimeColumns value={time} format="24h" minuteStep={15} minTime="09:00" maxTime="18:00" onTimeChange={setTime} />
```
