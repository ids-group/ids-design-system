# Modal Card - status

status takes DsStatus and sets the icon-badge tint, title colour, default icon and ARIA role; the icon is there so severity is not signalled by colour alone. error and warning become alertdialog, the rest dialog - the same split as ds-alert 's alert / status.

icon (overrides the glyph), dialogRole (overrides the role) and showClose are inputs of ds-modal-card only; ds-modal always picks icon and role from status and always shows the close button.

Full API: `ModalCard.d.ts`. How to use the component anywhere: `ModalCard.prompt.md`.
