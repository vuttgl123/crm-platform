import React, { useState, useEffect } from 'react';
import { integrationApi, WebhookSubscription } from '@/services/api/integrationApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Webhook, RefreshCw, Loader2, Plus, Globe } from 'lucide-react';

export const WebhooksPage: React.FC = () => {
  const [webhooks, setWebhooks] = useState<WebhookSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWebhooks = () => {
    setLoading(true);
    integrationApi.listWebhooks().then((data) => {
      setWebhooks(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Webhook className="w-7 h-7 text-blue-600" />
            <span>Đăng ký Webhook Sự kiện (Webhooks)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gửi tín hiệu HTTP POST theo thời gian thực khi có sự kiện thay đổi dữ liệu CRM tới hệ thống bên ngoài
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={fetchWebhooks} disabled={loading} className="h-9 px-3 text-xs font-semibold gap-1.5 border-slate-200">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>
          <Button size="sm" onClick={() => toast.info('Mở hộp thoại tạo Webhook endpoint mới')} className="h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Tạo Webhook Mới</span>
          </Button>
        </div>
      </div>

      <Card className="border-slate-200 shadow-2xs bg-white overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Đang tải danh sách Webhooks...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 pl-5">Tên Webhook & URL Đích</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Sự kiện lắng nghe</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Khóa bí mật (Secret)</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Tỷ lệ phân phối thành công</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 text-right pr-5">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {webhooks.map((w) => (
                  <TableRow key={w.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="pl-5 py-3.5">
                      <span className="font-bold text-slate-900 text-xs block">{w.name}</span>
                      <span className="font-mono text-[11px] text-blue-600 flex items-center gap-1 mt-0.5">
                        <Globe className="w-3 h-3 text-slate-400" /> {w.targetUrl}
                      </span>
                    </TableCell>

                    <TableCell className="py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {w.events.map((ev) => (
                          <Badge key={ev} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-mono">
                            {ev}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 font-mono text-[11px] text-slate-400">
                      {(w.secretKey || (w as any).secretToken || 'whsec_••••••••').slice(0, 10)}••••••••
                    </TableCell>

                    <TableCell className="py-3.5">
                      <span className="text-xs font-bold text-emerald-600">{w.successRate}%</span>
                      <span className="text-[10px] text-slate-400 block">Lần cuối: {w.lastTriggeredAt}</span>
                    </TableCell>

                    <TableCell className="text-right pr-5 py-3.5">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-xs">
                        Đang hoạt động
                      </Badge>
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
