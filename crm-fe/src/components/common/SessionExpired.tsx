import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, LogIn, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const SessionExpired: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col justify-between py-8 px-4 font-sans">
      {/* Top Header */}
      <div className="w-full max-w-[32rem] mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[#57534E] hover:text-[#1D4ED8] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>{t('auth.gateway.common.backHome')}</span>
        </Link>
      </div>

      {/* Main Card Frame */}
      <div className="max-w-[32rem] w-full mx-auto bg-white border border-[#E7E5E4] rounded-[12px] p-8 sm:p-10 text-center shadow-[0_1px_3px_rgba(28,25,23,0.04),0_16px_40px_rgba(28,25,23,0.06)] animate-in fade-in duration-300">
        <div className="mx-auto w-14 h-14 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] flex items-center justify-center mb-5">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-[22px] sm:text-[26px] font-bold text-[#1C1917] tracking-tight mb-2">
          {t('auth.sessionExpiredTitle')}
        </h1>
        <p className="text-[14px] text-[#57534E] leading-relaxed mb-6">
          {t('auth.sessionExpiredDesc')}
        </p>
        <Link
          to="/login"
          className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-[6px] text-[14px] font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] shadow-[0_1px_2px_rgba(29,78,216,0.2)] active:scale-[0.98] transition-all"
        >
          <LogIn className="w-4 h-4" />
          <span>{t('auth.reloginButton')}</span>
        </Link>
      </div>

      {/* Footer */}
      <div className="w-full max-w-[32rem] mx-auto text-center text-[12px] text-[#A8A29E]">
        <p>© {new Date().getFullYear()} VUM CRM Platform. {t('auth.gateway.footer.copyright', 'All rights reserved.')}</p>
      </div>
    </div>
  );
};

export default SessionExpired;
