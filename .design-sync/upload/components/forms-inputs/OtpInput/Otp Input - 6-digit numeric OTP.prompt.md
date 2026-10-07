# OTP input - 6-digit numeric OTP

length defaults to 6 and mode to numeric (digits, numeric keypad); alphanumeric accepts letters. (completed) fires with the code when it goes from partial to complete, not on edits of a full code.

Paste spreads across cells; Backspace on an empty cell clears the previous one; ArrowLeft / ArrowRight move; focus snaps to the first empty cell. The first cell has autocomplete="one-time-code" for SMS autofill. The row is a role="group" named by ariaLabel (fallback DS_INTL.otpInput.label); cells are labelled "digit N" or "character N" from DS_INTL.otpInput.

Full API: `OtpInput.d.ts`. How to use the component anywhere: `OtpInput.prompt.md`.
