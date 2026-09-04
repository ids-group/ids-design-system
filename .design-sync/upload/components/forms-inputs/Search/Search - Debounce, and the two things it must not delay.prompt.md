# Search - debounce, and the two things it must not delay

[debounce]="200" holds each keystroke back before value updates, so a list screen stops firing a request per character. Default is 0 — every keystroke writes through, exactly as this control always has.

Three things deliberately skip the timer, and they are the reason a wrapped debounceTime usually feels wrong. Clearing the field — emptying a search is a deliberate act, and waiting 200ms to see the whole list back reads as a hang; Enter, which flushes whatever is still in flight so you search what you can see; and the public clear(), for a Clear button that lives outside the control — it empties the field, drops an armed keystroke and publishes '' at once. Writing '' into value is NOT the same: the timer is cancelled only when the incoming text differs from what the control last pushed, so clearing an already-empty-looking field left the keystroke armed. What the input SHOWS is never delayed by any of the three.

Full API: `Search.d.ts`. How to use the component anywhere: `Search.prompt.md`.
