# Password rules - live checklist

Each rule's test must mirror your server; the component owns only glyph, colours and type scale. An unmet rule shows pending (an empty circle), then a check when it passes, and failed only while [showUnmet] is true - bind it to "the user has tried to submit".

Validators call the exported passwordRulesMet(value, rules). Via a template reference, #rules.allMet() gates submit and metCount() counts passing rules.

Two columns, beside a wide form.

Full API: `PasswordRules.d.ts`. How to use the component anywhere: `PasswordRules.prompt.md`.
