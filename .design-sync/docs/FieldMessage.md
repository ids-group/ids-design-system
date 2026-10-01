---
category: Forms & inputs
---
The one line under a form control - hint, error, success or warning - `ds-field-message`, drawn by every DS field itself. It has no component of its own to place: set the message on the field.

- `hint` is the line's text, and `invalid` turns it into the error; `success` and `warning` take a text of their own.
- The colour and the glyph follow that state.
- `reserveMessage` keeps the line's height while it is empty, so a form does not jump as messages appear.

```tsx
<Input label="Postcode" invalid hint="Enter a valid postcode" reserveMessage />
```
