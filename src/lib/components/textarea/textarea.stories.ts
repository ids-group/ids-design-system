import type { Meta, StoryObj } from '@storybook/angular';
import { TextareaComponent } from './textarea.component';

const meta: Meta<TextareaComponent> = {
  title: 'Components/Textarea',
  component: TextareaComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `Multiline text input. Mirrors \`<ds-input>\` API and reuses the same \`--ds-input-*\` token family so consumers can override via identical custom properties.

### Tokens
- \`--ds-input-bg\` — default \`var(--surface-default)\`
- \`--ds-input-border\` — default \`var(--border-default)\`
- \`--ds-input-border-hover\` — default \`var(--border-strong)\`
- \`--ds-input-border-focus\` — default \`var(--primary)\`
- \`--ds-input-fg\` — default \`var(--text-primary)\`
- \`--ds-input-placeholder\` — default \`var(--text-tertiary)\`
- \`--ds-input-radius\` — default \`var(--r-md)\`
- \`--ds-input-pad-x\` — default \`var(--field-pad-x)\`
- \`--ds-input-pad-y\` — default \`var(--field-pad-y)\`
- \`--ds-input-focus-shadow\` — default \`var(--focus-field)\`
- \`--ds-input-border-error\` — default \`var(--error)\`
- \`--ds-input-bg-error\` — default \`var(--error-subtle)\`
- \`--ds-input-border-success\` — default \`var(--success)\`
- \`--ds-input-bg-disabled\` — default \`var(--surface-disabled)\`
- \`--field-textarea-rows-min\` — default \`60px\` (governs min-height of the inner textarea)`,
      },
    },
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    rows: { control: 'number' },
  },
  args: {
    size: 'md', placeholder: 'Enter text',
    invalid: false, disabled: false, value: '',
    label: '', hint: '', required: false, name: null, rows: 3,
  },
};
export default meta;
type Story = StoryObj<TextareaComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<div style="max-width:480px"><ds-textarea [(value)]="value" [size]="size" [rows]="rows" [placeholder]="placeholder" [disabled]="disabled" [invalid]="invalid"></ds-textarea></div>`,
  }),
};
export const Small: Story = { ...Default, args: { ...Default.args, size: 'sm' } };
export const Large: Story = { ...Default, args: { ...Default.args, size: 'lg' } };
export const Invalid: Story = { ...Default, args: { ...Default.args, invalid: true, value: 'too short', hint: 'Please provide at least 50 characters' } };
export const Disabled: Story = { ...Default, args: { ...Default.args, disabled: true, value: 'cannot edit' } };
export const WithLabel: Story = {
  render: (args) => ({
    props: args,
    template: `<div style="max-width:480px"><ds-textarea label="Description" hint="Markdown supported" placeholder="Describe the event…" [rows]="4"></ds-textarea></div>`,
  }),
};
