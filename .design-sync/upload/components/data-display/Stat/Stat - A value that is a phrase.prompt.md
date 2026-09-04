# Stats - a value that is a phrase

The value line is white-space: nowrap, which is right for the number this tile was built around and wrong for a date range or a status phrase — that used to be a reason to reach for the slot above and undo it. Two hooks instead: --ds-stat-value-white-space and --ds-stat-value-font-size, the second working at every size rather than only the default.

Left: both hooks set. Right: the same value untouched — with nowrap and no overflow on the card, the phrase spills straight past the tile's edge. That is the behaviour every existing tile keeps, since the defaults did not move.

Full API: `Stat.d.ts`. How to use the component anywhere: `Stat.prompt.md`.
