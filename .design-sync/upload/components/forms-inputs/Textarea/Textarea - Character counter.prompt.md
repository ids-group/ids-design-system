# Textarea - character counter

[maxLength] caps input length natively and shows a live current/max counter below the field — right-aligned, aligned with the hint.

maxLengthMode="soft" lets the text run past the limit: the counter turns red, the characters past it are highlighted, and the field reports aria-invalid with the counter as its description. The form still decides whether to block a save.

Full API: `Textarea.d.ts`. How to use the component anywhere: `Textarea.prompt.md`.
