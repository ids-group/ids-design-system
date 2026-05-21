import type { Meta, StoryObj } from '@storybook/angular';
import { DropzoneComponent } from './dropzone.component';
import type { DropzoneFile } from './dropzone.types';

const meta: Meta<DropzoneComponent> = {
  title: 'Components/Dropzone',
  component: DropzoneComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `### Tokens
- \`--ds-dropzone-bg\` — default \`var(--surface-default)\`
- \`--ds-dropzone-bg-hover\` — default \`var(--brand-subtle)\`
- \`--ds-dropzone-bg-active\` — default \`var(--brand-subtle)\`
- \`--ds-dropzone-border\` — default \`var(--border-default)\`
- \`--ds-dropzone-border-hover\` — default \`var(--brand)\`
- \`--ds-dropzone-border-active\` — default \`var(--brand)\`
- \`--ds-dropzone-fg\` — default \`var(--text-secondary)\`
- \`--ds-dropzone-fg-active\` — default \`var(--brand-strong)\`
- \`--ds-dropzone-radius\` — default \`var(--r-lg)\`
- \`--ds-dropzone-file-progress\` — default \`var(--brand)\`
- \`--ds-dropzone-file-success\` — default \`var(--success)\`
- \`--ds-dropzone-file-error\` — default \`var(--danger)\``,
      },
    },
  },
  argTypes: {
    multiple: { control: 'boolean' },
    accept: { control: 'text' },
  },
  args: { multiple: true, accept: '' },
};
export default meta;
type Story = StoryObj<DropzoneComponent>;

export const Empty: Story = {
  render: (args) => ({
    props: { ...args, files: [] as DropzoneFile[] },
    template: `<ds-dropzone [multiple]="multiple" [accept]="accept" [files]="files"></ds-dropzone>`,
  }),
};

export const WithFiles: Story = {
  render: (args) => ({
    props: {
      ...args,
      files: [
        { id: '1', name: 'policy-schedule.pdf', size: 245_312, state: 'success', progress: 100 },
        { id: '2', name: 'evidence-photo.jpg', size: 1_842_944, state: 'uploading', progress: 62 },
        { id: '3', name: 'corrupt-archive.zip', size: 9_120_000, state: 'error', progress: 0 },
      ] as DropzoneFile[],
    },
    template: `<ds-dropzone [multiple]="multiple" [accept]="accept" [files]="files"></ds-dropzone>`,
  }),
};
