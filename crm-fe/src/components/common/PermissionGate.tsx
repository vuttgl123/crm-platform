import React, { useMemo } from 'react';
import { useAuth } from '@/core/session/useAuth';
import { canAccessRule } from '@/core/permissions/evaluator';
import { NavigationAccessRule } from '@/types/navigation';
import { CRM_READ_PERMISSIONS } from '@/core/permissions/constants';

interface PermissionGateProps {
  permission?: string;
  requiresTenantAdmin?: boolean;
  requiresAnyCrmReadPermission?: boolean;
  fallback?: React.ReactNode;
  mode?: 'hide' | 'disable';
  children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  requiresTenantAdmin,
  requiresAnyCrmReadPermission,
  fallback = null,
  mode = 'hide',
  children,
}) => {
  const { session } = useAuth();

  const rule: NavigationAccessRule = useMemo(() => {
    if (requiresTenantAdmin) {
      return { kind: 'tenant-admin' };
    }
    if (requiresAnyCrmReadPermission) {
      return { kind: 'any-permission', codes: CRM_READ_PERMISSIONS };
    }
    if (permission) {
      return { kind: 'permission', code: permission };
    }
    return { kind: 'authenticated' };
  }, [requiresTenantAdmin, requiresAnyCrmReadPermission, permission]);

  const hasAccess = canAccessRule(rule, session);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (mode === 'disable' && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ disabled?: boolean; className?: string }>, {
      disabled: true,
      className: `${(children.props as { className?: string }).className || ''} opacity-50 pointer-events-none`,
    });
  }

  return <>{fallback}</>;
};
