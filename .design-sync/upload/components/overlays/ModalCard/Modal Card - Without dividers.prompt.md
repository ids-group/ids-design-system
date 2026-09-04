# Modal Card - without dividers

[dividers]="false" drops the rules and tightens the vertical padding in one move, because those are one design decision. Hiding the rules alone — --ds-modal-divider: transparent — leaves the header and body padding stacked into a gap sized for a rule that is no longer drawn.

Which padding collapses is deliberate: the BODY's goes to zero and the header and actions keep theirs. The body is the scroll container, so a gap living in its padding would scroll away and content would meet the title; the header's own padding-bottom cannot, so it separates the two at every scroll position.

For a whole-app opinion, set it once — provideDsConfig({ modal: { dividers: false } }) rather than a binding on every modal. It also reaches where an attribute cannot: a ModalService confirm renders a ds-modal-card with no ds-modal ancestor to bind, and the injected default gets there. An explicit [dividers] on the element still wins.

Full API: `ModalCard.d.ts`. How to use the component anywhere: `ModalCard.prompt.md`.
