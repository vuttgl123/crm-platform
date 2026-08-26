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
      <div className="auth-stagger-1">
        <AuthPageHeader
          titleKey="auth.gateway.pending.title"
          descriptionKey="auth.gateway.pending.description"
        />
      </div>

      <div className="space-y-4 text-left auth-stagger-2">
        {/* Organization & User Overview Pod */}
        <div className="p-4 rounded-[8px] bg-[#FAFAF9] border border-[#E7E5E4] space-y-2.5 text-[13px]">
          <div className="flex items-center justify-between">
            <span className="text-[#57534E] font-medium">
              {t('auth.gateway.pending.account')}:
            </span>
            <span className="font-semibold text-[#1C1917] font-mono">
              {session?.user.email || '—'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#57534E] font-medium">
              {t('auth.gateway.pending.organization')}:
            </span>
            <span className="font-bold text-[#1D4ED8]">
              {organizationName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#57534E] font-medium">
              {t('auth.gateway.pending.status')}:
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-[#FEF3C7] text-[#92400E] font-semibold border border-[#FDE68A] text-[11px]">
              <Clock className="w-3 h-3 text-[#D97706]" aria-hidden="true" />
              <span>{t('auth.gateway.pending.statusInvited')}</span>
            </span>
          </div>
        </div>

        {/* Process Explanation */}
        <div className="p-3.5 rounded-[8px] bg-[#EFF6FF] border border-[#BFDBFE] space-y-1 text-[12px]">
          <div className="font-semibold text-[#1D4ED8] flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[#1D4ED8]" aria-hidden="true" />
            <span>{t('auth.gateway.pending.processTitle')}</span>
          </div>
          <p className="text-[#57534E] leading-relaxed font-normal">
            {t('auth.gateway.pending.processDescription')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2 auth-stagger-3">
          <button
            type="button"
            onClick={handleRefreshStatus}
            className="w-full h-11 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-[14px] shadow-[0_1px_2px_rgba(29,78,216,0.2)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t('auth.gateway.pending.refresh')}</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full h-11 rounded-[6px] border border-[#E7E5E4] bg-white hover:bg-[#FAFAF9] text-[#1C1917] font-semibold text-[14px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <LogOut className="w-3.5 h-3.5 text-[#57534E]" aria-hidden="true" />
            <span>{t('auth.gateway.pending.logout')}</span>
          </button>
        </div>
      </div>
    </AuthShell>
  );
};

export default PendingApprovalPage;
