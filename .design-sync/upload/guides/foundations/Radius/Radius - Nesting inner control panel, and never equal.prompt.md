# Radius - nesting: inner < control < panel, and never equal

A rounded child needs a SMALLER radius than its parent, or its corner bulges.

Where roles do not cover a value: inner radius = outer radius minus the padding between. --radius-flat means "deliberately square", not "unset"; button-group middles and in-range calendar days use it.
