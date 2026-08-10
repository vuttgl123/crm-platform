import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  description,
  onRetry,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50/50 border border-red-200 rounded-lg">
      <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">
        {title || t('states.errorTitle', 'Đã xảy ra lỗi dịch vụ')}
      </h3>
      <p className="text-sm text-slate-600 max-w-sm mb-4">
        {description ||
          t('states.errorDesc', 'Dịch vụ tạm thời không phản hồi. Vui lòng thử lại sau.')}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {t('common.retry', 'Thử lại')}
        </button>
      )}
    </div>
  );
};
