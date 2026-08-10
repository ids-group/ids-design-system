/**
 * On a CRLF checkout a rule that hard-codes `\n` is wrong twice: it reports every
 * correctly formatted file, and its fix leaves mixed endings behind.
 */
export function detectEol(text) {
  return text.includes('\r\n') ? '\r\n' : '\n';
}
