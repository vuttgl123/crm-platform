import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'warning',
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const btnBg =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : variant === 'warning'
      ? 'bg-amber-600 hover:bg-amber-700 text-white'
      : 'bg-blue-600 hover:bg-blue-700 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-full bg-amber-100 text-amber-600 shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 id="confirm-dialog-title" className="text-base font-semibold text-slate-900">
              {title}
            </h3>
            <p className="text-sm text-slate-600 mt-1">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            {cancelLabel || t('common.cancel', 'Hủy')}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${btnBg}`}
          >
            {confirmLabel || t('common.confirm', 'Xác nhận')}
          </button>
        </div>
      </div>
    </div>
  );
};
