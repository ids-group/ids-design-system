import type { Meta, StoryObj } from '@storybook/angular';
import { StatusDotComponent } from './status-dot.component';

const meta: Meta<StatusDotComponent> = {
  title: 'Components/StatusDot',
  component: StatusDotComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `### Tokens
- \`--ds-statusdot-size\` — default \`var(--status-dot-size)\`
- \`--ds-statusdot-color\` — default \`var(--icon-muted)\` (planning)
Severity classes (\`.confirmed/.active/.completed/.warning/.error\`) only override \`--ds-statusdot-color\`.`,
      },
    },
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['planning', 'confirmed', 'active', 'completed', 'warning', 'error'],
    },
  },
  args: { status: 'planning' },
};
export default meta;
type Story = StoryObj<StatusDotComponent>;

export const Planning: Story = {
  render: (args) => ({
    props: args,
    template: `<ds-status-dot [status]="status"></ds-status-dot>`,
  }),
};
export const Confirmed: Story = { ...Planning, args: { status: 'confirmed' } };
export const Active: Story = { ...Planning, args: { status: 'active' } };
export const Completed: Story = { ...Planning, args: { status: 'completed' } };
export const Warning: Story = { ...Planning, args: { status: 'warning' } };
export const Error: Story = { ...Planning, args: { status: 'error' } };

// Composition example matching the JSX showcase: dot + label inline-flex
export const WithLabel: Story = {
  render: (args) => ({
    props: args,
    template: `
      <span style="display:inline-flex; align-items:center; gap:8px;">
        <ds-status-dot [status]="status"></ds-status-dot>
        Active
      </span>
    `,
  }),
  args: { status: 'active' },
};
