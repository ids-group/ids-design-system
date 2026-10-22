# Buttons - refused with reason

Two refusals, treated differently, plus the room the second needs.

disabledReason with disabled adds the reason as a second line and swaps native disabled for aria-disabled: still tabbable (links too), reason announced, clicks swallowed. Long reasons wrap.

Keep it live until the first submit; after a failed one, disable it while the form is invalid. Explain with the fields' hint, warning or error line. A longer message widens the button.

reserveMessage holds the empty line, so a late error does not shift layout. Falls back to DS_CONFIG.field.reserveMessage, as on fields.

Full API: `Button.d.ts`. How to use the component anywhere: `Button.prompt.md`.
