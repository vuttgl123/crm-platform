import React, { useState, useEffect } from 'react';
import { privacyApi, ConsentItem } from '@/services/api/privacyApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldCheck, RefreshCw, Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';

export const PrivacyConsentPage: React.FC = () => {
  const [consents, setConsents] = useState<ConsentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConsents = () => {
    setLoading(true);
    privacyApi.listConsents().then((data) => {
      setConsents(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchConsents();
  }, []);

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Page Header */}
      <StandardPageHeader
        title="Privacy Consent Management"
        subtitle="Manage opt-in consent records, data processing purposes &amp; revocation trails (GDPR / Decree 13 Compliance)"
        icon={ShieldCheck}
        badgeCount={consents.length}
        badgeLabel="records"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchConsents}
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
            <span className="text-xs font-semibold">Loading privacy consent data...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
                <TableRow className="hover:bg-[#F7F8F9]">
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Data Subject</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Processing Purpose</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Granted / Revoked Timestamp</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Audit IP Address</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3 text-right pr-4">Consent Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consents.map((c) => (
                  <TableRow key={c.id} className="hover:bg-[#F1F2F4] border-b border-[#EBECF0] transition-colors text-xs">
                    <TableCell className="py-2 px-3">
                      <span className="font-semibold text-slate-900 text-xs block">{c.contactName}</span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                        <Mail className="w-3 h-3 text-slate-400" /> {c.email}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 px-3 text-xs text-slate-700 max-w-[300px]">
                      {c.purpose}
                    </TableCell>
                    <TableCell className="py-2 px-3 text-xs text-slate-600 font-mono">
                      <div>Granted: {c.grantedAt}</div>
                      {c.revokedAt && <div className="text-rose-600 font-semibold mt-0.5">Revoked: {c.revokedAt}</div>}
                    </TableCell>
                    <TableCell className="py-2 px-3 font-mono text-[11px] text-slate-500">
                      {c.ipAddress}
                    </TableCell>
                    <TableCell className="text-right pr-4 py-2 px-3">
                      {c.status === 'GRANTED' ? (
                        <Badge variant="outline" className="bg-[#E3FCEF] text-[#006644] border-emerald-300 font-bold text-[10px] gap-1 shadow-none rounded-[3px]">
                          <CheckCircle2 className="w-3 h-3 text-[#006644]" />
                          <span>GRANTED</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-[#FFEBE6] text-[#DE350B] border-rose-200 font-bold text-[10px] gap-1 shadow-none rounded-[3px]">
                          <XCircle className="w-3 h-3 text-[#DE350B]" />
                          <span>REVOKED</span>
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

export default PrivacyConsentPage;
