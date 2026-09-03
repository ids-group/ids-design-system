# Theming & dark mode - worked example — a square brand

The most common whole-brand change, and the one most often done the long way: a consumer audit found twelve scattered --ds-<component>-radius: 0 declarations written one component at a time. Four lines replace all of them.

Three role declarations do it, and as of 2026-08-10 that is finally true. Measured: on a component page, zeroing --ds-radius-inner, -control and -panel squares most rounded surfaces, and it is worth knowing which ones it does not. Thirty-one declarations across nineteen components still read the scale directly rather than a role — the menu panel, the toast, split-button and button-group segment corners, the sidenav footer, the colour-picker swatches and a dozen others. Zeroing the three roles leaves those at their scale value. --radius-pill is out of scope by design: switch tracks, avatars and status dots are round by shape, not by style.

Zeroing the SCALE instead is the blunter option, and it reaches everything the roles miss: those thirty-one declarations, plus the focus-ring radii, which deliberately follow the scale rather than a role — a ring traces a box, it is not a surface a brand designs. Use it if you want the corners squared everywhere.

Leave --radius-pill alone either way. A switch track, an avatar and a status dot are round because of what they are, not because of the brand — verified: with the scale zeroed, the switch track stays fully rounded because it resolves the pill token instead.

The roles also give you the partial case, which the scale cannot — one declaration moves a family and leaves its neighbour alone:
