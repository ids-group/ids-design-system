# Buttons - refused with reason

Two kinds of refusal, and they take different treatments. The third column is the room the second one needs.

Nothing on this screen will lift it (no permission, no integration). Set disabledReason beside disabled: the reason renders as a second line inside the button, and the button switches from the native disabled attribute to aria-disabled so it stays focusable and the reason is announced. Clicks are swallowed either way. Length is uncapped — a long reason wraps and the button grows.

The user's own next action lifts it. Do not disable the button at all: leave it live, judge validity in the submit handler, and carry the text under the button with hint, warning or error — the same three inputs the fields take, with the same message line under them. A message longer than the label widens the pair, button included, the way a field's control spans its own message.

reserveMessage holds the line's height while it is empty, so a button that gains an error mid-form does not shove the layout below it. Same input, same DS_CONFIG.field.reserveMessage fallback as the fields.

None of the three reaches ds-icon-button: an icon button has no room for a second line. It gained ariaDescribedBy instead, to point at text the page already shows.

Full API: `Button.d.ts`. How to use the component anywhere: `Button.prompt.md`.
