# Meter - edge cases

A value past max fills the track rather than overflowing it, a negative one draws nothing, and a max of zero or less falls back to 100 — a scale with no width has no fraction to draw.

Full API: `Meter.d.ts`. How to use the component anywhere: `Meter.prompt.md`.
