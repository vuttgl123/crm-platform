import React, { useState, useEffect } from 'react';
import { integrationApi, OutboxEventItem } from '@/services/api/integrationApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Send, RefreshCw, Loader2, CheckCircle2, Clock } from 'lucide-react';

export const OutboxEventsPage: React.FC = () => {
  const [events, setEvents] = useState<OutboxEventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = () => {
    setLoading(true);
    integrationApi.listOutboxEvents().then((data) => {
      setEvents(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Send className="w-7 h-7 text-blue-600" />
            <span>Hàng đợi Sự kiện Hệ thống (Transactional Outbox)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi phân phối sự kiện bất đồng bộ đảm bảo tính toàn vẹn và không thất thoát dữ liệu
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchEvents} disabled={loading} className="h-9 px-3 text-xs font-semibold gap-1.5 border-slate-200">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </Button>
      </div>

      <Card className="border-slate-200 shadow-2xs bg-white overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Đang tải sự kiện outbox...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 pl-5">Tên Loại Sự kiện</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Thực thể Tổng hợp (Aggregate)</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Mã Khóa Chính (ID)</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Số lần thử lại</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Thời gian tạo</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 text-right pr-5">Trạng thái Xử lý</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {events.map((e) => (
                  <TableRow key={e.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="pl-5 py-3.5 font-bold text-blue-700 font-mono text-xs">
                      {e.eventType}
                    </TableCell>

                    <TableCell className="py-3.5 text-xs font-semibold text-slate-800">
                      {e.aggregateType}
                    </TableCell>

                    <TableCell className="py-3.5 font-mono text-xs text-slate-600">
                      {e.aggregateId}
                    </TableCell>

                    <TableCell className="py-3.5 text-xs text-slate-500">
                      {e.retryCount} lần
                    </TableCell>

                    <TableCell className="py-3.5 text-xs text-slate-400">
                      {e.createdAt}
                    </TableCell>

                    <TableCell className="text-right pr-5 py-3.5">
                      {e.status === 'PROCESSED' ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-xs gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Đã xử lý</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold text-xs gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Đang chờ đẩy</span>
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};
