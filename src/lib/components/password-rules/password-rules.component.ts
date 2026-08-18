import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import type { IconName } from '../../icons/icons.data';
import { nextControlId } from '../field-ids';
import type {
  DsPasswordRule,
  DsPasswordRuleState,
} from './password-rules.types';

interface RuleRow {
  readonly label: string;
  readonly state: DsPasswordRuleState;
  readonly icon: IconName;
  readonly announced: string;
}

// Screen-reader wording per state. The glyph is a decorative SVG with no
// accessible name, so without these a screen reader hears the rule text and
// nothing about whether it passed — the state would be conveyed by colour and
// shape only.
const ANNOUNCED: Record<DsPasswordRuleState, string> = {
  pending: 'not yet met',
  met: 'met',
  failed: 'not met',
};

/**
 * Passes when every rule does. Exported separately so a form can gate its submit
 * from a validator without reaching for the component instance.
 */
export function passwordRulesMet(
  value: string,
  rules: readonly DsPasswordRule[],
): boolean {
  return rules.length > 0 && rules.every((rule) => rule.test(value));
}

/**
 * Live checklist under a "new password" field.
 *
 * The consumer keeps the POLICY — each rule carries its own `test`, which has to
 * mirror the server, or the checklist is a lie — and this owns the rendering: the
 * tri-state glyph, the met and failed colours, the type scale. One consumer had
 * written it twice and the copies had already drifted (different labels for the
 * same rule, a different order, different state classes), which is why it is here.
 *
 * ```html
 * <ds-input
 *   type="password"
 *   [attr.aria-describedby]="rules.listId"
 *   [(value)]="password"
 * />
 * <ds-password-rules
 *   #rules
 *   [value]="password()"
 *   [rules]="passwordRules"
 *   [showUnmet]="submitted()"
 * />
 * ```
 */
@Component({
  selector: 'ds-password-rules',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './password-rules.component.html',
  styleUrl: './password-rules.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordRulesComponent {
  /** The password being typed. */
  readonly value = input<string>('');
  /** The rule set, in the order it should read. */
  readonly rules = input<readonly DsPasswordRule[]>([]);
  /**
   * Whether an unmet rule may read as FAILED. Bind it to "the user has tried to
   * submit": before that an unmet rule is merely pending, because marking a
   * half-typed password with errors scolds someone who is still typing.
   */
  readonly showUnmet = input(false, { transform: booleanAttribute });
  /** Lay the rows out in two columns — for a checklist beside a wide form. */
  readonly columns = input<1 | 2>(1);

  /**
   * Id put on the rule list, for the field's `aria-describedby`. Defaults to a
   * generated one; set it explicitly and both sides can name the same string,
   * which avoids threading a template ref between two siblings.
   */
  readonly listId = input<string>(nextControlId('ds-password-rules'));

  protected readonly rows = computed<readonly RuleRow[]>(() => {
    const value = this.value();
    const showUnmet = this.showUnmet();

    return this.rules().map((rule) => {
      const met = rule.test(value);
      const state: DsPasswordRuleState = met
        ? 'met'
        : showUnmet
          ? 'failed'
          : 'pending';
      const icon: IconName =
        state === 'met' ? 'check' : state === 'failed' ? 'x' : 'circle';

      return { label: rule.label, state, icon, announced: ANNOUNCED[state] };
    });
  });

  /** How many rules pass — for a host that wants to gate its own submit. */
  readonly metCount = computed(
    () => this.rows().filter((row) => row.state === 'met').length,
  );

  /** True when every rule passes. */
  readonly allMet = computed(() =>
    passwordRulesMet(this.value(), this.rules()),
  );
}
