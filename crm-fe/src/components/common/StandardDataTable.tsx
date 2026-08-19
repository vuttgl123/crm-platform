import React from 'react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ColumnDef<T> {
  header: React.ReactNode;
  accessor?: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  headerClassName?: string;
}

interface StandardDataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  renderCustomRow?: (item: T, index: number) => React.ReactNode;
  footer?: React.ReactNode;
  rowKey?: (item: T, index: number) => string | number;
}

export function StandardDataTable<T>({
  columns,
  data,
  loading = false,
  emptyTitle = 'Chưa có dữ liệu',
  emptyDescription = 'Không tìm thấy bản ghi nào phù hợp với bộ lọc hiện tại.',
  emptyActionLabel,
  onEmptyAction,
  renderCustomRow,
  footer,
  rowKey = (_, idx) => idx,
}: StandardDataTableProps<T>) {
  return (
    <Card className="border border-slate-200 rounded-[4px] overflow-hidden bg-white w-full shadow-none">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
            <TableRow className="hover:bg-[#F7F8F9]">
              {columns.map((col, idx) => (
                <TableHead
                  key={idx}
                  className={`text-[11px] font-semibold text-slate-600 uppercase tracking-wider h-9 px-3 ${
                    col.headerClassName || ''
                  }`}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="text-xs divide-y divide-slate-100">
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-44 text-center text-slate-500"
                >
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2.5" />
                  <span className="font-medium text-xs">Đang tải dữ liệu từ hệ thống...</span>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-48 text-center text-slate-500 p-8"
                >
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5">
                      <Inbox className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-slate-800 text-sm">{emptyTitle}</div>
                    <p className="text-xs text-slate-400 mt-1">{emptyDescription}</p>
                    {emptyActionLabel && onEmptyAction && (
                      <Button
                        size="sm"
                        onClick={onEmptyAction}
                        className="mt-3.5 h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      >
                        {emptyActionLabel}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : renderCustomRow ? (
              data.map((item, idx) => renderCustomRow(item, idx))
            ) : (
              data.map((item, idx) => (
                <TableRow
                  key={rowKey(item, idx)}
                  className="hover:bg-slate-50/60 transition-colors h-12"
                >
                  {columns.map((col, cIdx) => {
                    const content =
                      typeof col.accessor === 'function'
                        ? col.accessor(item)
                        : col.accessor
                        ? (item[col.accessor] as React.ReactNode)
                        : null;

                    return (
                      <TableCell key={cIdx} className={col.className || ''}>
                        {content}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {footer}
    </Card>
  );
}
