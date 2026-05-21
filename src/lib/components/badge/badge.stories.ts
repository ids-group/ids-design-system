import type { Meta, StoryObj } from '@storybook/angular';
import { BadgeComponent } from './badge.component';

const meta: Meta<BadgeComponent> = {
  title: 'Components/Badge',
  component: BadgeComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `### Tokens
- \`--ds-badge-bg\` — default \`var(--surface-secondary)\` — surface fill
- \`--ds-badge-fg\` — default \`var(--text-secondary)\` — label colour
- \`--ds-badge-radius\` — default \`var(--r-pill)\`
- \`--ds-badge-pad-x\` — default \`var(--badge-pad-x)\`
- \`--ds-badge-pad-y\` — default \`var(--badge-pad-y)\`
- \`--ds-badge-font-weight\` — default \`var(--fw-bold)\`
Lifecycle/semantic modifiers (\`.planning\`, \`.success\`, etc.) override \`--ds-badge-bg\` and \`--ds-badge-fg\`.`,
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['planning', 'confirmed', 'active', 'completed', 'info', 'success', 'warning', 'error', 'neutral', 'count'] },
    withDot: { control: 'boolean' },
    solid: { control: 'boolean' },
  },
  args: { variant: 'neutral', withDot: false, solid: false },
};
export default meta;
type Story = StoryObj<BadgeComponent>;

export const Neutral: Story = {
  render: (args) => ({
    props: args,
    template: `<ds-badge [variant]="variant" [withDot]="withDot" [solid]="solid">Label</ds-badge>`,
  }),
};

// Lifecycle variants
export const Planning: Story = { ...Neutral, args: { variant: 'planning' } };
export const Confirmed: Story = { ...Neutral, args: { variant: 'confirmed' } };
export const Active: Story = { ...Neutral, args: { variant: 'active' } };
export const Completed: Story = { ...Neutral, args: { variant: 'completed' } };

// Semantic variants
export const Info: Story = { ...Neutral, args: { variant: 'info' } };
export const Success: Story = { ...Neutral, args: { variant: 'success' } };
export const Warning: Story = { ...Neutral, args: { variant: 'warning' } };
export const Error: Story = { ...Neutral, args: { variant: 'error' } };

// Style modifiers
export const Solid: Story = { ...Neutral, args: { variant: 'success', solid: true } };
export const WithDot: Story = { ...Neutral, args: { variant: 'active', withDot: true } };
export const Count: Story = {
  render: (args) => ({
    props: args,
    template: `<ds-badge variant="count">12</ds-badge>`,
  }),
};

// Per-instance tone — consumers override --ds-badge-bg / --ds-badge-fg inline
// for off-token tones (e.g. carrier-branded pills). Prefer semantic variants for
// design-system tones.
export const CustomTone: Story = {
  render: () => ({
    template: `
      <div style="display:inline-flex; gap:8px;">
        <ds-badge [style.--ds-badge-bg]="'#FFE6E3'" [style.--ds-badge-fg]="'#B4453C'">Aflac</ds-badge>
        <ds-badge [style.--ds-badge-bg]="'#E3F0FF'" [style.--ds-badge-fg]="'#1E5BB8'">Guardian</ds-badge>
        <ds-badge [style.--ds-badge-bg]="'#EAEAFD'" [style.--ds-badge-fg]="'#4A4DBE'">Assurity</ds-badge>
      </div>
    `,
  }),
};
