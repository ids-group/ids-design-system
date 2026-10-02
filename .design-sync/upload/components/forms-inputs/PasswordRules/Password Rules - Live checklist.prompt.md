# Password rules - live checklist

Each rule carries its own test, which must mirror your server; the component owns only the glyph, colours and type scale. An unmet rule reads as pending (an empty circle) and turns into a check when it passes. It reads as failed only while [showUnmet] is true - bind it to "the user has tried to submit".

For the form validator, call the exported passwordRulesMet(value, rules). On a template reference, #rules.allMet() gates the submit and metCount() counts the passing rules.

Two columns, for a checklist beside a wide form.

Full API: `PasswordRules.d.ts`. How to use the component anywhere: `PasswordRules.prompt.md`.
