import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SessionExpired } from '@/components/common/SessionExpired';
import { AppLayout } from '@/layouts/AppLayout';
import { OverviewPage } from '@/features/overview/OverviewPage';
import { UserProfilePage } from '@/features/profile/UserProfilePage';
import { AccountsPage } from '@/features/crm/accounts/AccountsPage';
import { AccountDetailPage } from '@/features/crm/accounts/AccountDetailPage';
import { ForbiddenPage } from '@/features/system/ForbiddenPage';
import { NotFoundPage } from '@/features/system/NotFoundPage';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { RouteAccessBoundary } from '@/components/common/RouteAccessBoundary';

import AuthLogin from '@/features/auth/AuthLogin';
import AuthRegister from '@/features/auth/AuthRegister';
import { AuthCallbackPage } from '@/features/auth/AuthCallbackPage';
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/ResetPasswordPage';
import { TenantSetupPage } from '@/features/tenant/TenantSetupPage';
import { PendingApprovalPage } from '@/features/auth/PendingApprovalPage';
import { UsersPage } from '@/features/platform/users/UsersPage';
import { RolesPage } from '@/features/platform/roles/RolesPage';

// Core CRM Screens
import { ContactsPage } from '@/features/crm/contacts/ContactsPage';
import { LeadsPage } from '@/features/crm/leads/LeadsPage';
import { OpportunitiesPage } from '@/features/crm/opportunities/OpportunitiesPage';
import { OpportunityDetailPage } from '@/features/crm/opportunities/pages/OpportunityDetailPage';
import { ActivitiesPage } from '@/features/crm/activities/ActivitiesPage';
import { ActivityDetailPage } from '@/features/crm/activities/pages/ActivityDetailPage';

// Sales & Catalog Screens
import { QuotesPage } from '@/features/sales/quotes/QuotesPage';
import { QuoteDetailPage } from '@/features/sales/quotes/pages/QuoteDetailPage';
import { QuoteEditorPage } from '@/features/sales/quotes/pages/QuoteEditorPage';
import { QuotePrintPage } from '@/features/sales/quotes/pages/QuotePrintPage';
import { OrdersPage } from '@/features/sales/orders/OrdersPage';
import { OrderDetailPage } from '@/features/sales/orders/OrderDetailPage';
import { OrderEditorPage } from '@/features/sales/orders/OrderEditorPage';
import { OrderPrintPage } from '@/features/sales/orders/OrderPrintPage';
import { ContractsPage } from '@/features/sales/contracts/ContractsPage';
import { SalesForecastPage } from '@/features/sales/forecast/SalesForecastPage';
import { CategoriesPage } from '@/features/catalog/categories/CategoriesPage';
import { ProductsPage } from '@/features/catalog/products/ProductsPage';
import { PriceBooksPage } from '@/features/catalog/pricebooks/PriceBooksPage';

// Service & Marketing Screens
import { TicketsPage } from '@/features/service/tickets/TicketsPage';
import { CampaignsPage } from '@/features/marketing/campaigns/CampaignsPage';

// Platform, Privacy, Audit & Integration Screens
import { TeamsPage } from '@/features/platform/teams/TeamsPage';
import { TenantSettingsPage } from '@/features/platform/settings/TenantSettingsPage';
import { PipelineSettingsPage } from '@/features/platform/pipeline/PipelineSettingsPage';
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

import { LandingLayout } from '@/features/landing/LandingLayout';
import HomePage from '@/features/landing/pages/HomePage';
import SolutionsPage from '@/features/landing/pages/SolutionsPage';
import FeaturesPage from '@/features/landing/pages/FeaturesPage';
import PricingPage from '@/features/landing/pages/PricingPage';
import DemoPage from '@/features/landing/pages/DemoPage';

import { useAuth } from '@/core/session/useAuth';
import { getAuthorizedPrimaryNavigationItems } from '@/core/navigation/routeResolver';

const AppIndexRedirect = () => {
  const { session } = useAuth();
  const primaryItems = getAuthorizedPrimaryNavigationItems(session);
  if (primaryItems.length > 0) {
    return <Navigate to={primaryItems[0].path} replace />;
  }
  return <Navigate to="/app/overview" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing Pages with Shared Layout */}
      <Route element={<LandingLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/solutions" element={<SolutionsPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/demo" element={<Navigate to="/" replace />} />
      </Route>

      {/* Public / Auth routes */}
      <Route path="/login" element={<AuthLogin />} />
      <Route path="/register" element={<AuthRegister />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
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

      {/* Standalone Canonical Quote Print View */}
      <Route
        path="/app/sales/quotes/:quoteId/print"
        element={
          <ProtectedRoute>
            <QuotePrintPage />
          </ProtectedRoute>
        }
      />

      {/* Standalone Canonical Order Print View */}
      <Route
        path="/app/sales/orders/:id/print"
        element={
          <ProtectedRoute>
            <OrderPrintPage />
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
            <RouteAccessBoundary>
              <AppLayout />
            </RouteAccessBoundary>
          </ProtectedRoute>
        }
      >
        {/* Default Redirect */}
        <Route index element={<AppIndexRedirect />} />

        {/* Overview & Profile */}
        <Route path="overview" element={<OverviewPage />} />
        <Route path="profile" element={<UserProfilePage />} />

        {/* 1. Core CRM Module */}
        <Route path="crm/accounts" element={<AccountsPage />} />
        <Route path="crm/accounts/:id" element={<AccountDetailPage />} />
        <Route path="crm/contacts" element={<ContactsPage />} />
        <Route path="crm/leads" element={<LeadsPage />} />
        <Route path="crm/opportunities" element={<OpportunitiesPage />} />
        <Route path="crm/opportunities/:id" element={<OpportunityDetailPage />} />
        <Route path="crm/activities" element={<ActivitiesPage />} />
        <Route path="crm/activities/:activityId" element={<ActivityDetailPage />} />

        {/* 2. Sales & Orders Module */}
        <Route path="sales/forecast" element={<SalesForecastPage />} />
        <Route path="sales/quotes" element={<QuotesPage />} />
        <Route path="sales/quotes/new" element={<QuoteEditorPage />} />
        <Route path="sales/quotes/:quoteId" element={<QuoteDetailPage />} />
        <Route path="sales/quotes/:quoteId/edit" element={<QuoteEditorPage />} />
        <Route path="sales/orders" element={<OrdersPage />} />
        <Route path="sales/orders/new" element={<OrderEditorPage />} />
        <Route path="sales/orders/:id" element={<OrderDetailPage />} />
        <Route path="sales/orders/:id/edit" element={<OrderEditorPage />} />
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
        <Route path="platform/pipelines" element={<PipelineSettingsPage />} />
      </Route>

      {/* Global 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
