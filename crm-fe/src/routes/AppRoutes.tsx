import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth/LoginPage';
import { SessionExpired } from '@/components/common/SessionExpired';
import { AppLayout } from '@/layouts/AppLayout';
import { OverviewPage } from '@/features/overview/OverviewPage';
import { UserProfilePage } from '@/features/profile/UserProfilePage';
import { AccountsPage } from '@/features/crm/accounts/AccountsPage';
import { AccountDetailPage } from '@/features/crm/accounts/AccountDetailPage';
import { ForbiddenPage } from '@/features/system/ForbiddenPage';
import { NotFoundPage } from '@/features/system/NotFoundPage';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { useAuth } from '@/core/session/useAuth';

import { RegisterPage } from '@/features/auth/RegisterPage';
import { AuthCallbackPage } from '@/features/auth/AuthCallbackPage';
import { TenantSetupPage } from '@/features/tenant/TenantSetupPage';
import { PendingApprovalPage } from '@/features/auth/PendingApprovalPage';
import { UsersPage } from '@/features/platform/users/UsersPage';
import { RolesPage } from '@/features/platform/roles/RolesPage';

// Core CRM Screens
import { ContactsPage } from '@/features/crm/contacts/ContactsPage';
import { LeadsPage } from '@/features/crm/leads/LeadsPage';
import { OpportunitiesPage } from '@/features/crm/opportunities/OpportunitiesPage';
import { ActivitiesPage } from '@/features/crm/activities/ActivitiesPage';

// Sales & Catalog Screens
import { QuotesPage } from '@/features/sales/quotes/QuotesPage';
import { OrdersPage } from '@/features/sales/orders/OrdersPage';
import { ContractsPage } from '@/features/sales/contracts/ContractsPage';
import { CategoriesPage } from '@/features/catalog/categories/CategoriesPage';
import { ProductsPage } from '@/features/catalog/products/ProductsPage';
import { PriceBooksPage } from '@/features/catalog/pricebooks/PriceBooksPage';

// Service & Marketing Screens
import { TicketsPage } from '@/features/service/tickets/TicketsPage';
import { CampaignsPage } from '@/features/marketing/campaigns/CampaignsPage';

// Platform, Privacy, Audit & Integration Screens
import { TeamsPage } from '@/features/platform/teams/TeamsPage';
import { TenantSettingsPage } from '@/features/platform/settings/TenantSettingsPage';
import { AuditLogsPage } from '@/features/audit/logs/AuditLogsPage';
import { DataAccessPage } from '@/features/audit/access/DataAccessPage';
import { PrivacyConsentPage } from '@/features/privacy/consent/PrivacyConsentPage';
import { RetentionPoliciesPage } from '@/features/privacy/retention/RetentionPoliciesPage';
import { DataSubjectRequestsPage } from '@/features/privacy/dsr/DataSubjectRequestsPage';
import { LegalHoldPage } from '@/features/privacy/legalhold/LegalHoldPage';
import { ExternalIdsPage } from '@/features/integration/external/ExternalIdsPage';
import { OutboxEventsPage } from '@/features/integration/outbox/OutboxEventsPage';
import { WebhooksPage } from '@/features/integration/webhooks/WebhooksPage';
import { DataImportPage } from '@/features/integration/import/DataImportPage';

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

        {/* 1. Core CRM Module */}
        <Route path="crm/accounts" element={<AccountsPage />} />
        <Route path="crm/accounts/:id" element={<AccountDetailPage />} />
        <Route path="crm/contacts" element={<ContactsPage />} />
        <Route path="crm/leads" element={<LeadsPage />} />
        <Route path="crm/opportunities" element={<OpportunitiesPage />} />
        <Route path="crm/activities" element={<ActivitiesPage />} />

        {/* 2. Sales & Orders Module */}
        <Route path="sales/quotes" element={<QuotesPage />} />
        <Route path="sales/orders" element={<OrdersPage />} />
        <Route path="sales/contracts" element={<ContractsPage />} />

        {/* 3. Product Catalog Module */}
        <Route path="catalog/categories" element={<CategoriesPage />} />
        <Route path="catalog/products" element={<ProductsPage />} />
        <Route path="catalog/price-books" element={<PriceBooksPage />} />

        {/* 4. Customer Service Module */}
        <Route path="service/tickets" element={<TicketsPage />} />

        {/* 5. Marketing Module */}
        <Route path="marketing/campaigns" element={<CampaignsPage />} />

        {/* 6. Privacy & Compliance Module */}
        <Route path="privacy/consent" element={<PrivacyConsentPage />} />
        <Route path="privacy/retention" element={<RetentionPoliciesPage />} />
        <Route path="privacy/dsr" element={<DataSubjectRequestsPage />} />
        <Route path="privacy/legal-hold" element={<LegalHoldPage />} />

        {/* 7. Integration & Data Pipeline Module */}
        <Route path="integration/external-ids" element={<ExternalIdsPage />} />
        <Route path="integration/outbox" element={<OutboxEventsPage />} />
        <Route path="integration/webhooks" element={<WebhooksPage />} />
        <Route path="integration/import" element={<DataImportPage />} />

        {/* 8. Audit & Access Logs Module */}
        <Route path="audit/logs" element={<AuditLogsPage />} />
        <Route path="audit/data-access" element={<DataAccessPage />} />

        {/* 9. Platform Administration Module */}
        <Route path="platform/users" element={<UsersPage />} />
        <Route path="platform/teams" element={<TeamsPage />} />
        <Route path="platform/roles" element={<RolesPage />} />
        <Route path="platform/settings" element={<TenantSettingsPage />} />
      </Route>

      {/* Global 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
