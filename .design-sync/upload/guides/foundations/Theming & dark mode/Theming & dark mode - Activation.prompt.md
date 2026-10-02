# Theming & dark mode - activation

The active theme is a single attribute on the document root (<html>) — a whole-document switch, not per-subtree.

<html data-neutrals="brand"> re-tints the neutral ramp from --primary-h; light theme only, dark keeps its own ramp.

There is no automatic prefers-color-scheme switch: light is deterministic by default. To follow the OS, add provideDsTheme(followSystem: true). It sets data-theme at startup and on every OS change, and does nothing on the server. It owns the attribute: a value you set yourself is overwritten at startup and on the next OS change.
