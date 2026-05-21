import type { Meta, StoryObj } from '@storybook/angular';
import { AvatarGroupComponent } from './avatar-group.component';
import { AvatarComponent } from '../avatar/avatar.component';

const meta: Meta<AvatarGroupComponent> = {
  title: 'Components/AvatarGroup',
  component: AvatarGroupComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `### Tokens
- \`--ds-avatargroup-overlap\` — default \`calc(-1 * var(--s-2))\` — negative gap between avatars
- \`--ds-avatargroup-ring\` — default \`var(--surface-default)\` — outline that separates stacked avatars`,
      },
    },
  },
  decorators: [
    (story) => ({
      ...story(),
      moduleMetadata: { imports: [AvatarComponent] },
    }),
  ],
  args: { max: 4 },
};
export default meta;
type Story = StoryObj<AvatarGroupComponent>;

export const Three: Story = {
  render: () => ({
    template: `
      <ds-avatar-group>
        <ds-avatar initials="JS"></ds-avatar>
        <ds-avatar initials="AB"></ds-avatar>
        <ds-avatar initials="CD"></ds-avatar>
      </ds-avatar-group>
    `,
  }),
};

export const FiveWithOverflow: Story = {
  render: () => ({
    template: `
      <ds-avatar-group [total]="7">
        <ds-avatar initials="JS"></ds-avatar>
        <ds-avatar initials="AB"></ds-avatar>
        <ds-avatar initials="CD"></ds-avatar>
        <ds-avatar initials="EF"></ds-avatar>
      </ds-avatar-group>
    `,
  }),
};
