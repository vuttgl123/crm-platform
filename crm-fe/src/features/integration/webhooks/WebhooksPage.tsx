import React, { useState, useEffect } from 'react';
import { integrationApi, WebhookSubscription } from '@/services/api/integrationApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Webhook, RefreshCw, Loader2, Plus, Globe } from 'lucide-react';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';

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
    <div className="space-y-4 pb-12 font-sans w-full">
      <StandardPageHeader
        title="Event Webhook Subscriptions"
        subtitle="Dispatch real-time HTTP POST notifications on CRM entity mutation events to downstream enterprise systems"
        icon={Webhook}
        badgeCount={webhooks.length}
        badgeLabel="endpoints"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchWebhooks}
              disabled={loading}
              className="h-8 px-3 text-xs font-medium text-slate-700 bg-white border-slate-200 hover:bg-slate-50 gap-1.5 rounded-[3px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Button
              size="sm"
              onClick={() => toast.info('Open new Webhook endpoint dialog')}
              className="h-8 px-3 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white gap-1.5 shadow-none rounded-[3px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Webhook Endpoint</span>
            </Button>
          </div>
        }
      />

      <Card className="border border-slate-200 shadow-none bg-white overflow-hidden rounded-[4px]">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Loading Webhook subscriptions...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
                <TableRow className="hover:bg-[#F7F8F9]">
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Webhook Name &amp; Target URL</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Subscribed Events</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Signing Secret</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Delivery Success</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 text-right pr-4">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map((w) => (
                  <TableRow key={w.id} className="hover:bg-[#F1F2F4] border-b border-[#EBECF0] text-xs">
                    <TableCell className="py-2 px-3">
                      <span className="font-semibold text-slate-900 text-xs block">{w.name}</span>
                      <span className="font-mono text-[11px] text-blue-600 flex items-center gap-1 mt-0.5">
                        <Globe className="w-3 h-3 text-slate-400" /> {w.targetUrl}
                      </span>
                    </TableCell>

                    <TableCell className="py-2 px-3">
                      <div className="flex flex-wrap gap-1">
                        {w.events.map((ev) => (
                          <Badge key={ev} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-mono rounded-[2px]">
                            {ev}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell className="py-2 px-3 font-mono text-[11px] text-slate-400">
                      {(w.secretKey || (w as any).secretToken || 'whsec_••••••••').slice(0, 10)}••••••••
                    </TableCell>

                    <TableCell className="py-2 px-3">
                      <span className="text-xs font-bold text-emerald-600 font-mono">{w.successRate}%</span>
                      <span className="text-[10px] text-slate-400 block font-mono">Last: {w.lastTriggeredAt}</span>
                    </TableCell>

                    <TableCell className="text-right pr-4 py-2 px-3">
                      <Badge variant="outline" className="bg-[#E3FCEF] text-[#006644] border-emerald-300 font-bold text-[10px] rounded-[2px] shadow-none">
                        ACTIVE
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

export default WebhooksPage;
