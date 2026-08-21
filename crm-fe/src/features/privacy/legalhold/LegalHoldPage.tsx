import React, { useState, useEffect } from 'react';
import { privacyApi, LegalHoldItem } from '@/services/api/privacyApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Scale, RefreshCw, Loader2, Lock } from 'lucide-react';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';

export const LegalHoldPage: React.FC = () => {
  const [holds, setHolds] = useState<LegalHoldItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHolds = () => {
    setLoading(true);
    privacyApi.listLegalHolds().then((data) => {
      setHolds(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchHolds();
  }, []);

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Page Header */}
      <StandardPageHeader
        title="Litigation &amp; Legal Hold Registry"
        subtitle="Freeze and preserve data records for regulatory compliance, litigation evidence &amp; statutory audits"
        icon={Scale}
        badgeCount={holds.length}
        badgeLabel="holds"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHolds}
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
            <span className="text-xs font-semibold">Loading legal hold orders...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
                <TableRow className="hover:bg-[#F7F8F9]">
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Matter Number &amp; Case</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Legal Custodian</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Preserved Data Scope</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Issued Date</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3 text-right pr-4">Hold Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holds.map((h) => (
                  <TableRow key={h.id} className="hover:bg-[#F1F2F4] border-b border-[#EBECF0] transition-colors text-xs">
                    <TableCell className="py-2 px-3">
                      <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-[2px] border border-purple-200 inline-block mb-1">
                        {h.matterNumber}
                      </span>
                      <span className="font-semibold text-slate-900 text-xs block">{h.caseName}</span>
                    </TableCell>

                    <TableCell className="py-2 px-3 text-xs font-semibold text-slate-800">
                      {h.custodian}
                    </TableCell>

                    <TableCell className="py-2 px-3 text-xs text-slate-600 max-w-[300px]">
                      {h.scope}
                    </TableCell>

                    <TableCell className="py-2 px-3 text-xs text-slate-500 font-mono">
                      {h.createdAt}
                    </TableCell>

                    <TableCell className="text-right pr-4 py-2 px-3">
                      <Badge variant="outline" className="bg-[#FFEBE6] text-[#DE350B] border-rose-200 font-bold text-[10px] gap-1 shadow-none rounded-[3px]">
                        <Lock className="w-3 h-3 text-[#DE350B]" />
                        <span>FROZEN</span>
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

export default LegalHoldPage;
