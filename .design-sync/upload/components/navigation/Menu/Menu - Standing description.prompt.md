# Menu - standing description

description puts a second line under the label for a limitation the action carries. Unlike a [dsTooltip], it is visible without hover or focus — which is the whole point of a caveat like "will not be saved". It reaches assistive tech as aria-describedby, not as part of the item's name: the label names the action, the description describes it. So a screen reader announces "Export as CSV" and then the caveat, rather than one run-on name.

Full API: `Menu.d.ts`. How to use the component anywhere: `Menu.prompt.md`.
