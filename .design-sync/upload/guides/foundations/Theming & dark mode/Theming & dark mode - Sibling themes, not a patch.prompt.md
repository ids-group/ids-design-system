# Theming & dark mode - sibling themes, not a patch

Light and dark are sibling role maps sharing the base palette and the same role structure. The dark block declares the complete token set, so :root[data-theme='dark'] fully replaces light rather than delta-patching it. On-fill text is the literal white, or the theme-stable --static-ink where the fill is light, so neither flips with the neutrals.
