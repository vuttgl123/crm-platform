import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const SessionExpired: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-lg p-8 text-center shadow-sm">
        <div className="mx-auto w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">
          {t('auth.sessionExpiredTitle', 'Phiên làm việc đã hết hạn')}
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          {t(
            'auth.sessionExpiredDesc',
            'Phiên làm việc của bạn đã hết hạn bảo mật. Vui lòng đăng nhập lại để tiếp tục sử dụng VUM CRM.'
          )}
        </p>
        <Link
          to="/login"
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm"
        >
          <LogIn className="w-4 h-4" />
          {t('auth.reloginButton', 'Đăng nhập lại')}
        </Link>
      </div>
    </div>
  );
};
