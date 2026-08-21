import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, RefreshCw, LogOut, Info } from 'lucide-react';
import { useAuth } from '@/core/session/useAuth';
import { AuthShell } from './components/AuthShell';
import { AuthPageHeader } from './components/AuthPageHeader';

export const PendingApprovalPage: React.FC = () => {
  const { t } = useTranslation();
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  const organizationName =
    session?.tenant?.display_name ||
    session?.tenant?.tenant_code ||
    t('auth.gateway.pending.unknownOrganization');

  const handleRefreshStatus = () => {
    window.location.reload();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <AuthShell brandVariant="compact">
      <AuthPageHeader
        titleKey="auth.gateway.pending.title"
        descriptionKey="auth.gateway.pending.description"
      />

      <div className="space-y-4 text-left">
        {/* Definition List */}
        <div className="p-4 rounded-xl bg-[var(--auth-canvas)] border border-[var(--auth-line)] space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[var(--auth-muted)] font-medium">
              {t('auth.gateway.pending.account')}:
            </span>
            <span className="font-semibold text-[var(--auth-ink)]">
              {session?.user.email || '—'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[var(--auth-muted)] font-medium">
              {t('auth.gateway.pending.organization')}:
            </span>
            <span className="font-bold text-[var(--auth-blue)]">
              {organizationName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[var(--auth-muted)] font-medium">
              {t('auth.gateway.pending.status')}:
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200 text-[11px]">
              <Clock className="w-3 h-3 text-amber-600" aria-hidden="true" />
              <span>{t('auth.gateway.pending.statusInvited')}</span>
            </span>
          </div>
        </div>

        {/* Process Explanation */}
        <div className="p-3.5 rounded-xl bg-[var(--auth-blue-soft)] border border-[var(--auth-line)] space-y-1 text-xs">
          <div className="font-bold text-[var(--auth-blue)] flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[var(--auth-blue)]" aria-hidden="true" />
            <span>{t('auth.gateway.pending.processTitle')}</span>
          </div>
          <p className="text-[var(--auth-muted)] leading-relaxed font-normal text-[11px]">
            {t('auth.gateway.pending.processDescription')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={handleRefreshStatus}
            className="auth-control auth-interactive w-full bg-[var(--auth-blue)] hover:bg-[var(--auth-blue-hover)] text-white font-semibold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t('auth.gateway.pending.refresh')}</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="auth-control auth-interactive w-full border border-[var(--auth-line)] bg-white hover:bg-[var(--auth-canvas)] text-[var(--auth-ink)] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5 text-[var(--auth-muted)]" aria-hidden="true" />
            <span>{t('auth.gateway.pending.logout')}</span>
          </button>
        </div>
      </div>
    </AuthShell>
  );
};

export default PendingApprovalPage;
