import React from 'react';
import { Inbox } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">
        {title || t('states.emptyTitle', 'Không có dữ liệu')}
      </h3>
      <p className="text-sm text-slate-500 max-w-sm mb-4">
        {description || t('states.emptyDesc', 'Chưa có bản ghi nào được ghi nhận.')}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
