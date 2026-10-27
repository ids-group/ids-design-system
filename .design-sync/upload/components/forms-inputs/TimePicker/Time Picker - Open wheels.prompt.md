# Time picker - open wheels

loop runs the hour and minute columns on past either end: 'auto' (default) a column that holds more values than it shows, 'always' or 'never'; app-wide in DS_CONFIG.timePicker.loop. A column scrolls to a picked cell, moves about one row per wheel notch when it loops and at the browser's wheel speed when it does not, snaps to the centre, and selects the centred cell while it scrolls; the panel stays open.

Full API: `TimePicker.d.ts`. How to use the component anywhere: `TimePicker.prompt.md`.
