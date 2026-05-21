import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { AvatarComponent } from './avatar.component';
import { AvatarGroupComponent } from '../avatar-group/avatar-group.component';

const meta: Meta<AvatarComponent> = {
  title: 'Components/Avatar',
  component: AvatarComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `### Tokens
- \`--ds-avatar-size\` — default \`var(--avatar-md)\`
- \`--ds-avatar-bg\` — default \`var(--brand-muted)\` — surface fill
- \`--ds-avatar-fg\` — default \`var(--brand-strong)\` — initials colour
- \`--ds-avatar-radius\` — default \`var(--r-pill)\`
- \`--ds-avatar-ring-color\` — default \`var(--surface-default)\` (used in group)
- \`--ds-avatar-ring-width\` — default \`var(--avatar-bw-group)\``,
      },
    },
  },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    initials: { control: 'text' },
    imageUrl: { control: 'text' },
  },
  args: { size: 'md', initials: 'AB', imageUrl: null },
};
export default meta;
type Story = StoryObj<AvatarComponent>;

export const Initials: Story = {
  render: (args) => ({
    props: args,
    template: `<ds-avatar [size]="size" [initials]="initials" [imageUrl]="imageUrl"></ds-avatar>`,
  }),
};

export const WithImage: Story = {
  render: (args) => ({
    props: args,
    template: `<ds-avatar size="md" imageUrl="https://i.pravatar.cc/100"></ds-avatar>`,
  }),
};

export const XSmall: Story = { ...Initials, args: { size: 'xs', initials: 'AB' } };
export const Small: Story = { ...Initials, args: { size: 'sm', initials: 'AB' } };
export const Medium: Story = { ...Initials, args: { size: 'md', initials: 'AB' } };
export const Large: Story = { ...Initials, args: { size: 'lg', initials: 'AB' } };

// Composition example matching JSX showcase: all sizes inline
export const AllSizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap:16px; align-items:center;">
        <ds-avatar size="xs" initials="AB"></ds-avatar>
        <ds-avatar size="sm" initials="AB"></ds-avatar>
        <ds-avatar size="md" initials="AB"></ds-avatar>
        <ds-avatar size="lg" initials="AB"></ds-avatar>
      </div>
    `,
  }),
};

// Group composition — uses the AvatarGroupComponent so encapsulated styles apply.
export const Group: Story = {
  decorators: [moduleMetadata({ imports: [AvatarGroupComponent] })],
  render: () => ({
    template: `
      <ds-avatar-group>
        <ds-avatar initials="AB"></ds-avatar>
        <ds-avatar initials="JR"></ds-avatar>
        <ds-avatar initials="SK"></ds-avatar>
        <ds-avatar initials="MR"></ds-avatar>
      </ds-avatar-group>
    `,
  }),
};
