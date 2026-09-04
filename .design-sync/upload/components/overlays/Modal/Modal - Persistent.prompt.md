# Modal - persistent

[persistent]="true" disables both backdrop click and Esc — only an explicit close button or programmatic open.set(false) can dismiss the dialog. Use for multi-step wizards or save-required flows where accidental dismissal causes data loss. [closeOnBackdrop]="false" disables only the backdrop click while keeping Esc active.

A backdrop dismissal needs the press AND the release on the backdrop. Selecting text in the body and letting go past the edge does not close the dialog, and neither does a slider drag that overshoots — the browser reports that gesture as a click on the backdrop, which is what used to dismiss it. ds-bottom-sheet behaves the same way; ds-drawer never had the problem, because its scrim is a sibling of the panel rather than its parent.

Full API: `Modal.d.ts`. How to use the component anywhere: `Modal.prompt.md`.
