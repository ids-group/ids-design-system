/**
 * One password requirement. The consumer owns the POLICY — `test` must mirror
 * whatever their server enforces — and the DS owns only how the row reads.
 */
export interface DsPasswordRule {
  /** Row text, e.g. "At least 8 characters". */
  readonly label: string;
  /** Whether the current value satisfies this rule. */
  readonly test: (value: string) => boolean;
}

/** Per-row state, exposed so a consumer can style or test against it. */
export type DsPasswordRuleState = 'pending' | 'met' | 'failed';
