# Cards - a full-bleed child needs the card to clip

A child whose background runs to the card’s edge paints its square corners over the card’s radius, and the host cannot fix it: the rounded box is the card’s own inner element. Set --ds-card-overflow: clip on the card. clip rather than hidden, so the card does not become a scroll container.

It is opt-in, and that is deliberate. A clipped card also cuts the focus ring off any child sitting at its edge — the ring is an outset shadow, and this is the exact case Foundations → Colour names. If the clipped card holds focusable content, put data-focus="inset" on it and the indicator moves inside the box instead of disappearing.

Full API: `Card.d.ts`. How to use the component anywhere: `Card.prompt.md`.
