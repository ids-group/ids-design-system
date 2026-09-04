# Link - on a button, for an action that is not navigation

ds-button warns variant="text" off in favour of this class, and anything that acts rather than navigates has to be a <button> — so the class resets the browser's button chrome itself. It did not until 2026-08-11: every consumer who took that advice wrote the same padding/border/background/font reset by hand. Both of these are the same class, and the button below matches the anchor beside it on every measured property except display, which stays inline-block so a standalone one lays out predictably.

Sentence with an anchor and a button side by side in running text.
