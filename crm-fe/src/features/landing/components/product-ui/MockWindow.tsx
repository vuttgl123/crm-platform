import type { ReactElement, ReactNode } from 'react';
import { Search, LayoutGrid, Users, Briefcase, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const railIcons = [LayoutGrid, Users, Briefcase, FileText, Settings];

export interface MockWindowProps {
  children: ReactNode;
  className?: string;
}

/**
 * The shared chrome around every product mockup.
 */
export function MockWindow({ children, className }: MockWindowProps): ReactElement {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'overflow-hidden rounded-[12px] border border-slate-800 bg-slate-950 shadow-[0_0_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl',
        className
      )}
    >
      <div className="flex">
        {/* Left icon rail */}
        <div className="hidden w-12 shrink-0 flex-col items-center gap-4 border-r border-slate-800 bg-slate-900/90 py-3 sm:flex">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-tr from-cyan-500 to-blue-600 text-[10px] font-black text-white font-mono shadow-[0_0_10px_rgba(34,211,238,0.5)]">
            V
          </span>
          {railIcons.map((Icon, index) => (
            <Icon
              key={index}
              className={cn(
                'h-4 w-4',
                index === 0 ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              )}
            />
          ))}
        </div>

        <div className="min-w-0 flex-1">
          {/* Top bar */}
          <div className="flex items-center gap-3 border-b border-slate-800 bg-slate-900/60 px-4 py-2.5">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-400">
              <span className="text-slate-500">Workspace</span>
              <span>/</span>
              <span className="text-cyan-300 font-bold">Revenue Operations</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-[4px] border border-slate-800 bg-slate-900 px-2.5 py-1 text-[10px] text-slate-400 md:inline-flex">
                <Search className="h-3 w-3 text-slate-500" />
                Search (Cmd+K)
              </span>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyan-950 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300">
                TM
              </span>
            </div>
          </div>

          {/* Screen */}
          <div className="relative overflow-hidden bg-slate-950">
            <div className="min-w-[40rem] p-4 text-slate-200">{children}</div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-slate-950 to-transparent sm:hidden" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MockWindow;
