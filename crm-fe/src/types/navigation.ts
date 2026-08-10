export type SchemaModuleGroup =
  | 'crm'
  | 'catalog'
  | 'sales'
  | 'marketing'
  | 'service'
  | 'privacy'
  | 'integration'
  | 'audit'
  | 'platform';

export interface NavigationItem {
  id: string;
  moduleGroup: SchemaModuleGroup;
  titleVi: string;
  titleEn: string;
  path: string;
  iconName: string;
  requiredPermission?: string;
  requiresTenantAdmin?: boolean;
  requiresAnyCrmReadPermission?: boolean;
  children?: NavigationItem[];
}

export interface NavigationGroup {
  id: SchemaModuleGroup;
  titleVi: string;
  titleEn: string;
  items: NavigationItem[];
}
