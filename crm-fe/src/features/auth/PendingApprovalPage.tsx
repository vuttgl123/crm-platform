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
        <div className="p-4 rounded-xl bg-slate-50 border border-[#DCE5F0] space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">
              {t('auth.gateway.pending.account')}:
            </span>
            <span className="font-semibold text-[#07182B]">
              {session?.user.email || '—'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">
              {t('auth.gateway.pending.organization')}:
            </span>
            <span className="font-bold text-[#085AC0]">
              {organizationName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">
              {t('auth.gateway.pending.status')}:
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200 text-[11px]">
              <Clock className="w-3 h-3 text-amber-600" aria-hidden="true" />
              <span>{t('auth.gateway.pending.statusInvited')}</span>
            </span>
          </div>
        </div>

        {/* Process Explanation */}
        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 space-y-1 text-xs">
          <div className="font-bold text-[#085AC0] flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[#085AC0]" aria-hidden="true" />
            <span>{t('auth.gateway.pending.processTitle')}</span>
          </div>
          <p className="text-slate-600 leading-relaxed font-normal text-[11px]">
            {t('auth.gateway.pending.processDescription')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={handleRefreshStatus}
            className="auth-control auth-interactive w-full bg-[#085AC0] hover:bg-[#06499D] text-white font-semibold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t('auth.gateway.pending.refresh')}</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="auth-control auth-interactive w-full border border-[#DCE5F0] bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <span>{t('auth.gateway.pending.logout')}</span>
          </button>
        </div>
      </div>
    </AuthShell>
  );
};

export default PendingApprovalPage;
