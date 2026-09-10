# Buttons - navigation that looks like a button

Three elements, decided by destination: routerLink renders an <a [routerLink]>, href a plain <a href>, and neither a <button type="button">. The look is identical across all three, because the styling is class-based — so a call-to-action can stay a real link, and middle-click, open-in-new-tab and the "link" role a screen reader announces all keep working.

type and loading are button-only and warn in dev if set here. A disabled link-button takes aria-disabled and tabindex="-1" instead of the native attribute, which an anchor does not have.

Full API: `Button.d.ts`. How to use the component anywhere: `Button.prompt.md`.
