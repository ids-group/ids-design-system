import { avatarTint, type AvatarTintOptions } from '@ids-group-ltd/ids-design-system';

// @ts-expect-error after TS2353
export const inline = avatarTint('Ann', { chroma: 0.1 });

const chromaAlone = { chroma: 0.1 };
// @ts-expect-error after TS2559
export const prebuiltAlone = avatarTint('Ann', chromaAlone);

const chromaBesideLightness = { chroma: 0.1, lightness: 50 };
export const prebuiltWithAnother = avatarTint('Ann', chromaBesideLightness);

export const typed: AvatarTintOptions = { lightness: 50 };
