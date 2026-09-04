# Bottom sheet - snap points

Pass [snapPoints]="[0.35, 0.65, 0.9]" to enable multi-stop snapping. The sheet opens at the first stop; dragging snaps to the nearest stop; dragging below the lowest stop closes. Heights are fractions of viewport height (0–1), provided in ascending order. Omitting the input preserves the original single-height behaviour.

Full API: `BottomSheet.d.ts`. How to use the component anywhere: `BottomSheet.prompt.md`.
