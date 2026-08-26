import type { ReactElement } from 'react';
import { MockChip } from './mockPrimitives';
import { previewQuoteLines } from '../../content/productPreviewContent';
import { QuoteStatusConfigMap } from '@/config/crmStatusConfig';

const headers = ['Product', 'Qty', 'Unit price', 'Total'];
const grid = 'grid grid-cols-[2.2fr_.4fr_.9fr_.9fr] gap-2';

const totals = [
  ['Subtotal', '360,000,000 ₫'],
  ['Discount', '-18,000,000 ₫'],
  ['VAT 10%', '34,200,000 ₫'],
];

export function MockQuoteEditor(): ReactElement {
  const badge = QuoteStatusConfigMap.DRAFT;

  return (
    <div className="grid grid-cols-[1.9fr_1fr] gap-2">
      <div className="min-w-0 overflow-hidden rounded-[4px] border border-[var(--lp-line)]">
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

        {previewQuoteLines.map((line) => (
          <div
            key={line.id}
            className={`${grid} items-center border-b border-[var(--lp-line)] px-2.5 py-2 last:border-b-0`}
          >
            <span className="truncate text-[11px] font-semibold text-[var(--lp-ink)]">
              {line.product}
            </span>
            <span className="text-[10px] tabular-nums text-[var(--lp-ink-muted)]">
              {line.qty}
            </span>
            <span className="truncate text-[10px] tabular-nums text-[var(--lp-ink-muted)]">
              {line.unitPrice}
            </span>
            <span className="truncate text-[11px] font-bold tabular-nums text-[var(--lp-ink)]">
              {line.total}
            </span>
          </div>
        ))}
      </div>

      <div className="min-w-0 rounded-[4px] border border-[var(--lp-line)] p-2.5">
        <div className="flex items-center justify-between gap-1">
          <span className="font-mono text-[10px] font-bold text-[var(--lp-blue-700)]">
            QUO-2026-0311
          </span>
          <span className="min-w-0 overflow-hidden">
            <MockChip
              label="DRAFT"
              className={
                badge?.className ??
                'border-[var(--lp-line)] bg-[var(--lp-surface-sunk)] text-[var(--lp-ink-muted)]'
              }
            />
          </span>
        </div>

        <dl className="mt-3 space-y-1.5">
          {totals.map(([term, value]) => (
            <div key={term} className="flex items-baseline justify-between gap-2">
              <dt className="text-[10px] text-[var(--lp-ink-subtle)]">{term}</dt>
              <dd className="text-[10px] font-semibold tabular-nums text-[var(--lp-ink-muted)]">
                {value}
              </dd>
            </div>
          ))}

          <div className="flex items-baseline justify-between gap-2 border-t border-[var(--lp-line)] pt-1.5">
            <dt className="text-[10px] font-bold text-[var(--lp-ink)]">Total</dt>
            <dd className="text-[12px] font-bold tabular-nums text-[var(--lp-ink)]">
              376,200,000 ₫
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export default MockQuoteEditor;
