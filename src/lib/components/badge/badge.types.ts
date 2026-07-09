export type BadgeLifecycle = 'planning' | 'confirmed' | 'active' | 'completed';
export type BadgeSemantic =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral';
export type BadgeVariant = BadgeLifecycle | BadgeSemantic | 'solid';
