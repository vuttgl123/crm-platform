import type { ReactElement } from 'react';
import { Check, Clock, Minus } from 'lucide-react';
import { MockAvatar } from './mockPrimitives';
import {
  previewApprovalSteps,
  type PreviewApprovalStep,
} from '../../content/productPreviewContent';

const stateStyle: Record<
  PreviewApprovalStep['state'],
  { Icon: typeof Check; dot: string; label: string; labelClass: string }
> = {
  approved: {
    Icon: Check,
    dot: 'bg-emerald-500 text-white',
    label: 'Approved',
    labelClass: 'text-emerald-700',
  },
  pending: {
    Icon: Clock,
    dot: 'bg-[var(--lp-blue-500)] text-white',
    label: 'Awaiting decision',
    labelClass: 'text-[var(--lp-blue-700)]',
  },
  waiting: {
    Icon: Minus,
    dot: 'bg-[var(--lp-surface-sunk)] text-[var(--lp-ink-subtle)]',
    label: 'Not started',
    labelClass: 'text-[var(--lp-ink-subtle)]',
  },
};

export function MockApprovalFlow(): ReactElement {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between rounded-[4px] border border-[var(--lp-line)] bg-[var(--lp-surface-sunk)] px-2.5 py-2">
        <span className="font-mono text-[10px] font-bold text-[var(--lp-blue-700)]">
          QUO-2026-0311
        </span>
        <span className="text-[11px] font-bold tabular-nums text-[var(--lp-ink)]">
          360,000,000 ₫
        </span>
      </div>

      <ol className="space-y-2 pl-1">
        {previewApprovalSteps.map((step, index) => {
          const style = stateStyle[step.state];
          const StateIcon = style.Icon;
          const isLast = index === previewApprovalSteps.length - 1;

          return (
            <li key={step.id} className="relative flex items-center gap-2.5">
              {!isLast ? (
                <span className="absolute left-[10px] top-6 h-[calc(100%-.5rem)] w-px bg-[var(--lp-line)]" />
              ) : null}

              <span
                className={`relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${style.dot}`}
              >
                <StateIcon className="h-3 w-3" />
              </span>

              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-[4px] border border-[var(--lp-line)] p-2">
                <MockAvatar initials={step.initials} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-[var(--lp-ink)]">
                    {step.person}
                  </p>
                  <p className="truncate text-[9px] text-[var(--lp-ink-subtle)]">{step.role}</p>
                </div>
                <span className={`shrink-0 text-[9px] font-bold ${style.labelClass}`}>
                  {style.label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default MockApprovalFlow;
