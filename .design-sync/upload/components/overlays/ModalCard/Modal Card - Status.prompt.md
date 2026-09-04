# Modal Card - status

status takes the same DsStatus vocabulary as the rest of the library, and one word drives four things: the icon-badge tint, the title colour, the DEFAULT icon and the ARIA role. The icon comes with the status on purpose — a tint alone signals by colour only, which a colour-blind reader cannot act on. Pass icon to override the glyph, or dialogRole to override the role.

error and warning resolve to alertdialog — the role for a dialog that interrupts with something the reader must act on — and everything else stays dialog. Same split ds-alert makes between alert and status.

Full API: `ModalCard.d.ts`. How to use the component anywhere: `ModalCard.prompt.md`.
