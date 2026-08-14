import React from 'react';
import { FolderOpen, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 my-2">
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      {description && (
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          size="sm"
          className="mt-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
