import React, { useState, useEffect } from 'react';
import { privacyApi, RetentionPolicyItem } from '@/services/api/privacyApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Archive, RefreshCw, Loader2, Calendar } from 'lucide-react';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';

export const RetentionPoliciesPage: React.FC = () => {
  const [policies, setPolicies] = useState<RetentionPolicyItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPolicies = () => {
    setLoading(true);
    privacyApi.listRetentionPolicies().then((data) => {
      setPolicies(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Page Header */}
      <StandardPageHeader
        title="Data Retention &amp; Disposal Policies"
        subtitle="Configure data retention lifecycle rules, automatic compression archiving &amp; expiry anonymization"
        icon={Archive}
        badgeCount={policies.length}
        badgeLabel="policies"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPolicies}
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
            <span className="text-xs font-semibold">Loading retention policies...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
                <TableRow className="hover:bg-[#F7F8F9]">
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Target Data Entity</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Retention Period</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Action Upon Expiry</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Last Scheduled Scan</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3 text-right pr-4">Enforcement Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((p) => (
                  <TableRow key={p.id} className="hover:bg-[#F1F2F4] border-b border-[#EBECF0] transition-colors text-xs">
                    <TableCell className="py-2 px-3 font-semibold text-slate-900 text-xs">
                      {p.dataType}
                    </TableCell>
                    <TableCell className="py-2 px-3 text-xs font-bold text-blue-700 font-mono">
                      {p.durationYears} {p.durationYears === 1 ? 'Year' : 'Years'}
                    </TableCell>
                    <TableCell className="py-2 px-3">
                      {p.actionAfterExpiry === 'ARCHIVE' && (
                        <Badge variant="outline" className="bg-[#EAE6FF] text-[#403294] border-purple-200 font-bold text-[10px] rounded-[3px]">
                          ARCHIVE &amp; COMPRESS
                        </Badge>
                      )}
                      {p.actionAfterExpiry === 'PERMANENT_DELETE' && (
                        <Badge variant="outline" className="bg-[#FFEBE6] text-[#DE350B] border-rose-200 font-bold text-[10px] rounded-[3px]">
                          PERMANENT PURGE
                        </Badge>
                      )}
                      {p.actionAfterExpiry === 'ANONYMIZE' && (
                        <Badge variant="outline" className="bg-[#FFFAE6] text-[#974F0C] border-amber-200 font-bold text-[10px] rounded-[3px]">
                          ANONYMIZE
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-2 px-3 text-xs text-slate-500 font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.lastRunDate}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-4 py-2 px-3">
                      <Badge variant="outline" className="bg-[#E3FCEF] text-[#006644] border-emerald-300 font-bold text-[10px] rounded-[3px]">
                        ACTIVE ENFORCEMENT
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

export default RetentionPoliciesPage;
