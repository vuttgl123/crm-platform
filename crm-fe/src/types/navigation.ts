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

export type NavigationAccessRule =
  | { kind: 'authenticated' }
  | { kind: 'permission'; code: string }
  | { kind: 'tenant-admin' }
  | { kind: 'any-permission'; codes: readonly string[] };

export interface AppRouteManifestItem {
  id: string;
  titleKey: string;
  path: string;
  matchPatterns: readonly string[];
  iconName: string;
  access: NavigationAccessRule;
  groupId?: SchemaModuleGroup;
  showInSidebar: boolean;
  showInCommandPalette: boolean;
  order: number;
}

export interface NavigationGroupDefinition {
  id: SchemaModuleGroup;
  titleKey: string;
  order: number;
}

export interface AuthorizedNavigationGroup extends NavigationGroupDefinition {
  items: AppRouteManifestItem[];
}
