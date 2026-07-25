---
category: Forms & inputs
---
One-time-code entry rendered as N single-character cells. Typing advances to the next cell, Backspace on an empty cell steps back, paste distributes across cells, and focus snaps to the first empty cell so codes stay left-packed.

- Value: `value` (flat string, e.g. "482913") + `onValueChange` (controlled) or an initial `value`. `length` sets the cell count (default 6).
- `mode="numeric"` (default) restricts to digits and sets the numeric mobile keyboard; `"alphanumeric"` allows letters. `mask` shows password dots.
- `onCompleted(code)` fires once on the partial → complete transition (not on later edits of a full code). First cell gets `autocomplete="one-time-code"`.
- `invalid` outlines every cell in the error colour; put the error text in `hint`. `ariaLabel` names the group (default "Verification code").

```tsx
<OtpInput length={6} value={code} onValueChange={setCode} onCompleted={verify} hint="Enter the 6-digit code we texted you." />
```
