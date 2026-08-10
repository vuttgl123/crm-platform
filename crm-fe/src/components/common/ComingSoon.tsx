import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from './PageHeader';
import { ArrowLeft, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ComingSoonProps {
  title: string;
  moduleGroupTitle?: string;
  description?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  moduleGroupTitle,
  description,
}) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <PageHeader
        title={title}
        description={moduleGroupTitle ? `Phân hệ: ${moduleGroupTitle}` : undefined}
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" />
            {t('comingSoon.badge', 'Sắp ra mắt')}
          </span>
        }
      />

      <div className="bg-white border border-slate-200 rounded-lg p-8 text-center shadow-sm">
        <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
          <Clock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          {title} — {t('common.comingSoon', 'Sắp ra mắt')}
        </h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
          {description ||
            t(
              'comingSoon.defaultDesc',
              'Tính năng này thuộc phân hệ quy trình CRM chuyên sâu và đang được phát triển trong các giai đoạn tiếp theo.'
            )}
        </p>

        <Link
          to="/app/overview"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.backToOverview', 'Quay lại Tổng quan')}
        </Link>
      </div>
    </div>
  );
};
