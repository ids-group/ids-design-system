import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { DS_INTL, type IconName } from '@ids-group-ltd/ids-design-system/core';
import { nextControlId } from '@ids-group-ltd/ids-design-system/components';
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
 * The consumer keeps the POLICY: each rule carries its own `test`, which has to mirror the server or the checklist lies.
 * This component owns the rendering: tri-state glyph, met and failed colours, type scale.
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
  protected readonly intl = inject(DS_INTL);
  /** The password being typed. */
  readonly value = input<string>('');
  /** The rule set, in the order it should read. */
  readonly rules = input<readonly DsPasswordRule[]>([]);
  /**
   * Whether an unmet rule may read as FAILED. Bind it to "the user has tried to submit": before that an unmet rule is only pending,
   * so a half-typed password is not scolded.
   */
  readonly showUnmet = input(false, { transform: booleanAttribute });
  /** Lays the rows out in two columns, for a checklist beside a wide form. */
  readonly columns = input<1 | 2>(1);

  /**
   * Id put on the rule list, for the field's `aria-describedby`. Defaults to a generated one; set it explicitly so both sides
   * can name the same string without threading a template ref between siblings.
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

      // The glyph is a decorative SVG with no accessible name; without this a screen reader hears the rule text but not whether it passed.
      return {
        label: rule.label,
        state,
        icon,
        announced: this.intl().passwordRules[state],
      };
    });
  });

  /** How many rules pass - for a host that wants to gate its own submit. */
  readonly metCount = computed(
    () => this.rows().filter((row) => row.state === 'met').length,
  );

  /** True when every rule passes. */
  readonly allMet = computed(() =>
    passwordRulesMet(this.value(), this.rules()),
  );
}
