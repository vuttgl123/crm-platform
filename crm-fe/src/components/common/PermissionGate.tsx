import React from 'react';
import { useAuth } from '@/core/session/useAuth';
import { can } from '@/core/permissions/evaluator';
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

  let hasAccess = true;

  if (!session) {
    hasAccess = false;
  } else if (session.membership.is_tenant_admin) {
    hasAccess = true;
  } else if (requiresTenantAdmin) {
    hasAccess = session.membership.is_tenant_admin;
  } else if (requiresAnyCrmReadPermission) {
    hasAccess = CRM_READ_PERMISSIONS.some((code) => session.grantedPermissions.includes(code));
  } else if (permission) {
    hasAccess = can(permission, session);
  }

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
