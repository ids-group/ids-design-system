import type { Meta, StoryObj } from '@storybook/angular';
import { CardComponent } from './card.component';

const meta: Meta<CardComponent> = {
  title: 'Components/Card',
  component: CardComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `### Tokens
- \`--ds-card-bg\` — default \`var(--surface-default)\`
- \`--ds-card-border\` — default \`var(--border-divider)\`
- \`--ds-card-radius\` — default \`var(--r-lg)\`
- \`--ds-card-pad\` — default \`var(--s-6)\`
- \`--ds-card-shadow\` — default \`none\` (flat)
- \`--ds-card-shadow-hover\` — default \`var(--z100)\`
- \`--ds-card-focus-shadow\` — default \`var(--focus-ring)\`
- \`--ds-card-hover-lift\` — default \`var(--card-hover-lift)\``,
      },
    },
  },
  argTypes: {
    elevation: { control: 'select', options: ['flat', 'raised', 'hover', 'interactive'] },
    padding: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: { elevation: 'flat', padding: 'md' },
};
export default meta;
type Story = StoryObj<CardComponent>;

export const Flat: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ds-card [elevation]="elevation" [padding]="padding">
        <h3 class="t-h5" style="margin: 0 0 var(--s-2)">Card title</h3>
        <p class="t-m" style="margin: 0; color: var(--text-secondary)">
          Card body content lives inside ng-content.
        </p>
      </ds-card>
    `,
  }),
};

export const Raised: Story = { ...Flat, args: { elevation: 'raised', padding: 'md' } };
export const Hover: Story = { ...Flat, args: { elevation: 'hover', padding: 'md' } };
export const Interactive: Story = { ...Flat, args: { elevation: 'interactive', padding: 'md' } };
export const PadSm: Story = { ...Flat, args: { elevation: 'flat', padding: 'sm' } };
export const PadLg: Story = { ...Flat, args: { elevation: 'flat', padding: 'lg' } };
