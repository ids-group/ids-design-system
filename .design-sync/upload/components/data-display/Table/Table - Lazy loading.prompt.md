# Table - lazy loading

The same 10 000 records, except the table starts with none of them. With [lazy]="true" the window asks for the range it is about to show through (lazyLoad), and every index the host has not filled yet renders a skeleton row. Scroll fast and you outrun the fetch — that is what the skeletons are for.

data is a SPARSE array total long: write each fetched row at its absolute index. The scroller is sized from total, not from what has arrived, so the scrollbar tells the truth from the first frame. The demo answers after 600 ms; a request already in flight is never re-sent.

Requests so far:

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
