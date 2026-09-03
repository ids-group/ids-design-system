# Select - type-ahead, and the cursor staying in view

Typing a letter on the closed trigger jumps to the first option starting with it and commits, the way a native <select> does; repeating the letter cycles. With the panel open the same keys move the cursor, and the active row scrolls itself into view — try ArrowDown through this list, which is longer than the panel. scrollActiveIntoView="false" hands the scroll position back to you.

PageDown and PageUp move ten rows — the native <select> step, a fixed number rather than a measured screenful so the jump does not change with the panel's height. Home and End go to the first and last option a reader can actually pick, skipping a disabled one.

The scroll follows the KEYBOARD only. The rows set the active row on hover too, and scrolling for that would pull a half-visible row up under the pointer while you were reading with the mouse — try hovering the bottom row here: nothing jumps.

Full API: `Select.d.ts`. How to use the component anywhere: `Select.prompt.md`.
