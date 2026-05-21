import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button.component';

const meta: Meta<ButtonComponent> = {
  title: 'Components/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `### Tokens
- \`--ds-button-bg\` — default \`var(--brand)\` — surface fill
- \`--ds-button-bg-hover\` — default \`var(--brand-hover)\`
- \`--ds-button-bg-active\` — default \`var(--brand-pressed)\`
- \`--ds-button-fg\` — default \`var(--brand-on)\`
- \`--ds-button-border\` — default \`transparent\`
- \`--ds-button-bg-disabled\` — default \`var(--surface-disabled)\`
- \`--ds-button-fg-disabled\` — default \`var(--text-disabled)\`
- \`--ds-button-radius\` — default \`var(--r-md)\`
- \`--ds-button-focus-shadow\` — default \`var(--focus-ring)\`
Variant modifiers (\`.secondary/.tertiary/.ghost/.danger/.link\`) only re-set \`--ds-button-bg*\` and \`--ds-button-fg\`.`,
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'tertiary', 'ghost', 'danger', 'link'] },
    size: { control: 'select', options: ['s', 'm', 'l'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  args: { variant: 'primary', size: 'l', disabled: false, loading: false },
};
export default meta;
type Story = StoryObj<ButtonComponent>;

export const Primary: Story = {
  render: (args) => ({
    props: args,
    template: `<ds-button [variant]="variant" [size]="size" [disabled]="disabled" [loading]="loading">Primary action</ds-button>`,
  }),
};
export const Secondary: Story = { ...Primary, args: { variant: 'secondary' } };
export const Tertiary: Story = { ...Primary, args: { variant: 'tertiary' } };
export const Ghost: Story = { ...Primary, args: { variant: 'ghost' } };
export const Danger: Story = { ...Primary, args: { variant: 'danger' } };
export const LinkVariant: Story = { ...Primary, args: { variant: 'link' } };
export const Small: Story = { ...Primary, args: { size: 's' } };
export const Medium: Story = { ...Primary, args: { size: 'm' } };
export const Loading: Story = { ...Primary, args: { loading: true } };
export const Disabled: Story = { ...Primary, args: { disabled: true } };
