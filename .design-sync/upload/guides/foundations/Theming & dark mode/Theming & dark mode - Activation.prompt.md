# Theming & dark mode - activation

The active theme is a single attribute on the document root (<html>) — a whole-document switch, not per-subtree.

There is no automatic prefers-color-scheme switch — light is deterministic by default. To follow the OS, opt in from your app bootstrap; set the attribute before first paint to avoid a flash:
