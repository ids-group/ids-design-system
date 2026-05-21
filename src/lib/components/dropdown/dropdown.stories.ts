import type { Meta, StoryObj } from '@storybook/angular';
import { DropdownComponent } from './dropdown.component';

const PRODUCTS = [
  { label: 'All Products', value: 'all' },
  { label: 'Hospital Indemnity', value: 'hi' },
  { label: 'Critical Illness', value: 'ci' },
  { label: 'Accident', value: 'acc' },
  { label: 'Life Insurance', value: 'life' },
];

const PRODUCTS_WITH_ICONS = [
  { label: 'All Products', value: 'all', icon: 'list' as const },
  { label: 'Hospital Indemnity', value: 'hi', icon: 'home' as const },
  { label: 'Critical Illness', value: 'ci', icon: 'error' as const },
  { label: 'Accident', value: 'acc', icon: 'truck' as const },
  { label: 'Life Insurance', value: 'life', icon: 'star' as const },
];

const REGIONS = [
  { label: 'North America — East', value: 'na-e' },
  { label: 'North America — West', value: 'na-w' },
  { label: 'South America — Andean', value: 'sa-a' },
  { label: 'South America — Southern Cone', value: 'sa-s' },
  { label: 'Europe — Northern', value: 'eu-n' },
  { label: 'Europe — Western', value: 'eu-w' },
  { label: 'Europe — Central', value: 'eu-c' },
  { label: 'Europe — Southern', value: 'eu-s' },
  { label: 'Middle East & North Africa', value: 'mena' },
  { label: 'Sub-Saharan Africa', value: 'ssa' },
  { label: 'Asia — South', value: 'as-s' },
  { label: 'Asia — Southeast', value: 'as-se' },
  { label: 'Asia — East', value: 'as-e' },
  { label: 'Oceania', value: 'oc' },
  { label: 'Antarctica (research only)', value: 'ant' },
];

const meta: Meta<DropdownComponent> = {
  title: 'Components/Dropdown',
  component: DropdownComponent,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
  },
  args: {
    size: 'md',
    value: '',
    placeholder: 'Select…',
    label: '',
    disabled: false,
    error: false,
    name: null,
    options: PRODUCTS,
  },
};
export default meta;
type Story = StoryObj<DropdownComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<div style="max-width:280px"><ds-dropdown [(value)]="value" [options]="options" [size]="size" [placeholder]="placeholder" [disabled]="disabled" [error]="error"></ds-dropdown></div>`,
  }),
};
export const WithPlaceholder: Story = { ...Default, args: { ...Default.args, placeholder: 'Choose a product…', value: '' } };
export const Small: Story = { ...Default, args: { ...Default.args, size: 'sm' } };
export const Large: Story = { ...Default, args: { ...Default.args, size: 'lg' } };
export const Disabled: Story = { ...Default, args: { ...Default.args, disabled: true, value: 'hi' } };
export const ErrorState: Story = { ...Default, args: { ...Default.args, error: true } };
export const WithLabel: Story = {
  render: (args) => ({
    props: args,
    template: `<div style="max-width:280px"><ds-dropdown label="Product" [options]="options" placeholder="Choose one…"></ds-dropdown></div>`,
  }),
};
export const WithIcons: Story = {
  args: { ...Default.args, options: PRODUCTS_WITH_ICONS, placeholder: 'Choose a product…' },
  render: (args) => ({
    props: args,
    template: `<div style="max-width:280px"><ds-dropdown [(value)]="value" [options]="options" placeholder="Choose a product…"></ds-dropdown></div>`,
  }),
};
export const LongList: Story = {
  args: { ...Default.args, options: REGIONS, placeholder: 'Pick a region…' },
  render: (args) => ({
    props: args,
    template: `<div style="max-width:280px"><ds-dropdown [(value)]="value" [options]="options" placeholder="Pick a region…"></ds-dropdown></div>`,
  }),
};
