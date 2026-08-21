import React, { useState, useEffect } from 'react';
import { integrationApi, DataImportJob } from '@/services/api/integrationApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { UploadCloud, RefreshCw, Loader2, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';

export const DataImportPage: React.FC = () => {
  const [jobs, setJobs] = useState<DataImportJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = () => {
    setLoading(true);
    integrationApi.listImportJobs().then((data) => {
      setJobs(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      <StandardPageHeader
        title="Bulk Data Import"
        subtitle="Upload Excel / CSV datasets to batch import accounts, contacts, products, and commercial opportunities"
        icon={UploadCloud}
        badgeCount={jobs.length}
        badgeLabel="jobs"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchJobs}
              disabled={loading}
              className="h-8 px-3 text-xs font-medium text-slate-700 bg-white border-slate-200 hover:bg-slate-50 gap-1.5 rounded-[3px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Button
              size="sm"
              onClick={() => toast.info('Open Excel / CSV upload dialog')}
              className="h-8 px-3 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white gap-1.5 shadow-none rounded-[3px]"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload New File</span>
            </Button>
          </div>
        }
      />

      {/* Upload Zone Preview */}
      <Card className="border-dashed border-2 border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer rounded-[4px]">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-blue-100/80 text-blue-600 flex items-center justify-center mb-2">
            <UploadCloud className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-slate-800">Drag &amp; drop Excel (.xlsx, .xls) or CSV files here</h3>
          <p className="text-[11px] text-slate-400 mt-1">Supports up to 50,000 records per upload batch. Maximum file size: 25MB.</p>
        </CardContent>
      </Card>

      {/* Table of Past Import Jobs */}
      <Card className="border border-slate-200 shadow-none bg-white overflow-hidden rounded-[4px]">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Loading import history...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
                <TableRow className="hover:bg-[#F7F8F9]">
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">File Name</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Target Entity</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Total Rows</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Success / Errors</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Uploaded By &amp; Timestamp</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 text-right pr-4">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((j) => (
                  <TableRow key={j.id} className="hover:bg-[#F1F2F4] border-b border-[#EBECF0] text-xs">
                    <TableCell className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-slate-900 text-xs">{j.fileName}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-2 px-3">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-semibold text-[10px] rounded-[2px]">
                        {j.targetEntity}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-2 px-3 text-xs font-mono font-bold text-slate-800">
                      {j.totalRows.toLocaleString()} Rows
                    </TableCell>

                    <TableCell className="py-2 px-3 font-mono">
                      <span className="text-xs font-bold text-emerald-600">{j.successRows} success</span>
                      {j.failedRows > 0 && (
                        <span className="text-xs font-bold text-rose-600 ml-2">({j.failedRows} errors)</span>
                      )}
                    </TableCell>

                    <TableCell className="py-2 px-3 text-xs text-slate-600">
                      <div className="font-medium text-slate-800">{j.uploadedBy}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{j.uploadedAt}</div>
                    </TableCell>

                    <TableCell className="text-right pr-4 py-2 px-3">
                      <Badge variant="outline" className="bg-[#E3FCEF] text-[#006644] border-emerald-300 font-bold text-[10px] gap-1 rounded-[2px] shadow-none">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>COMPLETED</span>
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

export default DataImportPage;
