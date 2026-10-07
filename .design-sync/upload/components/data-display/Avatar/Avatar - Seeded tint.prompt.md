# Avatars - seeded tint

seed (an email or name) gives a deterministic hsl(H 50% 62%) tint, identical across apps, with white initials. avatarTint and initialsFrom (also takes one full name) are exported.

White on lighter hues drops to 1.65:1 (WCAG AA: 4.5:1). Keep the default beside a written name; when initials are the only identifier, bind [tint]="avatarTint(seed, { lightness: 50 })" (5.3-6.6:1).

name replaces both bindings in this demo: it derives initials and seeds the tint. The tint hashes the NAME, never the initials: Alice Brown and Adam Bell (both "AB") get hues 198° and 356°.

Default initials: first letters of the first two words, a Latin-script guess (Spanish wants MG for "María José García López"). Override per instance with [initialsRule] or app-wide with provideDsConfig({ avatar: { initials } }); explicit initials wins.

Same seeds with [avoidHues]="[[310, 360], [0, 20]]", skipping a brand's pink and red:

Full API: `Avatar.d.ts`. How to use the component anywhere: `Avatar.prompt.md`.
