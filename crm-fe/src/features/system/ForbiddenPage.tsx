import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const ForbiddenPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-8 text-center shadow-xs">
        <div className="mx-auto w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
          <ShieldX className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">
          {t('states.forbiddenTitle', '403 - Access Denied')}
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          {t(
            'states.forbiddenDesc',
            'Your current account role or data scope does not have the required permissions to access this feature.'
          )}
        </p>
        <Link
          to="/app/overview"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.backToOverview', 'Back to Overview')}
        </Link>
      </div>
    </div>
  );
};
