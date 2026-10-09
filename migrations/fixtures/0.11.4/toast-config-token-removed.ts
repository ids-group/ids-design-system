// @ts-expect-error after TS2305
import { DS_TOAST_CONFIG } from '@ids-group-ltd/ids-design-system';

export const provider = { provide: DS_TOAST_CONFIG, useValue: { maxVisible: 5 } };
