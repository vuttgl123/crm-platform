import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/core/session/useAuth';
import { canAccessRoute } from '@/core/permissions/evaluator';
import { NavigationItem } from '@/types/navigation';
import { LoadingSkeleton } from './LoadingSkeleton';

interface ProtectedRouteProps {
  navItem?: NavigationItem;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  navItem,
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

  // Auto-redirect users with no tenant to Tenant Setup Onboarding
  const hasNoTenant = !session.tenant?.id || session.tenant.id === '';
  if (hasNoTenant && location.pathname !== '/app/setup-tenant') {
    return <Navigate to="/app/setup-tenant" replace />;
  }

  // Auto-redirect users waiting for Tenant Admin approval to Pending Approval page
  const isPendingApproval = session.membership?.membership_status === 'INVITED';
  if (isPendingApproval && location.pathname !== '/app/pending-approval') {
    return <Navigate to="/app/pending-approval" replace />;
  }

  if (navItem && !canAccessRoute(navItem, session)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};
