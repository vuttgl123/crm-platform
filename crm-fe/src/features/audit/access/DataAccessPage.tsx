import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { auditApi, DataAccessLogItem } from '@/services/api/auditApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';
import { StandardFilterBar } from '@/components/common/StandardFilterBar';
import { StandardPagination } from '@/components/common/StandardPagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import {
  Database,
  RefreshCw,
  Download,
  Eye,
  FileSpreadsheet,
  Lock,
} from 'lucide-react';

export const DataAccessPage: React.FC = () => {
  const [dataAccess, setDataAccess] = useState<DataAccessLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await auditApi.listDataAccess();
      setDataAccess(data || []);
    } catch {
      toast.error('Unable to load data access logs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    let list = dataAccess || [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.dataset.toLowerCase().includes(q) ||
          d.accessedBy.toLowerCase().includes(q) ||
          d.reason.toLowerCase().includes(q)
      );
    }
    if (selectedType !== 'ALL') {
      list = list.filter((d) => d.accessType === selectedType);
    }
    return list;
  }, [dataAccess, searchQuery, selectedType]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('ALL');
    setCurrentPage(1);
  };

  // KPI Metrics
  const totalExports = filteredLogs.filter((d) => d.accessType === 'EXPORT').length;
  const totalViews = filteredLogs.filter((d) => d.accessType === 'READ').length;
  const totalRecordsCount = filteredLogs.reduce((sum, d) => sum + (((d as any).recordsCount ?? d.recordCount) || 0), 0);

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedType !== 'ALL' ? 1 : 0);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));

  const paginatedLogs = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredLogs.slice(startIdx, startIdx + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType, pageSize]);

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Page Header */}
      <StandardPageHeader
        title="Data Access &amp; Inspection Audit"
        subtitle="Monitor and audit sensitive record inspections, export events &amp; customer database access trails"
        icon={Database}
        badgeCount={filteredLogs.length}
        badgeLabel="events"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={loading}
            className="text-xs font-medium text-slate-700 bg-white border-slate-200 hover:bg-slate-50 gap-1.5 h-8 rounded-[3px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        }
      />

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-[4px] border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Database className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Total Access Events</div>
            <div className="text-lg font-black text-slate-900 leading-tight">{filteredLogs.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-purple-100 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <Download className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Export Dispatches</div>
            <div className="text-lg font-black text-purple-700 leading-tight">{totalExports}</div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-indigo-100 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <Eye className="w-4.5 h-4.5 text-indigo-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Read Queries</div>
            <div className="text-lg font-black text-indigo-700 leading-tight">{totalViews}</div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-emerald-100 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Total Records Inspected</div>
            <div className="text-lg font-black text-emerald-700 leading-tight">{totalRecordsCount.toLocaleString('en-US')}</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <StandardFilterBar
        searchQuery={searchQuery}
        onSearchChange={(val: string) => { setSearchQuery(val); setCurrentPage(1); }}
        searchPlaceholder="Search by dataset, user, business justification..."
        activeFiltersCount={activeFiltersCount}
        onResetFilters={handleResetFilters}
        filterControls={
          <SearchableSelect
            options={[
              { value: 'ALL', label: 'All Operation Types' },
              { value: 'EXPORT', label: 'Export Data', badge: 'Export' },
              { value: 'READ', label: 'Read Query', badge: 'Read' },
              { value: 'UPDATE', label: 'Update Record', badge: 'Update' },
              { value: 'DELETE', label: 'Delete Record', badge: 'Delete' },
            ]}
            value={selectedType}
            onValueChange={(val: string) => { setSelectedType(val); setCurrentPage(1); }}
            placeholder="All Operations"
            searchPlaceholder="Filter operations..."
            className="w-[180px] h-8 rounded-[3px] text-xs"
          />
        }
      />

      {/* Data Table */}
      <Card className="border border-slate-200 rounded-[4px] bg-white shadow-none overflow-hidden">
        <Table>
          <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
            <TableRow className="hover:bg-[#F7F8F9]">
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Accessed Dataset</TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Accessor User</TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Operation</TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Record Volume</TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Business Justification</TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3 text-right pr-4">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} className="p-6">
                  <EmptyState
                    icon={Database}
                    title="No data access records found"
                    description="No access logs match the specified search and filter criteria."
                  />
                </TableCell>
              </TableRow>
            )}
            {paginatedLogs.map((d) => (
              <TableRow key={d.id} className="hover:bg-[#F1F2F4] border-b border-[#EBECF0] transition-colors text-xs">
                <TableCell className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-900">{d.dataset}</span>
                  </div>
                </TableCell>

                <TableCell className="py-2 px-3 text-slate-700 font-mono text-[11px]">
                  {d.accessedBy}
                </TableCell>

                <TableCell className="py-2 px-3">
                  {d.accessType === 'EXPORT' ? (
                    <Badge variant="outline" className="bg-[#FFEBE6] text-[#DE350B] border-rose-200 text-[10px] font-bold gap-1 rounded-[3px] shadow-none">
                      <Download className="w-2.5 h-2.5" />
                      <span>EXPORT</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-[#E9F2FF] text-[#0C66E4] border-blue-200 text-[10px] font-bold gap-1 rounded-[3px] shadow-none">
                      <Eye className="w-2.5 h-2.5" />
                      <span>READ ({d.accessType})</span>
                    </Badge>
                  )}
                </TableCell>

                <TableCell className="py-2 px-3 font-mono font-semibold text-slate-800">
                  {(((d as any).recordsCount ?? d.recordCount) || 0).toLocaleString('en-US')} records
                </TableCell>

                <TableCell className="py-2 px-3 text-slate-600 max-w-[280px] truncate" title={d.reason}>
                  {d.reason || 'Standard business operation'}
                </TableCell>

                <TableCell className="py-2 px-3 text-right pr-4 text-slate-500 font-mono text-[11px]">
                  {d.timestamp}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Standard Pagination Controls */}
        <StandardPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={filteredLogs.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="records"
        />
      </Card>
    </div>
  );
};

export default DataAccessPage;
