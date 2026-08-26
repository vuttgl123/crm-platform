import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';

export function MockChip({
  label,
  className,
}: {
  label: string;
  className?: string;
}): ReactElement {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[3px] border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] font-mono font-bold leading-none text-slate-300',
        className
      )}
    >
      {label}
    </span>
  );
}

export function MockAvatar({
  initials,
  className,
}: {
  initials: string;
  className?: string;
}): ReactElement {
  return (
    <span
      className={cn(
        'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
        'bg-blue-950 border border-blue-500/40 text-[9px] font-mono font-bold text-cyan-300 shadow-[0_0_6px_rgba(34,211,238,0.4)]',
        className
      )}
    >
      {initials}
    </span>
  );
}

export function MockBar({
  pct,
  className,
}: {
  pct: number;
  className?: string;
}): ReactElement {
  return (
    <span className={cn('block h-1.5 w-full rounded-full bg-slate-800 overflow-hidden', className)}>
      <span
        className="block h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
        style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
      />
    </span>
  );
}

export function MockField({
  label,
  value,
}: {
  label: string;
  value: string;
}): ReactElement {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="truncate text-xs font-bold text-white">{value}</p>
    </div>
  );
}
