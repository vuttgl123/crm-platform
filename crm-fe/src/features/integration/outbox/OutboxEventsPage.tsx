import React, { useState, useEffect } from 'react';
import { integrationApi, OutboxEventItem } from '@/services/api/integrationApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Send, RefreshCw, Loader2, CheckCircle2, Clock } from 'lucide-react';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';

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
    <div className="space-y-4 pb-12 font-sans w-full">
      <StandardPageHeader
        title="Transactional Outbox Event Stream"
        subtitle="Monitor reliable asynchronous event dispatch pipeline ensuring exactly-once and zero data loss semantics"
        icon={Send}
        badgeCount={events.length}
        badgeLabel="events"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEvents}
            disabled={loading}
            className="h-8 px-3 text-xs font-medium text-slate-700 bg-white border-slate-200 hover:bg-slate-50 gap-1.5 rounded-[3px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        }
      />

      <Card className="border border-slate-200 shadow-none bg-white overflow-hidden rounded-[4px]">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Loading outbox events stream...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
                <TableRow className="hover:bg-[#F7F8F9]">
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Event Type</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Aggregate Entity</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Aggregate ID</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Retry Count</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Created At</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 text-right pr-4">Processing Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((e) => (
                  <TableRow key={e.id} className="hover:bg-[#F1F2F4] border-b border-[#EBECF0] text-xs">
                    <TableCell className="py-2 px-3 font-bold text-blue-700 font-mono text-xs">
                      {e.eventType}
                    </TableCell>

                    <TableCell className="py-2 px-3 font-semibold text-slate-800">
                      {e.aggregateType}
                    </TableCell>

                    <TableCell className="py-2 px-3 font-mono text-xs text-slate-600">
                      {e.aggregateId}
                    </TableCell>

                    <TableCell className="py-2 px-3 font-mono text-slate-500">
                      {e.retryCount} retries
                    </TableCell>

                    <TableCell className="py-2 px-3 text-xs text-slate-500 font-mono">
                      {e.createdAt}
                    </TableCell>

                    <TableCell className="text-right pr-4 py-2 px-3">
                      {e.status === 'PROCESSED' ? (
                        <Badge variant="outline" className="bg-[#E3FCEF] text-[#006644] border-emerald-300 font-bold text-[10px] gap-1 rounded-[2px] shadow-none">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>PROCESSED</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-[#FFFAE6] text-[#974F0C] border-amber-200 font-bold text-[10px] gap-1 rounded-[2px] shadow-none">
                          <Clock className="w-3 h-3" />
                          <span>PENDING</span>
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

export default OutboxEventsPage;
