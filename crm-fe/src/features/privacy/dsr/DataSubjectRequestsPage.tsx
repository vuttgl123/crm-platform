import React, { useState, useEffect } from 'react';
import { privacyApi, DsrItem } from '@/services/api/privacyApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserCheck, RefreshCw, Loader2, CheckCircle2, Clock, Mail } from 'lucide-react';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';

export const DataSubjectRequestsPage: React.FC = () => {
  const [dsrList, setDsrList] = useState<DsrItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDsr = () => {
    setLoading(true);
    privacyApi.listDsr().then((data) => {
      setDsrList(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchDsr();
  }, []);

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Page Header */}
      <StandardPageHeader
        title="Data Subject Access Requests (DSAR)"
        subtitle="Manage customer data portability exports, record corrections &amp; right to be forgotten (Erasure) requests"
        icon={UserCheck}
        badgeCount={dsrList.length}
        badgeLabel="requests"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDsr}
            disabled={loading}
            className="h-8 px-3 text-xs font-medium text-slate-700 bg-white border-slate-200 hover:bg-slate-50 gap-1.5 rounded-[3px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        }
      />

      <Card className="border border-slate-200 shadow-none bg-white rounded-[4px] overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Loading data subject requests...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
                <TableRow className="hover:bg-[#F7F8F9]">
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Ticket ID &amp; Requester</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Request Type</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Received Date</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Completed Date</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3 text-right pr-4">Fulfillment Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dsrList.map((d) => (
                  <TableRow key={d.id} className="hover:bg-[#F1F2F4] border-b border-[#EBECF0] transition-colors text-xs">
                    <TableCell className="py-2 px-3">
                      <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-[2px] border border-blue-200 inline-block mb-1">
                        {d.ticketNumber}
                      </span>
                      <span className="font-semibold text-slate-900 text-xs block">{d.requesterName}</span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                        <Mail className="w-3 h-3 text-slate-400" /> {d.email}
                      </span>
                    </TableCell>

                    <TableCell className="py-2 px-3">
                      {d.requestType === 'EXPORT_DATA' && (
                        <Badge variant="outline" className="bg-[#E9F2FF] text-[#0C66E4] border-blue-200 font-bold text-[10px] rounded-[3px]">
                          DATA EXPORT
                        </Badge>
                      )}
                      {d.requestType === 'ERASURE' && (
                        <Badge variant="outline" className="bg-[#FFEBE6] text-[#DE350B] border-rose-200 font-bold text-[10px] rounded-[3px]">
                          RIGHT TO ERASURE
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="py-2 px-3 text-xs text-slate-600 font-mono">
                      {d.requestedAt}
                    </TableCell>

                    <TableCell className="py-2 px-3 text-xs text-slate-600 font-mono">
                      {d.completedAt || '—'}
                    </TableCell>

                    <TableCell className="text-right pr-4 py-2 px-3">
                      {d.status === 'COMPLETED' ? (
                        <Badge variant="outline" className="bg-[#E3FCEF] text-[#006644] border-emerald-300 font-bold text-[10px] gap-1 shadow-none rounded-[3px]">
                          <CheckCircle2 className="w-3 h-3 text-[#006644]" />
                          <span>COMPLETED</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-[#FFFAE6] text-[#974F0C] border-amber-200 font-bold text-[10px] gap-1 shadow-none rounded-[3px]">
                          <Clock className="w-3 h-3 text-[#974F0C]" />
                          <span>IN REVIEW</span>
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

export default DataSubjectRequestsPage;
