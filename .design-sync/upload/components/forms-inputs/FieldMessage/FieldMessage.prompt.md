# FieldMessage

The one line under a form control — hint, error, success or warning. Every DS field renders one internally; use it directly only for a control the DS does not provide.

- `text` is the message; `state` (`default` | `error` | `success` | `warning`) picks the colour and the glyph.
- `icon` overrides the state glyph, or `false` removes it.
- `messageId` is the id a control points `aria-describedby` at — set it, or a screen reader never reads the message.
- `reserve` keeps the line's height when there is no text, so a form does not jump as messages appear. Prefer it on any field that can become invalid.

```tsx
<FieldMessage state="error" text="Enter a valid postcode" messageId="postcode-msg" reserve />
```
