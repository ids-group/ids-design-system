export type DsToastHorizontalPosition = 'left' | 'center' | 'right';
export type DsToastVerticalPosition = 'top' | 'bottom';

export interface DsToastPosition {
  readonly horizontalPosition: DsToastHorizontalPosition;
  readonly verticalPosition: DsToastVerticalPosition;
  readonly offset: string;
}
