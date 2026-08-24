import React, { useState, useEffect, useCallback } from 'react';
import {
  opportunityApi,
  OpportunityItem,
  OpportunityStage,
  PIPELINE_STAGES,
} from '@/services/api/opportunityApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/common/EmptyState';
import { renderOpportunityStageBadge } from '@/config/crmStatusConfig';
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
import { StandardPageHeader } from '@/components/common/StandardPageHeader';
import { StandardFilterBar, ViewTabItem } from '@/components/common/StandardFilterBar';
import { StandardPagination } from '@/components/common/StandardPagination';
import {
  TrendingUp,
  Kanban,
  List,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Loader2,
  DollarSign,
  Building2,
  Trophy,
  Target,
  ArrowRight,
} from 'lucide-react';

export const OpportunitiesPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'TABLE' | 'KANBAN'>('TABLE');
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<OpportunityItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [dealName, setDealName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [contactName, setContactName] = useState('');
  const [amount, setAmount] = useState('');
  const [stage, setStage] = useState<OpportunityStage>('PROSPECTING');
  const [probability, setProbability] = useState('15');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('Alex Nguyen');
  const [description, setDescription] = useState('');
  const [nextStep, setNextStep] = useState('');

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      if (viewMode === 'KANBAN') {
        const data = await opportunityApi.getAllForKanban();
        setOpportunities(data);
        setTotalElements(data.length);
      } else {
        const res = await opportunityApi.list({
          search: searchQuery,
          stage: selectedStage,
          page,
          size: pageSize,
        });
        setOpportunities(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      }
    } catch {
      toast.error('Unable to load commercial pipeline opportunities');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedStage, page, pageSize, viewMode]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStage('ALL');
    setPage(0);
    fetchOpportunities();
  };

  const handleOpenCreate = () => {
    setEditingOpp(null);
    setDealName('');
    setAccountName('');
    setContactName('');
    setAmount('');
    setStage('PROSPECTING');
    setProbability('15');
    setExpectedCloseDate(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
    setAssignedTo('Alex Nguyen');
    setDescription('');
    setNextStep('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (opp: OpportunityItem) => {
    setEditingOpp(opp);
    setDealName(opp.dealName);
    setAccountName(opp.accountName || '');
    setContactName(opp.contactName || '');
    setAmount(opp.amount.toString());
    setStage(opp.stage);
    setProbability(opp.probability.toString());
    setExpectedCloseDate(opp.expectedCloseDate);
    setAssignedTo(opp.assignedTo || '');
    setDescription(opp.description || '');
    setNextStep(opp.nextStep || '');
    setIsModalOpen(true);
  };

  const handleSaveOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealName.trim() || !amount) {
      toast.error('Please enter Opportunity Name and Deal Amount');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingOpp) {
        await opportunityApi.update(editingOpp.id, {
          version: editingOpp.version || 1,
          dealName,
          accountName,
          contactName,
          amount: parseFloat(amount),
          stage,
          probability: parseInt(probability, 10),
          expectedCloseDate,
          assignedTo,
          description,
          nextStep,
        });
        toast.success('Opportunity updated successfully!');
      } else {
        await opportunityApi.create({
          dealName,
          accountId: 'acc-custom',
          accountName: accountName || 'Unassigned Account',
          contactName: contactName || 'Unassigned Contact',
          amount: parseFloat(amount),
          stage,
          probability: parseInt(probability, 10),
          expectedCloseDate: expectedCloseDate || new Date().toISOString().split('T')[0],
          assignedTo: assignedTo || 'Alex Nguyen',
          description,
          nextStep,
        });
        toast.success('New opportunity created successfully!');
      }
      setIsModalOpen(false);
      fetchOpportunities();
    } catch {
      toast.error('Unable to save opportunity details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete opportunity "${name}"?`)) return;
    try {
      await opportunityApi.delete(id);
      toast.success(`Deleted opportunity "${name}"`);
      fetchOpportunities();
    } catch {
      toast.error('Unable to delete opportunity');
    }
  };

  const handleAdvanceStage = async (deal: OpportunityItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const stageIndex = PIPELINE_STAGES.findIndex((s) => s.id === deal.stage);
    if (stageIndex >= PIPELINE_STAGES.length - 1) return;
    const nextStage = PIPELINE_STAGES[stageIndex + 1];

    try {
      await opportunityApi.update(deal.id, {
        ...deal,
        stage: nextStage.id,
        probability: nextStage.defaultProb,
      });

      if (nextStage.id === 'PROPOSAL') {
        toast.success(`⚡ Workflow Automation: Advanced to "${nextStage.title}" and auto-triggered 'Draft Quotation'`);
      } else if (nextStage.id === 'CLOSED_WON') {
        toast.success(`🎉 Won! Advanced to "Closed Won" and auto-triggered Order & Contract workflows`);
      } else {
        toast.success(`Advanced deal to "${nextStage.title}"`);
      }
      fetchOpportunities();
    } catch {
      toast.error('Unable to update opportunity stage');
    }
  };

  // KPI Metrics
  const closedWonList = opportunities.filter((o) => o.stage === 'CLOSED_WON');
  const inProgressCount = opportunities.filter((o) => o.stage !== 'CLOSED_WON' && o.stage !== 'CLOSED_LOST').length;

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedStage !== 'ALL' ? 1 : 0);

  // View Tabs Config
  const viewTabs: ViewTabItem[] = [
    { id: 'ALL', label: 'All', count: totalElements },
    { id: 'IN_PROGRESS', label: 'In Negotiation', count: inProgressCount, icon: Target, dotColor: 'bg-purple-500' },
    { id: 'CLOSED_WON', label: 'Closed Won', count: closedWonList.length, icon: Trophy, dotColor: 'bg-emerald-500' },
  ];

  const currentActiveTab = selectedStage === 'CLOSED_WON' ? 'CLOSED_WON' : 'ALL';

  const handleTabChange = (tabId: string) => {
    if (tabId === 'CLOSED_WON') {
      setSelectedStage('CLOSED_WON');
    } else {
      setSelectedStage('ALL');
    }
    setPage(0);
  };

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Page Header */}
      <StandardPageHeader
        title="Commercial Opportunities"
        subtitle="Track sales pipeline stages, deal probabilities, forecast revenue &amp; automated stage workflows"
        badgeCount={totalElements}
        badgeLabel="deals"
        actions={
          <>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-[3px] border border-slate-200">
              <button
                onClick={() => setViewMode('TABLE')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-[2px] text-xs font-semibold transition-all ${
                  viewMode === 'TABLE'
                    ? 'bg-white text-[#0C66E4] shadow-none font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
              <button
                onClick={() => setViewMode('KANBAN')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-[2px] text-xs font-semibold transition-all ${
                  viewMode === 'KANBAN'
                    ? 'bg-white text-[#0C66E4] shadow-none font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchOpportunities}
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
              <span>New Opportunity</span>
            </Button>
          </>
        }
      />

      {/* Standard Filter & Search Bar */}
      {viewMode === 'TABLE' && (
        <StandardFilterBar
          searchQuery={searchQuery}
          onSearchChange={(val) => { setSearchQuery(val); setPage(0); }}
          searchPlaceholder="Search opportunities, accounts, reps..."
          viewTabs={viewTabs}
          activeTab={currentActiveTab}
          onTabChange={handleTabChange}
          activeFiltersCount={activeFiltersCount}
          onResetFilters={handleResetFilters}
          filterControls={
            <div className="w-48">
              <Select value={selectedStage} onValueChange={(val) => { setSelectedStage(val); setPage(0); }}>
                <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                  <SelectValue placeholder="Pipeline Stage" />
                </SelectTrigger>
                <SelectContent className="rounded-[3px]">
                  <SelectItem value="ALL">All Stages</SelectItem>
                  {PIPELINE_STAGES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title} ({s.defaultProb}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
        />
      )}

      {/* Main View: Table vs Kanban */}
      {viewMode === 'TABLE' ? (
        <Card className="overflow-hidden border border-slate-200 rounded-[4px] bg-white shadow-none">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F7F8F9] border-b border-slate-200 hover:bg-[#F7F8F9]">
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Opportunity Name &amp; Code</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Account</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Pipeline Stage</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Deal Value</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Probability</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Expected Close</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3 text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        <span className="text-xs">Loading opportunities...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : opportunities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="p-0">
                      <EmptyState
                        icon={TrendingUp}
                        title="No opportunities found"
                        description="Try adjusting your filters or create a new sales opportunity."
                        actionLabel="Create Opportunity"
                        onAction={handleOpenCreate}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  opportunities.map((opp) => (
                    <TableRow key={opp.id} className="hover:bg-[#F1F2F4] transition-colors border-b border-[#EBECF0] text-xs">
                      {/* Name */}
                      <TableCell className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-[3px] bg-[#E9F2FF] text-[#0C66E4] border border-[#C0D9FF] font-bold text-xs flex items-center justify-center shrink-0">
                            <DollarSign className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{opp.dealName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{opp.id.toUpperCase()}</div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Account */}
                      <TableCell className="py-2 px-3">
                        <div>
                          <div className="font-medium text-slate-800 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{opp.accountName}</span>
                          </div>
                          {opp.contactName && (
                            <div className="text-[11px] text-slate-500 mt-0.5">{opp.contactName}</div>
                          )}
                        </div>
                      </TableCell>

                      {/* Stage */}
                      <TableCell className="py-2 px-3">
                        {renderOpportunityStageBadge(opp.stage)}
                      </TableCell>

                      {/* Deal Value */}
                      <TableCell className="py-2 px-3">
                        <div className="font-semibold text-slate-900 font-mono text-xs">
                          {opp.amount.toLocaleString('en-US')} ₫
                        </div>
                      </TableCell>

                      {/* Probability */}
                      <TableCell className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                            <div
                              className="bg-[#0C66E4] h-full rounded-full transition-all"
                              style={{ width: `${opp.probability}%` }}
                            />
                          </div>
                          <span className="font-mono font-semibold text-[11px] text-slate-700">{opp.probability}%</span>
                        </div>
                      </TableCell>

                      {/* Expected Close */}
                      <TableCell className="py-2 px-3 text-slate-600 font-mono text-[11px]">
                        {new Date(opp.expectedCloseDate).toLocaleDateString('en-US')}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-2 px-3 text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <ActionTooltip label="Edit Opportunity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(opp)}
                              className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-[#0C66E4] hover:bg-[#E9F2FF]"
                              aria-label="Edit Opportunity"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          </ActionTooltip>
                          <ActionTooltip label="Delete Opportunity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(opp.id, opp.dealName)}
                              className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-red-600 hover:bg-red-50"
                              aria-label="Delete Opportunity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </ActionTooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
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
              itemLabel="opportunities"
            />
          )}
        </Card>
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((s) => {
            const stageDeals = opportunities.filter((o) => o.stage === s.id);
            const stageTotal = stageDeals.reduce((sum, d) => sum + d.amount, 0);

            return (
              <div key={s.id} className="bg-slate-50/70 border border-slate-200 rounded-xl p-2.5 flex flex-col min-w-[220px]">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 mb-2.5">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{s.title}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {(stageTotal / 1_000_000).toFixed(0)}M VND
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-white text-slate-700 border-slate-200 text-[10px] px-1.5 py-0 font-bold">
                    {stageDeals.length}
                  </Badge>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto max-h-[600px] pr-0.5">
                  {stageDeals.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-[11px] italic">
                      No deals
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        onClick={() => handleOpenEdit(deal)}
                        className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-blue-300 transition-all cursor-pointer space-y-1.5"
                      >
                        <div className="font-bold text-xs text-slate-900 hover:text-blue-600 line-clamp-1">
                          {deal.dealName}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{deal.accountName}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-[11px]">
                          <span className="font-bold text-slate-900 font-mono">
                            {(deal.amount / 1_000_000).toFixed(0)}M VND
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 text-[10px]">{deal.expectedCloseDate}</span>
                            {deal.stage !== 'CLOSED_WON' && deal.stage !== 'CLOSED_LOST' && (
                              <button
                                onClick={(e) => handleAdvanceStage(deal, e)}
                                className="p-0.5 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors ml-1"
                                title="Advance to Next Stage (Workflow Trigger)"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Opportunity Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border border-slate-200 shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingOpp ? 'Edit Opportunity Details' : 'Create New Opportunity'}
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    {editingOpp ? `Deal ID: ${editingOpp.id.toUpperCase()}` : 'Define deal pipeline stage, probability & revenue forecast'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveOpportunity} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Deal / Opportunity Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  placeholder="e.g. Enterprise Cloud ERP Deployment 2026"
                  value={dealName}
                  onChange={(e) => setDealName(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Client Organization</Label>
                <Input
                  placeholder="Enter organization name..."
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Key Contact Representative</Label>
                <Input
                  placeholder="Enter contact name..."
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Contract Amount (VND) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  type="number"
                  placeholder="150,000,000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Pipeline Stage</Label>
                <Select
                  value={stage}
                  onValueChange={(val: any) => {
                    setStage(val);
                    const s = PIPELINE_STAGES.find((st) => st.id === val);
                    if (s) setProbability(s.defaultProb.toString());
                  }}
                >
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PIPELINE_STAGES.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.title} ({s.defaultProb}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Probability (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={probability}
                  onChange={(e) => setProbability(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Expected Close Date</Label>
                <Input
                  type="date"
                  value={expectedCloseDate}
                  onChange={(e) => setExpectedCloseDate(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Assigned Deal Owner</Label>
                <Input
                  placeholder="Alex Nguyen"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Next Action Step</Label>
              <Input
                placeholder="e.g. Dispatch formal CPQ proposal and conduct architecture review on Thursday..."
                value={nextStep}
                onChange={(e) => setNextStep(e.target.value)}
                className="h-9 text-xs border-slate-200 mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Commercial Notes &amp; Scope</Label>
              <textarea
                rows={3}
                placeholder="Requires SAP ERP integration API connector and user onboarding support for 50 commercial reps..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 mt-1 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
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
                <span>{editingOpp ? 'Save Changes' : 'Create Opportunity'}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OpportunitiesPage;
