import type { ReactElement } from 'react';
import { MockAvatar, MockChip, MockField } from './mockPrimitives';
import { previewActivityRows } from '../../content/productPreviewContent';
import { LifecycleStageConfigMap } from '@/config/crmStatusConfig';

const tabs = ['Overview', 'Contacts', 'Opportunities', 'Activities', 'Contracts'];

export function MockAccountRecord(): ReactElement {
  // LifecycleStageConfigMap is a total Record over AccountLifecycleStage,
  // so this lookup cannot be undefined.
  const badge = LifecycleStageConfigMap.CUSTOMER;

  return (
    <div className="space-y-2">
      <div className="rounded-[4px] border border-[var(--lp-line)] p-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-[var(--lp-ink)]">
              Pacific Rim Real Estate Group
            </p>
            <p className="mt-0.5 truncate text-[10px] text-[var(--lp-ink-subtle)]">
              Real Estate &amp; Construction &middot; 1,200 employees
            </p>
          </div>
          <span className="shrink-0">
            <MockChip label="CUSTOMER" className={badge.className} />
          </span>
        </div>

        <div className="mt-2.5 grid grid-cols-4 gap-2.5">
          <MockField label="Owner" value="Thanh Mai" />
          <MockField label="Open value" value="1,250,000,000 ₫" />
          <MockField label="Contacts" value="14" />
          <MockField label="Region" value="South" />
        </div>
      </div>

      <div className="flex gap-3 border-b border-[var(--lp-line)] px-0.5">
        {tabs.map((tab, index) => (
          <span
            key={tab}
            className={
              index === 3
                ? 'border-b-2 border-[var(--lp-blue-500)] pb-1.5 text-[10px] font-bold text-[var(--lp-blue-600)]'
                : 'pb-1.5 text-[10px] font-semibold text-[var(--lp-ink-subtle)]'
            }
          >
            {tab}
          </span>
        ))}
      </div>

      <div className="space-y-1.5">
        {previewActivityRows.map((row) => (
          <div
            key={row.id}
            className="flex items-start gap-2 rounded-[4px] border border-[var(--lp-line)] p-2"
          >
            <MockAvatar initials={row.initials} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-[var(--lp-ink)]">
                {row.summary}
              </p>
              <p className="mt-0.5 text-[9px] text-[var(--lp-ink-subtle)]">
                {row.kind} &middot; {row.when}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MockAccountRecord;
