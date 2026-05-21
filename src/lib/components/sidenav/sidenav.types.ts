export interface SidenavItemModel {
  id: string;
  label: string;
  href?: string;
  active?: boolean;
  badge?: number | null;
  hasAlert?: boolean;
}
