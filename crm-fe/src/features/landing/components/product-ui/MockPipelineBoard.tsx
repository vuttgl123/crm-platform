import type { ReactElement } from 'react';
import { MockAvatar, MockBar, MockChip } from './mockPrimitives';
import { previewPipelineItems } from '../../content/productPreviewContent';
import { OpportunityStageConfigMap } from '@/config/crmStatusConfig';

const columns = [
  { stage: 'PROSPECTING', count: 8, amount: '4.1B ₫', cards: 2 },
  { stage: 'QUALIFICATION', count: 6, amount: '3.6B ₫', cards: 1 },
  { stage: 'PROPOSAL', count: 5, amount: '2.9B ₫', cards: 0 },
  { stage: 'NEGOTIATION', count: 3, amount: '1.8B ₫', cards: 0 },
  { stage: 'CLOSED_WON', count: 4, amount: '2.2B ₫', cards: 0 },
] as const;

export function MockPipelineBoard(): ReactElement {
  let offset = 0;
  const cardsByColumn = columns.map((column) => {
    const slice = previewPipelineItems.slice(offset, offset + column.cards);
    offset += column.cards;
    return slice;
  });

  return (
    <div className="grid grid-cols-5 gap-3 p-1">
      {columns.map((column, columnIndex) => {
        const cards = cardsByColumn[columnIndex];
        const stage = OpportunityStageConfigMap[column.stage];

        return (
          <div key={column.stage} className="min-w-0">
            <div className="mb-2 flex min-w-0 items-center justify-between gap-1">
              <span className="min-w-0 overflow-hidden">
                <MockChip
                  label={stage.label}
                  className={`${stage.className} max-w-full whitespace-nowrap text-[10px] font-bold`}
                />
              </span>
              <span className="shrink-0 font-mono text-[10px] font-bold text-slate-500">
                {column.count}
              </span>
            </div>

            <p className="mb-2.5 font-mono text-[10px] font-bold tabular-nums text-slate-400">
              {column.amount}
            </p>

            <div className="space-y-2">
              {cards.map((card, cardIndex) => (
                <div
                  key={card.id}
                  className="lp-mock-card rounded-[4px] border border-slate-800 bg-slate-900/90 p-3 shadow-md hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all duration-200"
                  style={{ animationDelay: `${(columnIndex * 2 + cardIndex) * 90}ms` }}
                >
                  <p className="truncate text-xs font-bold leading-tight text-white">
                    {card.accountName}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] font-medium text-slate-400">
                    {card.industry}
                  </p>
                  <p className="mt-2 truncate font-mono text-xs font-extrabold tabular-nums text-cyan-400">
                    {card.amount}
                  </p>

                  <MockBar pct={Number.parseInt(card.probability, 10)} className="mt-2" />

                  <div className="mt-2.5 flex items-center justify-between gap-1">
                    <MockChip
                      label={`${card.probability} Win`}
                      className="border-emerald-500/40 bg-emerald-950/80 text-emerald-300 text-[9px] font-bold"
                    />
                    <MockAvatar initials={card.contactPerson.slice(0, 2).toUpperCase()} />
                  </div>
                </div>
              ))}

              {Array.from({ length: Math.max(0, 2 - cards.length) }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="rounded-[4px] border border-dashed border-slate-800/80 bg-slate-900/30 p-2.5"
                >
                  <span className="block h-2 w-3/4 rounded-full bg-slate-800" />
                  <span className="mt-2 block h-1.5 w-1/2 rounded-full bg-slate-800/60" />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MockPipelineBoard;
