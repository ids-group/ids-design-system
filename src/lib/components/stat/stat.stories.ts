import type { Meta, StoryObj } from '@storybook/angular';
import { StatComponent } from './stat.component';

const meta: Meta<StatComponent> = {
  title: 'Components/Stat',
  component: StatComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `### Tokens
- \`--ds-stat-bg\` — default \`var(--surface-default)\`
- \`--ds-stat-border\` — default \`var(--border-divider)\`
- \`--ds-stat-radius\` — default \`var(--r-lg)\`
- \`--ds-stat-pad\` — default \`var(--s-5)\`
- \`--ds-stat-label-color\` — default \`var(--text-tertiary)\`
- \`--ds-stat-value-color\` — default \`var(--text-primary)\`
- \`--ds-stat-up-color\` — default \`var(--success-text)\`
- \`--ds-stat-down-color\` — default \`var(--error-text)\``,
      },
    },
  },
  args: { label: 'Active rules', value: 12, delta: null, unit: '' },
};
export default meta;
type Story = StoryObj<StatComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<ds-stat [label]="label" [value]="value" [unit]="unit" [delta]="delta"></ds-stat>`,
  }),
};
export const Up: Story = { ...Default, args: { label: 'Active rules', value: 12, delta: 15, unit: '' } };
export const Down: Story = { ...Default, args: { label: 'Active rules', value: 8, delta: -3, unit: '' } };
export const Percent: Story = { ...Default, args: { label: 'Conversion', value: 15, delta: 2, unit: '%' } };
