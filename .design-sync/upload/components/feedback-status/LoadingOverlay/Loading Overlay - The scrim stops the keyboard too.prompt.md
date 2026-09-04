# Loading overlay - the scrim stops the keyboard too

A scrim that only stops the pointer is a trap. The scrim is painted over the content, so it intercepts every click — but focus walked straight under it, and a keyboard user could reach and activate a control the mouse could not even touch, while its data was being replaced. So the covered content goes inert while loading: not tabbable, and out of the accessibility tree. aria-busy stays on the host, so a reader is still told why the content went quiet.

[inertContent]="false" turns that off, and is for a scrim that covers only PART of its content — a blanket flag would take the uncovered part with it. The consumer then marks the covered subtree itself. ds-table does exactly this: its scrim starts below the header, because re-sorting is what puts the scrim up in the first place, so only its <tbody> goes inert and the header stays operable.

Full API: `LoadingOverlay.d.ts`. How to use the component anywhere: `LoadingOverlay.prompt.md`.
