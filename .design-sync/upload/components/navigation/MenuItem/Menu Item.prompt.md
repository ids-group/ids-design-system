# Menu Item

Four items with icons, the usual account-menu shape.

Activation is blocked, but the item stays focusable (aria-disabled), so a dsTooltip can explain why.

Destructive action, coloured from --error-text.

Muted, still actionable.

Icons are optional.

Tokens: --ds-menu-* (bg/border colour, min/max width, gap, radius), --ds-menu-item-* (label, hover, error and quiet colours, padding, font, description colour/size/max width, icon size, radius) and --ds-menu-divider-color/-spacing.

Full API: `MenuItem.d.ts`. How to use the component anywhere: `MenuItem.prompt.md`.
