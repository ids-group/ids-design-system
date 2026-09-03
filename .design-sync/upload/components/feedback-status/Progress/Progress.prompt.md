# Progress

Linear progress bar. The host element is the full-width pill track; a single inner bar shows `value` (0–100, clamped). `indeterminate` switches to a looping sweep animation and ignores/unsets `value` and `aria-valuenow`.

- `variant`: default | success | warning | error — recolours the bar (track stays neutral).
- Always pass `ariaLabel` (e.g. `"Upload progress"`) — the bar has no visible label of its own.
- Host carries `role="progressbar"` with `aria-valuemin/max/now` wired automatically.
- No size axis and no built-in percentage text; compose your own caption row next to it.

```tsx
<Progress value={68} ariaLabel="Manifest upload progress" />
<Progress indeterminate ariaLabel="Syncing depots" />
```
