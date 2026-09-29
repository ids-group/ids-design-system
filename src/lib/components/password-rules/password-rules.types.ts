/**
 * One password requirement; `test` must mirror what the server enforces.
 */
export interface DsPasswordRule {
  /** Row text, e.g. "At least 8 characters". */
  readonly label: string;
  /** Whether the current value satisfies this rule. */
  readonly test: (value: string) => boolean;
}

/** Per-row state. */
export type DsPasswordRuleState = 'pending' | 'met' | 'failed';
