import React, { useState, useEffect } from 'react';
import { mockIntegrationApi, ExternalIdMapping } from '@/services/mock/mockIntegrationData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Network, RefreshCw, Loader2 } from 'lucide-react';

export const ExternalIdsPage: React.FC = () => {
  const [mappings, setMappings] = useState<ExternalIdMapping[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMappings = () => {
    setLoading(true);
    mockIntegrationApi.listExternalIds().then((data) => {
      setMappings(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchMappings();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Network className="w-7 h-7 text-blue-600" />
            <span>Ánh xạ Mã Định danh Ngoài (External IDs)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Liên kết khóa ngoại (Foreign Keys) giữa CRM và các hệ thống SAP ERP, Salesforce, Zalo OA
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchMappings} disabled={loading} className="h-9 px-3 text-xs font-semibold gap-1.5 border-slate-200">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </Button>
      </div>

      <Card className="border-slate-200 shadow-2xs bg-white overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Đang tải bảng ánh xạ...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 pl-5">Thực thể CRM Nội bộ</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Hệ thống Đối tác / Bên thứ ba</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Mã ID Ngoại (External ID)</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 text-right pr-5">Lần đồng bộ gần nhất</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {mappings.map((m) => (
                  <TableRow key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="pl-5 py-3.5">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-xs mr-2">
                        {m.internalEntity}
                      </Badge>
                      <span className="font-mono text-xs font-bold text-slate-900">{m.internalId}</span>
                    </TableCell>

                    <TableCell className="py-3.5 text-xs font-semibold text-slate-800">
                      {m.systemName}
                    </TableCell>

                    <TableCell className="py-3.5 font-mono text-xs font-bold text-purple-700">
                      {m.externalId}
                    </TableCell>

                    <TableCell className="text-right pr-5 py-3.5 text-xs text-slate-400">
                      {m.lastSyncedAt}
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
