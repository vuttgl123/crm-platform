import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface StandardPaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
}

export const StandardPagination: React.FC<StandardPaginationProps> = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  itemLabel = 'records',
}) => {
  if (totalElements === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalElements);

  return (
    <div className="px-4 py-2.5 bg-[#FAFBFC] border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
      <div className="flex items-center gap-4 text-slate-600 flex-wrap">
        <span>
          Showing <strong className="text-slate-800 font-semibold">{startItem} - {endItem}</strong> of <strong className="text-slate-800 font-semibold">{totalElements}</strong> {itemLabel}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Rows:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                onPageSizeChange(Number(val));
                onPageChange(1);
              }}
            >
              <SelectTrigger className="h-7 w-16 text-xs bg-white border-slate-200 rounded-[3px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-[3px]">
                {pageSizeOptions.map((opt) => (
                  <SelectItem key={opt} value={String(opt)} className="text-xs">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className="h-7 w-7 p-0 border-slate-200 bg-white hover:bg-slate-100 rounded-[3px]"
          title="First Page"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-7 px-2 text-xs border-slate-200 bg-white hover:bg-slate-100 gap-1 rounded-[3px]"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </Button>

        <div className="flex items-center gap-1 px-1.5 font-medium text-slate-700">
          <span className="text-[#0C66E4] font-bold">{currentPage}</span>
          <span className="text-slate-400">/</span>
          <span>{Math.max(1, totalPages)}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-7 px-2 text-xs border-slate-200 bg-white hover:bg-slate-100 gap-1 rounded-[3px]"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="h-7 w-7 p-0 border-slate-200 bg-white hover:bg-slate-100 rounded-[3px]"
          title="Last Page"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
