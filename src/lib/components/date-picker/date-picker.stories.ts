import type { Meta, StoryObj } from '@storybook/angular';
import { DatePickerComponent } from './date-picker.component';

const meta: Meta<DatePickerComponent> = {
  title: 'Components/DatePicker',
  component: DatePickerComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `### Tokens
- \`--ds-datepicker-bg\` — default \`var(--surface-overlay)\`
- \`--ds-datepicker-border\` — default \`var(--border-default)\`
- \`--ds-datepicker-shadow\` — default \`var(--shadow-popover)\`
- \`--ds-datepicker-day-hover-bg\` — default \`var(--surface-secondary)\`
- \`--ds-datepicker-day-today-fg\` — default \`var(--brand)\`
- \`--ds-datepicker-day-selected-bg\` — default \`var(--brand)\`
- \`--ds-datepicker-day-selected-fg\` — default \`var(--brand-on)\`
- \`--ds-datepicker-day-range-bg\` — default \`var(--brand-subtle)\`
- \`--ds-datepicker-day-range-fg\` — default \`var(--brand-strong)\`
- \`--ds-datepicker-day-disabled-fg\` — default \`var(--text-disabled)\`
- \`--ds-datepicker-width\` — default \`var(--datepicker-w)\``,
      },
    },
  },
  argTypes: {
    mode: { control: 'select', options: ['single', 'range'] },
  },
  args: { mode: 'single', placeholder: 'Select date' },
};
export default meta;
type Story = StoryObj<DatePickerComponent>;

export const Single: Story = {
  render: (args) => ({
    props: args,
    template: `<ds-date-picker [mode]="mode" [placeholder]="placeholder"></ds-date-picker>`,
  }),
};
export const Range: Story = { ...Single, args: { mode: 'range', placeholder: 'Select date range' } };
