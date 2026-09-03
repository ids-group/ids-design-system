# Multi-select - hiding the filter row

searchable takes true (always, the default), false (never), or a number — the threshold at which the row appears, stated where it applies. Set DS_CONFIG.picker.searchable to give the whole app one threshold and override it per panel.

Hiding the row moves the panel's keyboard model onto the trigger: arrows, Enter, Escape and aria-activedescendant belong to the filter input when it is there.

Full API: `MultiSelect.d.ts`. How to use the component anywhere: `MultiSelect.prompt.md`.
