import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/core/session/useAuth';
import { LoadingSkeleton } from './LoadingSkeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
}) => {
  const { session, isAuthenticated, isLoading, isExpired } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSkeleton variant="page" />;
  }

  if (isExpired) {
    return <Navigate to="/auth/session-expired" replace />;
  }

  if (!isAuthenticated || !session) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />;
  }

  // Tenant Admins and Active members NEVER go to Pending Approval page. Only non-admin INVITED members do.
  const isTenantAdminOrActive =
    session.membership?.is_tenant_admin === true ||
    session.membership?.membership_status === 'ACTIVE' ||
    session.activeRole?.role_code === 'TENANT_ADMIN' ||
    session.activeRole?.role_code === 'ADMIN';

  const isPendingApproval = !isTenantAdminOrActive && session.membership?.membership_status === 'INVITED';

  if (isPendingApproval && location.pathname !== '/app/pending-approval' && location.pathname !== '/app/setup-tenant') {
    return <Navigate to="/app/pending-approval" replace />;
  }

  return <>{children}</>;
};
