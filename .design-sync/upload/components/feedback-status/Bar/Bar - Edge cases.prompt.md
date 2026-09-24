# Bar - edge cases

A value past max fills the track rather than overflowing it, a negative one draws nothing, and a max of zero or less falls back to 100 — a scale with no width has no fraction to draw. indeterminate is ignored unless semantics is 'progress': only a task has an unknown duration.

Full API: `Bar.d.ts`. How to use the component anywhere: `Bar.prompt.md`.
