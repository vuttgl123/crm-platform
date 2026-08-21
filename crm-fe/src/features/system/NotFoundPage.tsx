import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-8 text-center shadow-xs">
        <div className="mx-auto w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-4">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">
          {t('states.notFoundTitle', '404 - Page Not Found')}
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          {t(
            'states.notFoundDesc',
            'The requested resource could not be found or has been relocated.'
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
