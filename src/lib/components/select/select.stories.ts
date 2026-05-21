import type { Meta, StoryObj } from '@storybook/angular';
import { SelectComponent } from './select.component';

const PRODUCTS = [
  { label: 'All Products', value: '' },
  { label: 'Hospital Indemnity', value: 'hi' },
  { label: 'Critical Illness', value: 'ci' },
  { label: 'Accident', value: 'acc' },
  { label: 'Life Insurance', value: 'life' },
];

const meta: Meta<SelectComponent> = {
  title: 'Components/Select',
  component: SelectComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `### Tokens
Mirrors the input field — \`--ds-select-*\` defaults to the matching \`--ds-input-*\`:
- \`--ds-input-bg\` — default \`var(--surface-default)\`
- \`--ds-input-border\` — default \`var(--border-default)\`
- \`--ds-input-border-hover\` — default \`var(--border-strong)\`
- \`--ds-input-border-focus\` — default \`var(--brand)\`
- \`--ds-input-fg\` — default \`var(--text-primary)\`
- \`--ds-input-radius\` — default \`var(--r-md)\`
- \`--ds-input-focus-shadow\` — default \`var(--focus-field)\`
- \`--ds-input-border-error\` — default \`var(--danger)\`
- \`--ds-input-border-success\` — default \`var(--success)\`
- \`--ds-input-bg-disabled\` — default \`var(--surface-disabled)\``,
      },
    },
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  args: { size: 'md', value: '', placeholder: '', label: '', disabled: false, invalid: false, name: null, options: PRODUCTS },
};
export default meta;
type Story = StoryObj<SelectComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<div style="max-width:280px"><ds-select [(value)]="value" [options]="options" [size]="size" [placeholder]="placeholder" [disabled]="disabled" [invalid]="invalid"></ds-select></div>`,
  }),
};
export const WithPlaceholder: Story = { ...Default, args: { ...Default.args, placeholder: 'Choose a product…', value: '' } };
export const Small: Story = { ...Default, args: { ...Default.args, size: 'sm' } };
export const Large: Story = { ...Default, args: { ...Default.args, size: 'lg' } };
export const Disabled: Story = { ...Default, args: { ...Default.args, disabled: true, value: 'hi' } };
export const Invalid: Story = { ...Default, args: { ...Default.args, invalid: true } };
export const WithLabel: Story = {
  render: (args) => ({
    props: args,
    template: `<div style="max-width:280px"><ds-select label="Product" [options]="options" placeholder="Choose one…"></ds-select></div>`,
  }),
};
