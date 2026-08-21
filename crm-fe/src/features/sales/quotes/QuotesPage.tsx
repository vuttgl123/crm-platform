import React, { useState, useEffect, useCallback } from 'react';
import {
  quoteApi,
  QuoteItem,
  QuoteStatus,
  QUOTE_STATUS_CONFIG,
} from '@/services/api/quoteApi';
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
  FileText,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Loader2,
  DollarSign,
  Building2,
  CheckCircle2,
  Send,
  Printer,
} from 'lucide-react';

export const QuotesPage: React.FC = () => {
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [previewQuote, setPreviewQuote] = useState<QuoteItem | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<QuoteItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [accountName, setAccountName] = useState('');
  const [contactName, setContactName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [discountPercent, setDiscountPercent] = useState('0');
  const [status, setStatus] = useState<QuoteStatus>('SENT');
  const [validUntil, setValidUntil] = useState('');
  const [assignedTo, setAssignedTo] = useState('Alex Nguyen');

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await quoteApi.list({
        search: searchQuery,
        status: selectedStatus,
        page,
        size: pageSize,
      });
      setQuotes(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch {
      toast.error('Unable to load quotations list from server');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedStatus, page, pageSize]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setPage(0);
    fetchQuotes();
  };

  const handleOpenCreate = () => {
    setEditingQuote(null);
    setTitle('');
    setAccountName('');
    setContactName('');
    setTotalAmount('');
    setDiscountPercent('0');
    setStatus('DRAFT');
    setValidUntil(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
    setAssignedTo('Alex Nguyen');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (quote: QuoteItem) => {
    setEditingQuote(quote);
    setTitle(quote.title || '');
    setAccountName(quote.accountName || '');
    setContactName(quote.contactName || '');
    setTotalAmount(quote.totalAmount ? quote.totalAmount.toString() : '');
    setDiscountPercent(quote.discountAmount && quote.totalAmount ? Math.round((quote.discountAmount / quote.totalAmount) * 100).toString() : '0');
    setStatus(quote.status);
    setValidUntil(quote.validUntil ? quote.validUntil.split('T')[0] : '');
    setAssignedTo(quote.assignedTo || '');
    setIsModalOpen(true);
  };

  const handleSaveQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !totalAmount) {
      toast.error('Please enter Quotation Title and Total Amount');
      return;
    }

    setIsSubmitting(true);
    const tAmount = parseFloat(totalAmount);
    try {
      if (editingQuote) {
        await quoteApi.update(editingQuote.id, {
          version: editingQuote.version || 1,
          title,
          accountName,
          contactName,
          totalAmount: tAmount,
          status,
          validUntil,
          assignedTo,
        });
        toast.success('Quotation updated successfully!');
      } else {
        await quoteApi.create({
          title,
          accountId: 'acc-custom',
          accountName: accountName || 'Commercial Client',
          contactName: contactName || 'Authorized Contact',
          totalAmount: tAmount,
          status,
          validUntil: validUntil || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          assignedTo: assignedTo || 'Alex Nguyen',
        });
        toast.success('New quotation created successfully!');
      }
      setIsModalOpen(false);
      fetchQuotes();
    } catch {
      toast.error('Unable to save quotation details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete quotation "${name}"?`)) return;
    try {
      await quoteApi.delete(id);
      toast.success(`Deleted quotation "${name}"`);
      fetchQuotes();
    } catch {
      toast.error('Unable to delete quotation');
    }
  };

  // KPI Metrics
  const totalQuoteValue = quotes.reduce((sum, q) => sum + (q.totalAmount || 0), 0);
  const acceptedList = quotes.filter((q) => q.status === 'ACCEPTED');
  const acceptedValue = acceptedList.reduce((sum, q) => sum + (q.totalAmount || 0), 0);
  const sentCount = quotes.filter((q) => q.status === 'SENT').length;

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedStatus !== 'ALL' ? 1 : 0);

  // View Tabs Config
  const viewTabs: ViewTabItem[] = [
    { id: 'ALL', label: 'All', count: totalElements },
    { id: 'SENT', label: 'Sent to Client', count: sentCount, icon: Send, dotColor: 'bg-purple-500' },
    { id: 'ACCEPTED', label: 'Accepted', count: acceptedList.length, icon: CheckCircle2, dotColor: 'bg-emerald-500' },
  ];

  const currentActiveTab = selectedStatus === 'SENT' ? 'SENT' : selectedStatus === 'ACCEPTED' ? 'ACCEPTED' : 'ALL';

  const handleTabChange = (tabId: string) => {
    if (tabId === 'SENT') {
      setSelectedStatus('SENT');
    } else if (tabId === 'ACCEPTED') {
      setSelectedStatus('ACCEPTED');
    } else {
      setSelectedStatus('ALL');
    }
    setPage(0);
  };

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Page Header */}
      <StandardPageHeader
        title="Sales Quotations (CPQ)"
        subtitle="Configure commercial proposals, pricing terms, volume discounts &amp; multi-tier approvals"
        icon={FileText}
        badgeCount={totalElements}
        badgeLabel="quotes"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchQuotes}
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
              <span>New Quotation</span>
            </Button>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-[4px] border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <FileText className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Total Quotes</div>
            <div className="text-lg font-black text-slate-900 leading-tight">{totalElements}</div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-indigo-100 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <DollarSign className="w-4.5 h-4.5 text-indigo-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Gross Quoted Value</div>
            <div className="text-lg font-black text-indigo-700 leading-tight">
              {(totalQuoteValue / 1_000_000).toFixed(0)}M VND
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-emerald-100 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Accepted Value</div>
            <div className="text-lg font-black text-emerald-700 leading-tight">
              {(acceptedValue / 1_000_000).toFixed(0)}M VND
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-purple-100 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <Send className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Sent to Clients</div>
            <div className="text-lg font-black text-purple-700 leading-tight">{sentCount}</div>
          </div>
        </div>
      </div>

      {/* Standard Filter Bar */}
      <StandardFilterBar
        searchQuery={searchQuery}
        onSearchChange={(val) => { setSearchQuery(val); setPage(0); }}
        searchPlaceholder="Search quotation title, code, account name..."
        viewTabs={viewTabs}
        activeTab={currentActiveTab}
        onTabChange={handleTabChange}
        activeFiltersCount={activeFiltersCount}
        onResetFilters={handleResetFilters}
        filterControls={
          <div className="w-48">
            <Select value={selectedStatus} onValueChange={(val) => { setSelectedStatus(val); setPage(0); }}>
              <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-[3px]">
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="DRAFT">DRAFT</SelectItem>
                <SelectItem value="SENT">SENT</SelectItem>
                <SelectItem value="ACCEPTED">ACCEPTED</SelectItem>
                <SelectItem value="REJECTED">REJECTED</SelectItem>
                <SelectItem value="EXPIRED">EXPIRED</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* Quotes Table */}
      <Card className="overflow-hidden border border-slate-200 rounded-[4px] bg-white shadow-none">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F7F8F9] border-b border-slate-200 hover:bg-[#F7F8F9]">
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Quotation &amp; Code</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Client Organization</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Total Value</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Discount</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Status</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Valid Until</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3 text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-xs">Loading quotations...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : quotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <EmptyState
                      icon={FileText}
                      title="No quotations found"
                      description="Try adjusting your filter criteria or generate a new CPQ proposal."
                      actionLabel="Create Quotation"
                      onAction={handleOpenCreate}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                quotes.map((quote) => {
                  const statusInfo = QUOTE_STATUS_CONFIG[quote.status] || { label: quote.status, className: 'bg-slate-100 text-slate-700' };

                  return (
                    <TableRow key={quote.id} className="hover:bg-[#F1F2F4] transition-colors border-b border-[#EBECF0] text-xs">
                      {/* Title */}
                      <TableCell className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-[3px] bg-[#E9F2FF] text-[#0C66E4] border border-[#C0D9FF] font-bold text-xs flex items-center justify-center shrink-0">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{quote.title}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{quote.quoteNumber}</div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Account */}
                      <TableCell className="py-2 px-3">
                        <div>
                          <div className="font-medium text-slate-800 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{quote.accountName}</span>
                          </div>
                          {quote.contactName && (
                            <div className="text-[11px] text-slate-500 mt-0.5">{quote.contactName}</div>
                          )}
                        </div>
                      </TableCell>

                      {/* Total Value */}
                      <TableCell className="py-2 px-3">
                        <div className="font-semibold text-slate-900 font-mono text-xs">
                          {quote.totalAmount.toLocaleString('en-US')} ₫
                        </div>
                      </TableCell>

                      {/* Discount */}
                      <TableCell className="py-2 px-3 font-mono text-slate-600 text-[11px]">
                        {(quote.discountAmount || 0) > 0 ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                            -{quote.discountAmount?.toLocaleString('en-US')} ₫
                          </Badge>
                        ) : (
                          '0 ₫'
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-2 px-3">
                        <Badge className={`${statusInfo.className} text-[11px] rounded-[3px]`}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>

                      {/* Valid Until */}
                      <TableCell className="py-2 px-3 font-mono text-slate-600 text-[11px]">
                        {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString('en-US') : '-'}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-2 px-3 text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <ActionTooltip label="In / Xuất PDF">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setPreviewQuote(quote);
                                setShowPrintModal(true);
                              }}
                              className="h-7 w-7 rounded-[3px] text-[#0C66E4] hover:text-[#0052CC] hover:bg-[#E9F2FF]"
                              aria-label="Print Preview & PDF Export"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </Button>
                          </ActionTooltip>
                          <ActionTooltip label="Chỉnh sửa báo giá">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(quote)}
                              className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-[#0C66E4] hover:bg-[#E9F2FF]"
                              aria-label="Edit Quotation"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          </ActionTooltip>
                          <ActionTooltip label="Xóa báo giá">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(quote.id, quote.title || quote.quoteNumber)}
                              className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-red-600 hover:bg-red-50"
                              aria-label="Delete Quotation"
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
            itemLabel="quotes"
          />
        )}
      </Card>

      {/* Create / Edit Quote Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border border-slate-200 shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingQuote ? 'Edit Quotation Details' : 'Create New Quotation'}
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    {editingQuote ? `Quote ID: ${editingQuote.quoteNumber}` : 'Specify pricing table, volume discount & commercial terms'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveQuote} className="p-6 space-y-4">
            <div>
              <Label className="text-xs font-semibold text-slate-700">
                Quotation Title <span className="text-rose-500">*</span>
              </Label>
              <Input
                required
                placeholder="e.g. CRM Enterprise Multi-Year License Proposal Q3/2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-9 text-xs border-slate-200 mt-1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Client Organization</Label>
                <Input
                  placeholder="Enter client company..."
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Authorized Contact</Label>
                <Input
                  placeholder="Enter representative..."
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Total Value (VND) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  type="number"
                  placeholder="200,000,000"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Discount (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Status</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">DRAFT</SelectItem>
                    <SelectItem value="SENT">SENT</SelectItem>
                    <SelectItem value="ACCEPTED">ACCEPTED</SelectItem>
                    <SelectItem value="REJECTED">REJECTED</SelectItem>
                    <SelectItem value="EXPIRED">EXPIRED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Valid Until</Label>
                <Input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Commercial Account Rep</Label>
                <Input
                  placeholder="Alex Nguyen"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
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
                <span>{editingQuote ? 'Save Changes' : 'Create Quotation'}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Printable Document Modal */}
      {previewQuote && (
        <DocumentPreviewModal
          open={showPrintModal}
          onClose={() => {
            setShowPrintModal(false);
            setPreviewQuote(null);
          }}
          documentType="QUOTE"
          documentNumber={previewQuote.quoteNumber}
          documentDate={previewQuote.createdAt ? new Date(previewQuote.createdAt).toLocaleDateString('en-US') : new Date().toLocaleDateString('en-US')}
          validUntilDate={previewQuote.validUntil ? new Date(previewQuote.validUntil).toLocaleDateString('en-US') : undefined}
          clientName={previewQuote.accountName || ''}
          clientRepresentative={previewQuote.contactName || ''}
          items={[
            {
              name: previewQuote.title || previewQuote.quoteNumber,
              quantity: 1,
              unit: 'Package',
              unitPrice: previewQuote.totalAmount,
              discountAmount: previewQuote.discountAmount || 0,
              totalAmount: previewQuote.totalAmount - (previewQuote.discountAmount || 0),
            },
          ]}
          subtotal={previewQuote.totalAmount}
          discountTotal={previewQuote.discountAmount || 0}
          grandTotal={previewQuote.totalAmount - (previewQuote.discountAmount || 0)}
        />
      )}
    </div>
  );
};

export default QuotesPage;
