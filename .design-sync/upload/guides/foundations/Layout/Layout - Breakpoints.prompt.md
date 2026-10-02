# Layout - breakpoints

A custom property can't be read inside an @media condition, so for media queries use the compile-time Sass aliases instead: after @use 'styles/breakpoints' as bp write @include bp.up(md) or bp.down(sm) (up inclusive, down exclusive), or read bp.$bp-md directly. The --bp-* custom properties below stay for regular rules and JS.
