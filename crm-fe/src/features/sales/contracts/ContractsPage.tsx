import React, { useState, useEffect, useCallback } from 'react';
import {
  contractApi,
  ContractItem,
  ContractStatus,
  CONTRACT_STATUS_CONFIG,
} from '@/services/api/contractApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/common/EmptyState';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { ActionTooltip } from '@/components/ui/action-tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { DocumentPreviewModal } from '@/features/sales/templates/DocumentPreviewModal';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';
import { StandardFilterBar, ViewTabItem } from '@/components/common/StandardFilterBar';
import { StandardPagination } from '@/components/common/StandardPagination';
import {
  FileCheck,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Loader2,
  DollarSign,
  Building2,
  Calendar,
  ShieldCheck,
  Printer,
} from 'lucide-react';

export const ContractsPage: React.FC = () => {
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [previewContract, setPreviewContract] = useState<ContractItem | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<ContractItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [contractNumber, setContractNumber] = useState('');
  const [title, setTitle] = useState('');
  const [accountName, setAccountName] = useState('');
  const [contractValue, setContractValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<ContractStatus>('ACTIVE');
  const [signedByCustomer, setSignedByCustomer] = useState('');
  const [assignedTo, setAssignedTo] = useState('Alex Nguyen');

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await contractApi.list({
        search: searchQuery,
        status: selectedStatus,
        page,
        size: pageSize,
      });
      setContracts(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch {
      toast.error('Unable to load contracts list from server');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedStatus, page, pageSize]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setPage(0);
    fetchContracts();
  };

  const handleOpenCreate = () => {
    setEditingContract(null);
    setContractNumber(`CT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setTitle('');
    setAccountName('');
    setContractValue('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]);
    setStatus('ACTIVE');
    setSignedByCustomer('');
    setAssignedTo('Alex Nguyen');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: ContractItem) => {
    setEditingContract(c);
    setContractNumber(c.contractNumber);
    setTitle(c.title);
    setAccountName(c.accountName || '');
    setContractValue(c.contractValue ? c.contractValue.toString() : '');
    setStartDate(c.startDate ? c.startDate.split('T')[0] : '');
    setEndDate(c.endDate ? c.endDate.split('T')[0] : '');
    setStatus(c.status);
    setSignedByCustomer(c.signedByCustomer || '');
    setAssignedTo(c.assignedTo || '');
    setIsModalOpen(true);
  };

  const handleSaveContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contractNumber.trim() || !contractValue) {
      toast.error('Please specify Contract Number, Title and Contract Value');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingContract) {
        await contractApi.update(editingContract.id, {
          version: editingContract.version || 1,
          contractNumber,
          title,
          contractValue: Number(contractValue) || 0,
          totalValue: Number(contractValue) || 0,
          startDate,
          endDate,
          status,
          signedByCustomer,
          assignedTo,
        });
        toast.success('Contract updated successfully!');
      } else {
        await contractApi.create({
          contractNumber,
          title,
          accountId: 'acc-custom',
          contractValue: Number(contractValue) || 0,
          totalValue: Number(contractValue) || 0,
          startDate,
          endDate,
          status,
          signedByCustomer,
          assignedTo,
        });
        toast.success('New legal contract created successfully!');
      }
      setIsModalOpen(false);
      fetchContracts();
    } catch {
      toast.error('Unable to save contract details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, num: string) => {
    if (!window.confirm(`Are you sure you want to delete contract "${num}"?`)) return;
    try {
      await contractApi.delete(id);
      toast.success(`Deleted contract "${num}"`);
      fetchContracts();
    } catch {
      toast.error('Unable to delete contract');
    }
  };

  // Metrics
  const activeCount = contracts.filter((c) => c.status === 'ACTIVE').length;
  const totalContractVal = contracts.reduce((sum, c) => sum + (c.contractValue || 0), 0);

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedStatus !== 'ALL' ? 1 : 0);

  // View Tabs Config
  const viewTabs: ViewTabItem[] = [
    { id: 'ALL', label: 'All Contracts', count: totalElements },
    { id: 'ACTIVE', label: 'Active', count: activeCount, icon: ShieldCheck, dotColor: 'bg-emerald-500' },
  ];

  const currentActiveTab = selectedStatus === 'ACTIVE' ? 'ACTIVE' : 'ALL';

  const handleTabChange = (tabId: string) => {
    if (tabId === 'ACTIVE') {
      setSelectedStatus('ACTIVE');
    } else {
      setSelectedStatus('ALL');
    }
    setPage(0);
  };

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Page Header */}
      <StandardPageHeader
        title="Commercial Contracts &amp; Legal"
        subtitle="Manage master services agreements, licensing terms, renewal schedules &amp; compliance status"
        icon={FileCheck}
        badgeCount={totalElements}
        badgeLabel="contracts"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchContracts}
              disabled={loading}
              className="text-xs font-medium text-slate-700 bg-white border-slate-200 hover:bg-slate-50 gap-1.5 h-8 rounded-[3px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>

            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white gap-1.5 shadow-none h-8 rounded-[3px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Contract</span>
            </Button>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-[4px] border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <FileCheck className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Total Contracts</div>
            <div className="text-lg font-black text-slate-900 leading-tight">{totalElements}</div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-emerald-100 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Active Agreements</div>
            <div className="text-lg font-black text-emerald-700 leading-tight">{activeCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-indigo-100 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <DollarSign className="w-4.5 h-4.5 text-indigo-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Total Contract Value</div>
            <div className="text-lg font-black text-indigo-700 leading-tight">
              {(totalContractVal / 1_000_000).toFixed(0)}M VND
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-purple-100 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <Calendar className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Standard Term</div>
            <div className="text-lg font-black text-purple-700 leading-tight">12 Months</div>
          </div>
        </div>
      </div>

      {/* Standard Filter Bar */}
      <StandardFilterBar
        searchQuery={searchQuery}
        onSearchChange={(val) => { setSearchQuery(val); setPage(0); }}
        searchPlaceholder="Search contract code, title, client..."
        viewTabs={viewTabs}
        activeTab={currentActiveTab}
        onTabChange={handleTabChange}
        activeFiltersCount={activeFiltersCount}
        onResetFilters={handleResetFilters}
        filterControls={
          <div className="w-44">
            <Select value={selectedStatus} onValueChange={(val) => { setSelectedStatus(val); setPage(0); }}>
              <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                <SelectValue placeholder="Contract Status" />
              </SelectTrigger>
              <SelectContent className="rounded-[3px]">
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="DRAFT">DRAFT</SelectItem>
                <SelectItem value="EXPIRED">EXPIRED</SelectItem>
                <SelectItem value="TERMINATED">TERMINATED</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* Contracts Table */}
      <Card className="overflow-hidden border border-slate-200 rounded-[4px] bg-white shadow-none">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F7F8F9] border-b border-slate-200 hover:bg-[#F7F8F9]">
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Contract Code &amp; Title</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Client Organization</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Contract Value</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Effective Term</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Status</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3 text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-xs">Loading contracts...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : contracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <EmptyState
                      icon={FileCheck}
                      title="No contracts found"
                      description="Try adjusting your filter criteria or register a new legal contract."
                      actionLabel="Create Contract"
                      onAction={handleOpenCreate}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                contracts.map((c) => {
                  const statusObj = CONTRACT_STATUS_CONFIG[c.status] || { label: c.status, className: 'bg-slate-100 text-slate-700' };

                  return (
                    <TableRow key={c.id} className="hover:bg-[#F1F2F4] transition-colors border-b border-[#EBECF0] text-xs">
                      {/* Code & Title */}
                      <TableCell className="py-2 px-3">
                        <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 inline-block mb-0.5">
                          {c.contractNumber}
                        </span>
                        <div className="font-semibold text-slate-900">{c.title}</div>
                      </TableCell>

                      {/* Account */}
                      <TableCell className="py-2 px-3">
                        <div className="font-medium text-slate-800 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{c.accountName}</span>
                        </div>
                        {c.signedByCustomer && (
                          <div className="text-[11px] text-slate-400 mt-0.5">Signatory: {c.signedByCustomer}</div>
                        )}
                      </TableCell>

                      {/* Value */}
                      <TableCell className="py-2 px-3">
                        <div className="font-semibold text-slate-900 font-mono text-xs">
                          {(c.contractValue || 0).toLocaleString('en-US')} ₫
                        </div>
                        <div className="text-[11px] text-slate-400">Rep: {c.assignedTo}</div>
                      </TableCell>

                      {/* Term */}
                      <TableCell className="py-2 px-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.startDate} → {c.endDate}</span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-2 px-3">
                        <Badge className={`text-[10px] font-bold rounded-[3px] ${statusObj.className}`}>
                          {statusObj.label}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-2 px-3 text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <ActionTooltip label="Print Preview & PDF Export">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setPreviewContract(c);
                                setShowPrintModal(true);
                              }}
                              className="h-7 w-7 rounded-[3px] text-[#0C66E4] hover:text-[#0052CC] hover:bg-[#E9F2FF]"
                              aria-label="Print Preview & PDF Export"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </Button>
                          </ActionTooltip>
                          <ActionTooltip label="Edit Contract">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(c)}
                              className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-[#0C66E4] hover:bg-[#E9F2FF]"
                              aria-label="Edit Contract"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          </ActionTooltip>
                          <ActionTooltip label="Delete Contract">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(c.id, c.contractNumber)}
                              className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-red-600 hover:bg-red-50"
                              aria-label="Delete Contract"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </ActionTooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Standard Pagination Bar */}
        {!loading && (
          <StandardPagination
            currentPage={page + 1}
            totalPages={Math.max(totalPages, 1)}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p - 1)}
            itemLabel="contracts"
          />
        )}
      </Card>

      {/* Create / Edit Contract Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border border-slate-200 shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <FileCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingContract ? 'Edit Contract Details' : 'Create New Legal Contract'}
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    {editingContract ? `Contract ID: ${editingContract.contractNumber}` : 'Register master contract terms, signatories & validity dates'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveContract} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Contract Number <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  placeholder="e.g. CT-2026/ACME-01"
                  value={contractNumber}
                  onChange={(e) => setContractNumber(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Total Contract Value (VND) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  type="number"
                  placeholder="500,000,000"
                  value={contractValue}
                  onChange={(e) => setContractValue(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">
                Contract Title <span className="text-rose-500">*</span>
              </Label>
              <Input
                required
                placeholder="e.g. Master Services & Enterprise Cloud SLA Agreement"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-9 text-xs border-slate-200 mt-1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Client Organization</Label>
                <Input
                  placeholder="e.g. Acme Corporation"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Customer Signatory</Label>
                <Input
                  placeholder="e.g. David Harrison (Managing Director)"
                  value={signedByCustomer}
                  onChange={(e) => setSignedByCustomer(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Effective Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Expiration End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Contract Status</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                    <SelectItem value="DRAFT">DRAFT</SelectItem>
                    <SelectItem value="EXPIRED">EXPIRED</SelectItem>
                    <SelectItem value="TERMINATED">TERMINATED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Assigned Contract Representative</Label>
              <Input
                placeholder="Alex Nguyen"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="h-9 text-xs border-slate-200 mt-1"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="text-xs border-slate-200 h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs h-9"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>{editingContract ? 'Save Changes' : 'Create Contract'}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Printable Document Modal */}
      {previewContract && (
        <DocumentPreviewModal
          open={showPrintModal}
          onClose={() => {
            setShowPrintModal(false);
            setPreviewContract(null);
          }}
          documentType="CONTRACT"
          documentNumber={previewContract.contractNumber}
          documentDate={previewContract.startDate || new Date().toLocaleDateString('en-US')}
          validUntilDate={previewContract.endDate || undefined}
          clientName={previewContract.accountName || ''}
          clientRepresentative={previewContract.signedByCustomer || ''}
          items={[
            {
              name: previewContract.title,
              quantity: 1,
              unit: 'Contract Term',
              unitPrice: previewContract.contractValue || previewContract.totalValue || 0,
              discountAmount: 0,
              totalAmount: previewContract.contractValue || previewContract.totalValue || 0,
            },
          ]}
          subtotal={previewContract.contractValue || previewContract.totalValue || 0}
          grandTotal={previewContract.contractValue || previewContract.totalValue || 0}
        />
      )}
    </div>
  );
};

export default ContractsPage;
