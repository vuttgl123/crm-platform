import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth/LoginPage';
import { SessionExpired } from '@/components/common/SessionExpired';
import { AppLayout } from '@/layouts/AppLayout';
import { OverviewPage } from '@/features/overview/OverviewPage';
import { UserProfilePage } from '@/features/profile/UserProfilePage';
import { ForbiddenPage } from '@/features/system/ForbiddenPage';
import { NotFoundPage } from '@/features/system/NotFoundPage';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { ComingSoon } from '@/components/common/ComingSoon';
import { NAVIGATION_GROUPS } from '@/config/navigationConfig';
import { useAuth } from '@/core/session/useAuth';

import { RegisterPage } from '@/features/auth/RegisterPage';
import { AuthCallbackPage } from '@/features/auth/AuthCallbackPage';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/app/overview" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Public / Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/auth/session-expired" element={<SessionExpired />} />
      <Route path="/403" element={<ForbiddenPage />} />

      {/* Protected App Shell routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Overview & Profile */}
        <Route path="overview" element={<OverviewPage />} />
        <Route path="profile" element={<UserProfilePage />} />

        {/* Dynamic Coming Soon Routes for all Schema Groups */}
        {NAVIGATION_GROUPS.flatMap((group) =>
          group.items.map((item) => {
            // Strip leading /app/
            const relativePath = item.path.replace(/^\/app\//, '');
            return (
              <Route
                key={item.id}
                path={relativePath}
                element={
                  <ProtectedRoute navItem={item}>
                    <ComingSoon title={item.titleVi} moduleGroupTitle={group.titleVi} />
                  </ProtectedRoute>
                }
              />
            );
          })
        )}
      </Route>

      {/* Global 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
