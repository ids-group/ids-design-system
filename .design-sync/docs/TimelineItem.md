---
category: Data display
---
Single timeline entry (`ds-timeline-item`) — a marker column (circular node + spine) beside a content column. Use only as a direct child of `Timeline`.

- `heading` is the bold first line; `children` is optional body content; `time` renders muted BELOW the content (it's a footer, not a leading timestamp).
- `icon` fills the node with a 15px glyph; omit it for a plain dot.
- `tone` sets the marker accent via the `data-tone` host attribute: `"default" | "primary" | "success" | "warning" | "error" | "muted"` — filled tones (`primary`/`success`/`warning`/`error`) get a coloured node with white glyph; `default`/`muted` stay bordered/neutral.
- All props optional — a bare `<TimelineItem heading="…" />` is a valid milestone row.
