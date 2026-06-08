import type { Meta, StoryObj } from '@storybook/angular';
import { SelectComponent } from './select.component';
import type { SelectItem } from './select.types';

const PRODUCTS = [
  { label: 'All Products', value: '' },
  { label: 'Hospital Indemnity', value: 'hi' },
  { label: 'Critical Illness', value: 'ci' },
  { label: 'Accident', value: 'acc' },
  { label: 'Life Insurance', value: 'life' },
];

const GROUPED_AUDIENCE: SelectItem[] = [
  {
    label: 'Whole population',
    options: [{ label: 'All customers', value: 'all' }],
  },
  {
    label: 'Customer state',
    options: [
      { label: 'Convert & recommend', value: 'convert-recommend' },
      { label: 'Reduced coverage', value: 'reduced-coverage' },
      { label: 'Empty nesters', value: 'empty-nesters' },
      { label: 'Disengage', value: 'disengage' },
    ],
  },
  {
    label: 'Temporal',
    options: [{ label: 'Renewing within 9 months', value: 'renewing-9m' }],
  },
  {
    label: 'Other',
    options: [{ label: 'Custom segment (mocked)', value: 'custom' }],
  },
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
- \`--ds-input-border-focus\` — default \`var(--primary)\`
- \`--ds-input-fg\` — default \`var(--text-primary)\`
- \`--ds-input-radius\` — default \`var(--r-md)\`
- \`--ds-input-focus-shadow\` — default \`var(--focus-field)\`
- \`--ds-input-border-error\` — default \`var(--error)\`
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
export const WithGroups: Story = {
  args: { ...Default.args, options: GROUPED_AUDIENCE, placeholder: 'Choose a segment…', value: 'all' },
  render: (args) => ({
    props: args,
    template: `<div style="max-width:320px"><ds-select label="Filter preset" [(value)]="value" [options]="options" [placeholder]="placeholder"></ds-select></div>`,
  }),
};
