import { matchPath } from 'react-router-dom';
import { UserSessionContext } from '@/types/auth';
import { AppRouteManifestItem, AuthorizedNavigationGroup } from '@/types/navigation';
import { APP_ROUTE_MANIFEST, NAVIGATION_GROUP_DEFINITIONS } from '@/config/navigationConfig';
import { canAccessRule } from '../permissions/evaluator';

export function resolveAppRoute(pathname: string): AppRouteManifestItem | undefined {
  let fallbackMatch: AppRouteManifestItem | undefined;

  for (const item of APP_ROUTE_MANIFEST) {
    for (const pattern of item.matchPatterns) {
      const match = matchPath({ path: pattern, end: true }, pathname);
      if (match) {
        if (!pattern.includes(':')) {
          return item; // Exact static path wins immediately
        }
        fallbackMatch = item; // Dynamic path as fallback
      }
    }
  }

  return fallbackMatch;
}

export function getAuthorizedPrimaryNavigationItems(session: UserSessionContext | null): AppRouteManifestItem[] {
  return APP_ROUTE_MANIFEST
    .filter(item => !item.groupId && item.showInSidebar && canAccessRule(item.access, session))
    .sort((a, b) => a.order - b.order);
}

export function getAuthorizedNavigationGroups(session: UserSessionContext | null): AuthorizedNavigationGroup[] {
  return NAVIGATION_GROUP_DEFINITIONS
    .sort((a, b) => a.order - b.order)
    .map(group => {
      const items = APP_ROUTE_MANIFEST
        .filter(item => item.groupId === group.id && item.showInSidebar && canAccessRule(item.access, session))
        .sort((a, b) => a.order - b.order);
      return { ...group, items };
    })
    .filter(group => group.items.length > 0);
}

export function getAuthorizedCommandItems(session: UserSessionContext | null): AppRouteManifestItem[] {
  return APP_ROUTE_MANIFEST
    .filter(item => item.showInCommandPalette && canAccessRule(item.access, session))
    .sort((a, b) => a.order - b.order);
}
