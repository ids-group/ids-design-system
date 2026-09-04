# Form layout - reserved rows and the stack gap, side by side

Both columns hold the same three fields with reserveMessage on. The left one stacks them at gap="md" and the rhythm goes slack, because the reserved row ALREADY carries the trailing space the gap is adding again. The right one is gap="none" and reads correctly. Turn on the error to watch neither column shift: that is what reserving buys, and why it is worth the row.

The awkward case is a MIXED stack. A gap="none" column works because every child carries its own trailing space — so the moment one does not, the rhythm goes ragged. A field with [reserveMessage]="false", a button row, a switch or a divider in that same column sits flush against its neighbour while the reserved fields around it look correctly spaced. Below, the switch and the button row are the children with no message row of their own.

The fix is per-child rather than per-stack: give the children that carry no message row the same trailing space the reserved ones have, and leave the stack at gap="none". Reaching for gap="md" to rescue the odd child re-adds the doubled rhythm to every field.
