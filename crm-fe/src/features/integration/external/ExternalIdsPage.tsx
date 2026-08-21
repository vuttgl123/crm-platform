import React, { useState, useEffect } from 'react';
import { integrationApi, ExternalIdMapping } from '@/services/api/integrationApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Network, RefreshCw, Loader2 } from 'lucide-react';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';

export const ExternalIdsPage: React.FC = () => {
  const [mappings, setMappings] = useState<ExternalIdMapping[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMappings = () => {
    setLoading(true);
    integrationApi.listExternalIds().then((data) => {
      setMappings(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchMappings();
  }, []);

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      <StandardPageHeader
        title="External ID &amp; Foreign Key Mappings"
        subtitle="Manage cross-system entity foreign keys linking CRM records with SAP ERP, Salesforce, Billing, and Third-Party Systems"
        icon={Network}
        badgeCount={mappings.length}
        badgeLabel="mappings"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMappings}
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
            <span className="text-xs font-semibold">Loading mapping catalog...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
                <TableRow className="hover:bg-[#F7F8F9]">
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Internal CRM Entity</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">External Target System</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">External Foreign Key</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 text-right pr-4">Last Synchronized</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappings.map((m) => (
                  <TableRow key={m.id} className="hover:bg-[#F1F2F4] border-b border-[#EBECF0] text-xs">
                    <TableCell className="py-2 px-3">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-[10px] mr-2 rounded-[2px]">
                        {m.internalEntity}
                      </Badge>
                      <span className="font-mono text-xs font-bold text-slate-900">{m.internalId}</span>
                    </TableCell>

                    <TableCell className="py-2 px-3 text-xs font-medium text-slate-800">
                      {m.systemName}
                    </TableCell>

                    <TableCell className="py-2 px-3 font-mono text-xs font-bold text-purple-700">
                      {m.externalId}
                    </TableCell>

                    <TableCell className="text-right pr-4 py-2 px-3 text-xs text-slate-500 font-mono">
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

export default ExternalIdsPage;
