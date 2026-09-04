# Field Message - the glyph on the message line

error, warning and success each bring a glyph; hint does not, because it is the resting text rather than a state and a form where every field carries an info circle reads as noise. Colour alone was the whole signal before — and in the light theme warning (#8A7400) against success (#156822) is a hue apart and nothing else, which is the case WCAG 1.4.1 is about.

Per state, app-wide: DS_CONFIG.field.stateIcons — each key independent, a name replaces the glyph, false removes it, and stateIcons: false removes all four. On one field, messageIcon wins over both:

Bind error and it shows at once — binding it says you have already decided. Everything else can come from the form control instead, and then you bind nothing: the field reads the control and waits for the first blur, so a required error never greets an untouched form. Both fields below are plain [formControl] with Validators and no message binding at all — focus one, leave it empty, and blur.

A form can raise a WARNING, not only an error. "Display name" above runs a validator that returns warning: 'Long runs of capitals are hard to scan' — the reserved kind exported as DS_FIELD_WARNING_KIND. The field paints the warning state and shows the text, but stays VALID: aria-invalid is not set and a submit guard reading validity is not blocked. Angular's AbstractControl has no channel for an advisory remark — only errors and the validity derived from it — so this rides in errors under a kind the DS treats as non-blocking. It works from both form systems: a reactive validator's KEY becomes the kind, and signal forms' own ValidationError already carries one.

The text for required and minlength above comes from one shared map — provideDsConfig(field: errorMessages: …) on this section — because Angular's built-in validators carry a detail object and no wording. A validator that supplies its own message wins over the map: "admin" is rejected by a custom validator returning taken: 'That handle is already taken'. In signal forms the same thing is written at the validator — required(path, message: …) — and the field needs no binding there either, because errors and touched are the names Angular's FormUiControl contract binds automatically.

Full API: `FieldMessage.d.ts`. How to use the component anywhere: `FieldMessage.prompt.md`. This component is not exported by the package, so it has neither.
