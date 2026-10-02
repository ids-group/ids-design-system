# Avatars - seeded tint

Pass seed (an email or name) for a deterministic hsl(H 50% 62%) colour — the same person always gets the same tint across apps — with WHITE initials on every one. The helpers avatarTint and initialsFrom (which also accepts a single full name) are exported for use outside the component.

HSL lightness is not perceptually even, so white initials on the lighter hues measure as low as 1.65:1, under WCAG AA's 4.5:1. Use the default where a written name sits beside the avatar; where the initials are the only identifier, bind [tint]="avatarTint(seed, { lightness: 50 })" - white then measures 5.3-6.6:1.

Or pass the name and let the avatar do both. name replaces the two bindings this demo wires by hand: it derives the initials AND seeds the tint. The tint hashes the NAME, never the initials — two letters collide wholesale, so Alice Brown and Adam Bell would otherwise share one colour. Measured: same "AB", hues 198° and 356°.

The built-in rule takes the first letters of the first two words - a Latin-script guess (a Spanish reader wants MG from "María José García López"). Replace it per instance with [initialsRule] or app-wide with provideDsConfig({ avatar: { initials } }); an explicit initials still wins over both.

Same seeds with [avoidHues]="[[310, 360], [0, 20]]" — pink and red hues are skipped so seeded avatars never clash with a brand colour:

Full API: `Avatar.d.ts`. How to use the component anywhere: `Avatar.prompt.md`.
