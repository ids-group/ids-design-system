/**
 * Checkouts on Windows are CRLF, and a rule that hard-codes `\n` gets it wrong
 * twice: comparing a built-up shape against the source reports every correctly
 * formatted file, and the fix writes LF lines into a CRLF file.
 */
export function detectEol(text) {
  return text.includes('\r\n') ? '\r\n' : '\n';
}
