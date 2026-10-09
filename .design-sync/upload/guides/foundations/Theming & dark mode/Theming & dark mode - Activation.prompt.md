# Theming & dark mode - activation

One attribute on <html> switches the whole document, not a subtree.

<html data-neutrals="brand"> re-tints the neutral ramp from --primary-h; light theme only, dark keeps its own ramp.

No automatic prefers-color-scheme switch. To follow the OS, add provideDsTheme(followSystem: true).
