import type { ReactElement } from 'react';
import { MockChip } from './mockPrimitives';
import { previewContractRows } from '../../content/productPreviewContent';

const headers = ['Contract', 'Account', 'Value', 'Ends', 'Status'];
const grid = 'grid grid-cols-[1fr_1.3fr_.9fr_.7fr_.7fr] gap-2';

/**
 * crmStatusConfig has no contract-status map, so the palette is written here.
 * The three classes follow the lifecycle scale documented in AGENTS.md:
 * emerald for active, blue for in progress, amber for at risk.
 */
const statusClass: Record<string, string> = {
  ACTIVE: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  RENEWAL: 'border-blue-200 bg-blue-50 text-blue-700',
  EXPIRING: 'border-amber-200 bg-amber-50 text-amber-700',
};

export function MockContractList(): ReactElement {
  return (
    <div className="overflow-hidden rounded-[4px] border border-[var(--lp-line)]">
      <div className={`${grid} border-b border-[var(--lp-line)] bg-[var(--lp-surface-sunk)] px-2.5 py-1.5`}>
        {headers.map((header) => (
          <span
            key={header}
            className="text-[9px] font-bold uppercase tracking-wider text-[var(--lp-ink-subtle)]"
          >
            {header}
          </span>
        ))}
      </div>

      {previewContractRows.map((row) => (
        <div
          key={row.id}
          className={`${grid} items-center border-b border-[var(--lp-line)] px-2.5 py-2 last:border-b-0`}
        >
          <span className="truncate font-mono text-[10px] font-semibold text-[var(--lp-blue-700)]">
            {row.code}
          </span>
          <span className="truncate text-[11px] font-semibold text-[var(--lp-ink)]">
            {row.account}
          </span>
          <span className="truncate text-[11px] font-bold tabular-nums text-[var(--lp-ink)]">
            {row.value}
          </span>
          <span className="truncate text-[10px] tabular-nums text-[var(--lp-ink-subtle)]">
            {row.endDate}
          </span>
          <span className="min-w-0 overflow-hidden">
            <MockChip label={row.status} className={statusClass[row.status]} />
          </span>
        </div>
      ))}
    </div>
  );
}

export default MockContractList;
