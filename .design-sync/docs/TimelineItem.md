---
category: Data display
---
Single timeline entry (`ds-timeline-item`) — a marker column (circular node + spine) beside a content column. Use inside `Timeline`. The marker centres on the heading, content and time together.

- `heading` is the bold first line; `children` is optional body content; `time` renders muted BELOW the content (it's a footer, not a leading timestamp).
- `icon` fills the node with a 16px glyph; omit it for a plain dot.
- `tone` sets the marker accent via the `data-tone` host attribute: `"default" | "primary" | "success" | "warning" | "error" | "muted"` — filled tones (`primary`/`success`/`warning`/`error`) get a coloured node with white glyph; `default`/`muted` stay bordered/neutral.
- `status` draws a process step and overrides `icon` and `tone`: `'done'` (check), `'running'` (spinner), `'pending'` (dashed ring, muted text), `'error'` (cross). It is spoken before the heading ("Failed: Send to reviewers").
- Slots: `trailing` sits at the end of the heading row (Undo, Retry); `details` hides behind a chevron there, and `expanded` / `onExpandedChange` opens it (closed by default). An open item sits on a tinted card.
- All props optional — a bare `<TimelineItem heading="…" />` is a valid milestone row.
