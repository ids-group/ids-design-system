# Stats - a value that is a phrase

The value clips to one line and discloses the rest on hover and on keyboard focus, the same treatment every other text-bearing component in the library uses. Three hooks reshape that, and they compose: --ds-stat-value-white-space wraps instead of clipping, --ds-stat-value-lines then puts the ellipsis on the line you name, and --ds-stat-value-wrap breaks a word wider than the tile.

The dashed outline marks where the 240px column ends. Wrapping alone does not keep a value inside it — a single word wider than the tile still paints past the edge, which is what the fourth hook is for. Note that lines only bites once the value wraps: a clamp on a nowrap box has nothing to clamp.

Full API: `Stat.d.ts`. How to use the component anywhere: `Stat.prompt.md`.
