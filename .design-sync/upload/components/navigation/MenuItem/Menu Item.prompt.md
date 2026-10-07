# Menu Item

Each item is a full-width button.

Blocked but focusable (aria-disabled) so dsTooltip can explain why.

Destructive action, coloured from --error-text.

Muted, still actionable.

icon is optional; when no IconName fits, project a graphic with the icon attribute.

Tokens: --ds-menu-* (bg/border colour, min/max width, gap, radius), --ds-menu-item-* (label/hover/error/quiet colours, padding, font, description colour/size/max width, icon size, radius), --ds-menu-divider-color/-spacing.

Full API: `MenuItem.d.ts`. How to use the component anywhere: `MenuItem.prompt.md`.
