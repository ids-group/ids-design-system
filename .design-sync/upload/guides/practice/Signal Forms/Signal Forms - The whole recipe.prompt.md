# Signal Forms - the whole recipe

Describe the shape and the rules in the component, then point each control at a field. The DS side is one attribute — [formField] — and it comes from @angular/forms/signals, not from this library. That is the point: a DS control participates because it exposes value as a model(), which is the entire FormValueControl contract.

Type an invalid address and leave the field: the message appears only after the field is touched, the border turns, aria-invalid flips, and the button stays disabled until the form is valid. None of that is wired in the template.
