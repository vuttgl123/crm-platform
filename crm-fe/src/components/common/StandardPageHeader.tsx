import React from 'react';

interface StandardPageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  badgeCount?: number | string;
  badgeLabel?: string;
  actions?: React.ReactNode;
}

export const StandardPageHeader: React.FC<StandardPageHeaderProps> = ({
  title,
  subtitle,
  badgeCount,
  badgeLabel = 'items',
  actions,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 pt-1">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          {badgeCount !== undefined && (
            <span className="inline-flex items-center text-[11px] font-semibold bg-slate-200/80 text-slate-700 rounded-full px-2 py-0.5">
              {badgeCount} {badgeLabel}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5 max-w-3xl font-normal">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 flex-wrap shrink-0 w-full sm:w-auto justify-start sm:justify-end">
          {actions}
        </div>
      )}
    </div>
  );
};
