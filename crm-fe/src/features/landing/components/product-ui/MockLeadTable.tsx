import type { ReactElement } from 'react';
import { MockAvatar, MockChip } from './mockPrimitives';
import { previewLeadRows } from '../../content/productPreviewContent';
import { LeadStatusConfigMap } from '@/config/crmStatusConfig';

const headers = ['Name', 'Company', 'Source', 'Status', 'Owner'];
const grid = 'grid grid-cols-[1.2fr_1.4fr_.9fr_.9fr_.4fr] gap-2';

export function MockLeadTable(): ReactElement {
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

      {previewLeadRows.map((row) => {
        // LeadStatusConfigMap is Record<string, ...>, so an unrecognised key
        // resolves to undefined at runtime while still typechecking clean.
        const badge = LeadStatusConfigMap[row.status];

        return (
          <div
            key={row.id}
            className={`${grid} items-center border-b border-[var(--lp-line)] px-2.5 py-2 last:border-b-0`}
          >
            <span className="truncate text-[11px] font-semibold text-[var(--lp-ink)]">
              {row.name}
            </span>
            <span className="truncate text-[11px] text-[var(--lp-ink-muted)]">
              {row.company}
            </span>
            <span className="truncate text-[10px] text-[var(--lp-ink-subtle)]">
              {row.source}
            </span>
            <span className="min-w-0 overflow-hidden">
              <MockChip
                label={row.status}
                className={
                  badge?.className ??
                  'border-[var(--lp-line)] bg-[var(--lp-surface-sunk)] text-[var(--lp-ink-muted)]'
                }
              />
            </span>
            <span>
              <MockAvatar initials={row.owner} />
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default MockLeadTable;
