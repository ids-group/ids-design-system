# Layout - breakpoints

@media conditions cannot read custom properties; use the Sass aliases. After @use 'styles/breakpoints' as bp write @include bp.up(md) or bp.down(sm) (up inclusive, down exclusive), or read bp.$bp-md directly. --bp-* properties below serve regular rules and JS.
