# OTP input - 6-digit numeric OTP

length defaults to 6 and mode to numeric (digits, numeric keypad); alphanumeric accepts letters. (completed) fires with the code when it goes from partial to complete, not on every edit of a full code.

Paste spreads across the cells, Backspace on an empty cell clears the previous one, ArrowLeft / ArrowRight move, and focus snaps to the first empty cell. The first cell has autocomplete="one-time-code" for SMS autofill.

The row is a role="group" named by ariaLabel, falling back to DS_INTL.otpInput.label; each cell is labelled "digit N" or "character N" from DS_INTL.otpInput.

Full API: `OtpInput.d.ts`. How to use the component anywhere: `OtpInput.prompt.md`.
