# Modal Card - actions that outgrow the card

Labels stay on one line. When the row no longer fits the card, the card measures it and stacks the buttons full-width; the DOM order is kept, so Tab and a screen reader read it as before and the confirming action lands at the bottom by default. Set --ds-modal-actions-stacked-direction: column-reverse to put it on top instead. A row that fits stays right-aligned.

Full API: `ModalCard.d.ts`. How to use the component anywhere: `ModalCard.prompt.md`.
