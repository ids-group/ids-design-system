# Theming & dark mode - writing your own theme or brand

Two levers. A brand is a thin overlay scoped by attribute ([data-brand="X"]) — override the brand hue ramp (--blue-*) and/or --primary plus a few roles. A full theme is a new sibling role map.

You author on light — the default. Dark is a self-contained sibling, so a light-authored brand does not automatically carry into dark. If the brand must also restyle dark, add a separate [data-theme='dark'][data-brand="X"] block.
