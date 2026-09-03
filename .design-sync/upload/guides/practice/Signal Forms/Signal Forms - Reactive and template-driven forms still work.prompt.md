# Signal Forms - reactive and template-driven forms still work

Nothing here replaces anything. Every control still provides a ControlValueAccessor, so formControlName and ngModel bind exactly as before, and the same message row serves both. A given field is driven by one form system at a time, so the two cannot disagree.
