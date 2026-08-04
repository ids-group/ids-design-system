import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import type { IconName } from '../../icons/icons.data';
import type {
  DsPasswordRule,
  DsPasswordRuleState,
} from './password-rules.types';

interface RuleRow {
  readonly label: string;
  readonly state: DsPasswordRuleState;
  readonly icon: IconName;
}

/**
 * Live checklist under a "new password" field.
 *
 * The consumer keeps the POLICY — each rule carries its own `test`, which has to
 * mirror the server — and this owns the rendering: the tri-state glyph, the met
 * and failed colours, the type scale. Written twice by hand in one consumer and
 * the two copies had already drifted (different labels for the same rule, a
 * different order, different state classes), which is the whole reason it is here.
 *
 * ```html
 * <ds-password-rules
 *   [value]="password()"
 *   [rules]="passwordRules"
 *   [judge]="submitted()"
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
  host: { role: 'list' },
})
export class PasswordRulesComponent {
  /** The password being typed. */
  readonly value = input<string>('');
  /** The rule set, in the order it should read. */
  readonly rules = input<readonly DsPasswordRule[]>([]);
  /**
   * Whether an unmet rule may show as FAILED. Bind it to "the user has tried to
   * submit": before that, an unmet rule is merely pending, because marking a
   * half-typed password with errors scolds someone who is still typing.
   */
  readonly judge = input(false, { transform: booleanAttribute });
  /** Lay the rows out in two columns — for a checklist beside a wide form. */
  readonly columns = input<1 | 2>(1);

  protected readonly rows = computed<readonly RuleRow[]>(() => {
    const value = this.value();
    const judge = this.judge();

    return this.rules().map((rule) => {
      const met = rule.test(value);
      const state: DsPasswordRuleState = met
        ? 'met'
        : judge
          ? 'failed'
          : 'pending';

      return {
        label: rule.label,
        state,
        icon: (state === 'met'
          ? 'check'
          : state === 'failed'
            ? 'x'
            : 'minus') as IconName,
      };
    });
  });

  /** How many rules pass — for a host that wants to gate its own submit. */
  readonly metCount = computed(
    () => this.rows().filter((row) => row.state === 'met').length,
  );

  /** True when every rule passes. */
  readonly allMet = computed(
    () => this.rules().length > 0 && this.metCount() === this.rules().length,
  );
}
