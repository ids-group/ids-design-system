# DS auto-update feedback - bandsmith, 0.15.3 -> 1.0.0 (2026-10-22)

## manifest:1.0.0#field-errors-shown-after-submit
- **should-fix, false-negative.** The locators (form-model words) never reach a `ds-date-picker` without a form model, but its unparseable-date error now shows only under `[dsSubmitted]` (v1.0.0 `field-errors.ts:173-175`, `date-picker.component.ts:287-298`; v0.15.3 revealed it on blur, `field-errors.ts:165-167`). Bandsmith had 24 such components. Proposal: add `<ds-date-picker` to `detect` and name both fixes in `action` (the form's flag, or `[dsSubmitted]="true"` for a live-applied picker).
- **nit, gap.** A native submit leaves `FormGroupDirective.submitted` true; `FormGroup.reset()` does not clear it, so a re-opened form greets with errors. Proposal: a pitfall line pointing to `resetForm()`.
