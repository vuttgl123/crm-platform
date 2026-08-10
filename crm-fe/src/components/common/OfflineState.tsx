import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const OfflineState: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-amber-50/50 border border-amber-200 rounded-lg">
      <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
        <WifiOff className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">
        {t('states.offlineTitle', 'Mất kết nối mạng')}
      </h3>
      <p className="text-sm text-slate-600 max-w-sm mb-4">
        {t('states.offlineDesc', 'Vui lòng kiểm tra lại kết nối Internet của bạn.')}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {t('common.retry', 'Thử lại')}
        </button>
      )}
    </div>
  );
};
