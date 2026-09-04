# Search - in a form, and disabled

A search box holds a value, so it binds like any other control now: [formControl], formControlName, [(ngModel)] and a signal form all reach it, and its own [(value)] keeps working. A disabled input folds together with the form's own disabled state, and the shell paints the disabled surface — it used to look live and still take a click.

Deliberately no label and no message row. A toolbar filter is not a validated field, and giving it the field chrome would restyle every toolbar it sits in. Where a search needs a label or an error line, that is what ds-input is for.

Full API: `Search.d.ts`. How to use the component anywhere: `Search.prompt.md`.
