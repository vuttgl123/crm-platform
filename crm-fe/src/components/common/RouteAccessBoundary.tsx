import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/core/session/useAuth';
import { resolveAppRoute } from '@/core/navigation/routeResolver';
import { canAccessRoute } from '@/core/permissions/evaluator';

interface RouteAccessBoundaryProps {
  children: React.ReactNode;
}

export const RouteAccessBoundary: React.FC<RouteAccessBoundaryProps> = ({ children }) => {
  const { session } = useAuth();
  const location = useLocation();

  const manifestItem = resolveAppRoute(location.pathname);

  // If no manifest item is found, assume it is either a catch-all 404 or an unregulated route,
  // let standard React Router logic handle it.
  if (!manifestItem) {
    return <>{children}</>;
  }

  // Evaluate the access rule against the user session
  if (!canAccessRoute(manifestItem, session)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};
