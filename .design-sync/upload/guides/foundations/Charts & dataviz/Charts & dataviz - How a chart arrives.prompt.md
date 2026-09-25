# Charts & dataviz - how a chart arrives

Marks arrive in stages. Columns, bars and waterfall steps grow out of their baseline over --ds-motion-chart-mark-grow-duration (600ms), a ring turns in and a line draws on over --ds-motion-chart-mark-sweep-duration (600ms), and value labels and markers follow over --ds-motion-chart-mark-detail-duration (180ms). A mark that fades or settles in place takes --ds-motion-chart-mark-enter-duration (400ms). A series' arrivals spread across 260ms, however many marks it has. Under reduced motion every mark appears at once.
