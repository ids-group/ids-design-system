import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { EmptyStateComponent } from './empty-state.component';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../../icons/icon.component';

const meta: Meta<EmptyStateComponent> = {
  title: 'Components/EmptyState',
  component: EmptyStateComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({ imports: [ButtonComponent, IconComponent] }),
  ],
  parameters: {
    docs: {
      description: {
        component: `### Tokens
- \`--ds-empty-state-tile-bg\` — default \`var(--surface-secondary)\`
- \`--ds-empty-state-tile-fg\` — default \`var(--icon-default)\`
- \`--ds-empty-state-title-fg\` — default \`var(--text-primary)\`
- \`--ds-empty-state-body-fg\` — default \`var(--text-secondary)\`
- \`--ds-empty-state-body-maxw\` — default \`var(--empty-body-maxw)\`
Variants (\`.error / .locked\`) re-tint the icon tile background and foreground.
\`.loading\` adds a translucent white scrim with blur + brand-coloured spinner.`,
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['none', 'loading', 'error', 'locked'] },
    title: { control: 'text' },
    body: { control: 'text' },
  },
  args: {
    variant: 'none',
    title: 'No asset allocated yet',
    body: 'Pick from the asset register to start building this Sub-record.',
  },
};
export default meta;
type Story = StoryObj<EmptyStateComponent>;

const renderWithCta: Story['render'] = (args) => ({
  props: args,
  template: `
    <ds-empty-state [variant]="variant" [title]="title" [body]="body">
      <ds-button actions variant="primary" size="m">
        <ds-icon name="plus" [size]="14" /> Allocate resources
      </ds-button>
    </ds-empty-state>
  `,
});

export const None: Story = { render: renderWithCta };

export const Loading: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ds-empty-state [variant]="variant" [title]="title" [body]="body"></ds-empty-state>
    `,
  }),
  args: {
    variant: 'loading',
    title: '12 asset lines',
    body: 'LED walls · Sub bass stacks · …',
  },
};

export const Error: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ds-empty-state [variant]="variant" [title]="title" [body]="body">
        <ds-button actions variant="primary" size="m">
          <ds-icon name="rotate" [size]="14" /> Retry
        </ds-button>
        <ds-button actions variant="outline" size="m">Report issue</ds-button>
      </ds-empty-state>
    `,
  }),
  args: {
    variant: 'error',
    title: "Couldn't load resource allocations",
    body: 'Network error — the request timed out after 30 seconds.',
  },
};

export const Locked: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ds-empty-state [variant]="variant" [title]="title" [body]="body">
        <ds-button actions variant="outline" size="m">Back to dashboard</ds-button>
        <ds-button actions variant="outline" size="m">Request access</ds-button>
      </ds-empty-state>
    `,
  }),
  args: {
    variant: 'locked',
    title: "You don't have access to this Logistics plan",
    body: 'Logistics plans are restricted to Logistics and Producer roles. Ask Alex Park or your team lead.',
  },
};
