import type { Meta, StoryObj } from '@storybook/angular';
import { InputComponent } from './input.component';

const meta: Meta<InputComponent> = {
  title: 'Components/Input',
  component: InputComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `### Tokens
- \`--ds-input-bg\` — default \`var(--surface-default)\`
- \`--ds-input-border\` — default \`var(--border-default)\`
- \`--ds-input-border-hover\` — default \`var(--border-strong)\`
- \`--ds-input-border-focus\` — default \`var(--brand)\`
- \`--ds-input-fg\` — default \`var(--text-primary)\`
- \`--ds-input-placeholder\` — default \`var(--text-tertiary)\`
- \`--ds-input-radius\` — default \`var(--r-md)\`
- \`--ds-input-pad-x\` — default \`var(--field-pad-x)\`
- \`--ds-input-pad-y\` — default \`var(--field-pad-y)\`
- \`--ds-input-focus-shadow\` — default \`var(--focus-field)\`
- \`--ds-input-border-error\` — default \`var(--danger)\`
- \`--ds-input-bg-error\` — default \`var(--danger-subtle)\`
- \`--ds-input-border-success\` — default \`var(--success)\`
- \`--ds-input-bg-disabled\` — default \`var(--surface-disabled)\``,
      },
    },
  },
  argTypes: {
    type: { control: 'select', options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    type: 'text', size: 'md', placeholder: 'Enter text',
    invalid: false, disabled: false, value: '',
    label: '', hint: '', required: false, name: null,
  },
};
export default meta;
type Story = StoryObj<InputComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<div style="max-width:360px"><ds-input [(value)]="value" [type]="type" [size]="size" [placeholder]="placeholder" [disabled]="disabled" [invalid]="invalid"></ds-input></div>`,
  }),
};
export const Small: Story = { ...Default, args: { ...Default.args, size: 'sm' } };
export const Large: Story = { ...Default, args: { ...Default.args, size: 'lg' } };
export const Invalid: Story = { ...Default, args: { ...Default.args, invalid: true, value: 'bad@', hint: 'Email is invalid' } };
export const Disabled: Story = { ...Default, args: { ...Default.args, disabled: true, value: 'cannot edit' } };
export const Password: Story = { ...Default, args: { ...Default.args, type: 'password', placeholder: 'Password', value: 'secret' } };
export const WithLabel: Story = {
  render: (args) => ({
    props: args,
    template: `<div style="max-width:360px"><ds-input label="Email" hint="We never share your email" placeholder="you@company.com"></ds-input></div>`,
  }),
};
