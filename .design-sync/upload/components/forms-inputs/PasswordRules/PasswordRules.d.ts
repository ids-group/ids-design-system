import * as React from 'react';

/**
 * PasswordRules — the real PasswordRulesComponent, run by Angular behind `<ds-x-password-rules>`.
 * Live checklist under a password field — each rule ticks as the value satisfies it. Shows the user what is still missing instead of failing them on submit.
 */
export interface PasswordRulesProps {
  /** The password being typed. */
  value?: string;
  /** The rule set, in the order it should read. */
  rules?: unknown;
  /** Whether an unmet rule may read as FAILED. Bind it to "the user has tried to submit": before that an unmet rule is merely pending, because marking a half-typed password with errors scolds someone who is still typing. */
  showUnmet?: boolean;
  /** Lay the rows out in two columns — for a checklist beside a wide form. */
  columns?: 1 | 2;
  /** Id put on the rule list, for the field's `aria-describedby`. Defaults to a generated one; set it explicitly and both sides can name the same string, which avoids threading a template ref between two siblings. */
  listId?: string;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const PasswordRules: React.ComponentType<PasswordRulesProps>;
