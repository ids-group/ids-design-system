# Avatars - seeded tint

Pass seed (an email or name) for a deterministic hsl(H 50% 62%) colour — the same person always gets the same tint across apps — with WHITE initials on every one. The helpers avatarTint and initialsFrom (which also accepts a single full name) are exported for use outside the component.

The trade this makes, stated plainly. HSL lightness is not perceptually even, so a yellow lands far lighter than a blue at the same 62% — and that unevenness is what makes the row read as bright rather than uniform. White initials on the lighter hues measure as little as 1.65:1, under the 4.5:1 WCAG AA asks of text. Use it where the avatar is decoration beside a name that is written out anyway; where the initials are the only identifier, pass your own lightness and foreground.

Or pass the name and let the avatar do both. name replaces the two bindings this demo wires by hand: it derives the initials AND seeds the tint. The tint hashes the NAME, never the initials — two letters collide wholesale, so Alice Brown and Adam Bell would otherwise share one colour. Measured: same "AB", hues 198° and 356°.

The built-in rule takes the first two words, and that is all it claims to be — a Latin-script guess. Reading a name is a cultural convention rather than a UI decision: a Spanish reader wants MG from "María José García López", a club's members want BR from "Bramley Rovers Football Club". So the rule is replaceable, not configurable-by-mode — [initialsRule] for one table, provideDsConfig({ avatar: { initials } }) for the app. An explicit initials still wins over both.

Same seeds with [avoidHues]="[[310, 360], [0, 20]]" — pink and red hues are skipped so seeded avatars never clash with a brand colour:

Full API: `Avatar.d.ts`. How to use the component anywhere: `Avatar.prompt.md`.
