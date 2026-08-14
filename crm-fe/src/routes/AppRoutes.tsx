import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth/LoginPage';
import { SessionExpired } from '@/components/common/SessionExpired';
import { AppLayout } from '@/layouts/AppLayout';
import { OverviewPage } from '@/features/overview/OverviewPage';
import { UserProfilePage } from '@/features/profile/UserProfilePage';
import { AccountsPage } from '@/features/crm/accounts/AccountsPage';
import { ForbiddenPage } from '@/features/system/ForbiddenPage';
import { NotFoundPage } from '@/features/system/NotFoundPage';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { ComingSoon } from '@/components/common/ComingSoon';
import { NAVIGATION_GROUPS } from '@/config/navigationConfig';
import { useAuth } from '@/core/session/useAuth';

import { RegisterPage } from '@/features/auth/RegisterPage';
import { AuthCallbackPage } from '@/features/auth/AuthCallbackPage';
import { TenantSetupPage } from '@/features/tenant/TenantSetupPage';
import { PendingApprovalPage } from '@/features/auth/PendingApprovalPage';
import { UsersPage } from '@/features/platform/users/UsersPage';
import { RolesPage } from '@/features/platform/roles/RolesPage';
import { AccountDetailPage } from '@/features/crm/accounts/AccountDetailPage';

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

      {/* Standalone Pending Approval Page */}
      <Route
        path="/app/pending-approval"
        element={
          <ProtectedRoute>
            <PendingApprovalPage />
          </ProtectedRoute>
        }
      />

      {/* Full-screen Standalone Tenant Setup Onboarding */}
      <Route
        path="/app/setup-tenant"
        element={
          <ProtectedRoute>
            <TenantSetupPage />
          </ProtectedRoute>
        }
      />

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
        <Route path="crm/accounts" element={<AccountsPage />} />
        <Route path="crm/accounts/:id" element={<AccountDetailPage />} />
        <Route path="platform/users" element={<UsersPage />} />
        <Route path="platform/roles" element={<RolesPage />} />

        {/* Dynamic Coming Soon Routes for unimplemented Schema Groups */}
        {NAVIGATION_GROUPS.flatMap((group) =>
          group.items
            .filter(
              (item) =>
                item.path !== '/app/crm/accounts' &&
                item.path !== '/app/platform/users' &&
                item.path !== '/app/platform/roles'
            )
            .map((item) => {
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
