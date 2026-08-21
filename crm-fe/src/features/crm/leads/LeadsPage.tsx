import React, { useState, useEffect, useCallback } from 'react';
import {
  leadApi,
  LeadItem,
  LeadRating,
  LeadScoringResult,
  LEAD_SOURCE_CONFIG,
} from '@/services/api/leadApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/common/EmptyState';
import { renderLeadStatusBadge } from '@/config/crmStatusConfig';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
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
import { QuickCallLogModal } from '@/features/crm/call/QuickCallLogModal';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';
import { StandardFilterBar, ViewTabItem } from '@/components/common/StandardFilterBar';
import { StandardPagination } from '@/components/common/StandardPagination';
import {
  UserPlus,
  Flame,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Loader2,
  X,
  TrendingUp,
  Building2,
  ArrowRightCircle,
  Sparkles,
  Target,
  UserCheck,
  CheckCircle2,
  ShieldAlert,
  PhoneCall,
} from 'lucide-react';
import { ActionTooltip } from '@/components/ui/action-tooltip';

const RATING_CONFIG: Record<string, { label: string; className: string; icon: any }> = {
  HOT: { label: 'HOT', className: 'bg-rose-50 text-rose-700 border-rose-200 font-bold', icon: Flame },
  WARM: { label: 'WARM', className: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold', icon: TrendingUp },
  COLD: { label: 'COLD', className: 'bg-slate-100 text-slate-600 border-slate-200', icon: Target },
};

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [callingLead, setCallingLead] = useState<LeadItem | null>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [selectedRating, setSelectedRating] = useState('ALL');
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Scoring Modal State
  const [scoringResult, setScoringResult] = useState<LeadScoringResult | null>(null);
  const [isScoringLoading, setIsScoringLoading] = useState(false);
  const [showScoringModal, setShowScoringModal] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [leadSource, setLeadSource] = useState<'WEBSITE' | 'EVENT' | 'REFERRAL' | 'COLD_CALL' | 'SOCIAL' | 'PARTNER'>('WEBSITE');
  const [status, setStatus] = useState<'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'UNQUALIFIED'>('NEW');
  const [rating, setRating] = useState<'HOT' | 'WARM' | 'COLD'>('HOT');
  const [estimatedRevenue, setEstimatedRevenue] = useState('');
  const [assignedTo, setAssignedTo] = useState('Alex Nguyen');
  const [notes, setNotes] = useState('');
  const [city, setCity] = useState('Hanoi');

  const handleCalculateScore = async (lead: LeadItem) => {
    setIsScoringLoading(true);
    setShowScoringModal(true);
    try {
      const res = await leadApi.calculateScore(lead.id);
      setScoringResult(res);
    } catch {
      toast.error('Unable to compute Lead Score');
      setShowScoringModal(false);
    } finally {
      setIsScoringLoading(false);
    }
  };

  const handleAutoAssign = async (lead: LeadItem) => {
    try {
      await leadApi.autoAssign(lead.id);
      toast.success(`Lead "${lead.fullName}" auto-assigned via Round-Robin`);
      fetchLeads();
    } catch {
      toast.error('Unable to auto-assign lead');
    }
  };

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await leadApi.list({
        search: searchQuery,
        status: selectedStatus,
        leadSource: selectedSource !== 'ALL' ? selectedSource : undefined,
        rating: selectedRating !== 'ALL' ? (selectedRating as LeadRating) : undefined,
        page,
        size: pageSize,
      });
      setLeads(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch {
      toast.error('Unable to load lead list from server');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedStatus, selectedSource, selectedRating, page, pageSize]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedSource('ALL');
    setSelectedRating('ALL');
    setPage(0);
    fetchLeads();
  };

  const handleOpenCreate = () => {
    setEditingLead(null);
    setFullName('');
    setCompanyName('');
    setJobTitle('');
    setEmail('');
    setPhone('');
    setLeadSource('WEBSITE');
    setStatus('NEW');
    setRating('HOT');
    setEstimatedRevenue('');
    setNotes('');
    setCity('Hanoi');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lead: LeadItem) => {
    setEditingLead(lead);
    setFullName(lead.fullName || '');
    setCompanyName(lead.companyName || '');
    setJobTitle(lead.jobTitle || '');
    setEmail(lead.email || '');
    setPhone(lead.phone || '');
    setLeadSource((lead.leadSource as any) || 'WEBSITE');
    setStatus((lead.status as any) || 'NEW');
    setRating((lead.rating as any) || 'WARM');
    setEstimatedRevenue(lead.estimatedRevenue ? lead.estimatedRevenue.toString() : '');
    setAssignedTo(lead.assignedTo || '');
    setNotes(lead.notes || '');
    setCity(lead.city || '');
    setIsModalOpen(true);
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error('Please provide both Full Name and Email Address');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingLead) {
        await leadApi.update(editingLead.id, {
          fullName,
          companyName,
          jobTitle,
          email,
          phone,
          leadSource,
          status,
          rating,
          estimatedRevenue: estimatedRevenue ? parseFloat(estimatedRevenue) : 0,
          assignedTo,
          notes,
          city,
        });
        toast.success('Lead updated successfully!');
      } else {
        await leadApi.create({
          fullName,
          companyName: companyName || 'Individual Prospect',
          jobTitle: jobTitle || 'Contact',
          email,
          phone,
          leadSource,
          status,
          rating,
          estimatedRevenue: estimatedRevenue ? parseFloat(estimatedRevenue) : 0,
          assignedTo: assignedTo || 'Alex Nguyen',
          notes,
          city: city || 'Hanoi',
        });
        toast.success('New lead created successfully!');
      }
      setIsModalOpen(false);
      fetchLeads();
    } catch {
      toast.error('Unable to save lead details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete lead "${name}"?`)) return;
    try {
      await leadApi.delete(id);
      toast.success(`Deleted lead "${name}"`);
      fetchLeads();
    } catch {
      toast.error('Unable to delete lead');
    }
  };

  const handleConvert = async (lead: LeadItem) => {
    if (!window.confirm(`Convert lead "${lead.fullName}" into Customer Account & Deal?`)) return;
    try {
      await leadApi.convert(lead.id);
      toast.success(`Lead "${lead.fullName}" converted successfully to Customer!`);
      fetchLeads();
    } catch {
      toast.error('Lead conversion failed');
    }
  };

  // KPI Metrics
  const hotCount = leads.filter((l) => l.rating === 'HOT').length;
  const qualifiedCount = leads.filter((l) => l.status === 'QUALIFIED').length;
  const convertedCount = leads.filter((l) => l.status === 'CONVERTED').length;

  // View Tabs Config
  const viewTabs: ViewTabItem[] = [
    { id: 'ALL', label: 'All', count: totalElements },
    { id: 'HOT', label: 'Hot', count: hotCount, icon: Flame, dotColor: 'bg-rose-500' },
    { id: 'QUALIFIED', label: 'Qualified', count: qualifiedCount, icon: Target, dotColor: 'bg-emerald-500' },
    { id: 'CONVERTED', label: 'Converted', count: convertedCount, icon: Sparkles, dotColor: 'bg-indigo-500' },
  ];

  const currentActiveTab = selectedRating === 'HOT' ? 'HOT' : selectedStatus === 'QUALIFIED' ? 'QUALIFIED' : selectedStatus === 'CONVERTED' ? 'CONVERTED' : 'ALL';

  const handleTabChange = (tabId: string) => {
    if (tabId === 'HOT') {
      setSelectedRating('HOT');
      setSelectedStatus('ALL');
    } else if (tabId === 'QUALIFIED') {
      setSelectedStatus('QUALIFIED');
      setSelectedRating('ALL');
    } else if (tabId === 'CONVERTED') {
      setSelectedStatus('CONVERTED');
      setSelectedRating('ALL');
    } else {
      setSelectedStatus('ALL');
      setSelectedRating('ALL');
    }
    setPage(0);
  };

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedStatus !== 'ALL' ? 1 : 0) +
    (selectedSource !== 'ALL' ? 1 : 0) +
    (selectedRating !== 'ALL' ? 1 : 0);

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Page Header */}
      <StandardPageHeader
        title="Inbound &amp; Sales Leads"
        subtitle="Lead capture, engagement rating (Hot / Warm / Cold), AI propensity scoring &amp; account conversion"
        icon={UserPlus}
        badgeCount={totalElements}
        badgeLabel="leads"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLeads}
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
              <span>New Lead</span>
            </Button>
          </>
        }
      />

      {/* Standard Filter & Search Bar */}
      <StandardFilterBar
        searchQuery={searchQuery}
        onSearchChange={(val) => { setSearchQuery(val); setPage(0); }}
        searchPlaceholder="Search by name, company, email, phone..."
        viewTabs={viewTabs}
        activeTab={currentActiveTab}
        onTabChange={handleTabChange}
        activeFiltersCount={activeFiltersCount}
        onResetFilters={handleResetFilters}
        filterControls={
          <>
            <div className="w-36">
              <Select value={selectedStatus} onValueChange={(val) => { setSelectedStatus(val); setPage(0); }}>
                <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-[3px]">
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="CONTACTED">Contacted</SelectItem>
                  <SelectItem value="QUALIFIED">Qualified</SelectItem>
                  <SelectItem value="CONVERTED">Converted</SelectItem>
                  <SelectItem value="UNQUALIFIED">Unqualified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-36">
              <Select value={selectedRating} onValueChange={(val) => { setSelectedRating(val); setPage(0); }}>
                <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent className="rounded-[3px]">
                  <SelectItem value="ALL">All Ratings</SelectItem>
                  <SelectItem value="HOT">HOT</SelectItem>
                  <SelectItem value="WARM">WARM</SelectItem>
                  <SelectItem value="COLD">COLD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-40">
              <Select value={selectedSource} onValueChange={(val) => { setSelectedSource(val); setPage(0); }}>
                <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent className="rounded-[3px]">
                  <SelectItem value="ALL">All Sources</SelectItem>
                  {Object.entries(LEAD_SOURCE_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        }
      />

      {/* Leads Table */}
      <Card className="overflow-hidden border border-slate-200 rounded-[4px] bg-white shadow-none">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F7F8F9] border-b border-slate-200 hover:bg-[#F7F8F9]">
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Lead Contact</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Company &amp; Job Title</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Rating</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Status</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Est. Value</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Source</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-xs">Loading leads...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <EmptyState
                      icon={UserPlus}
                      title="No leads found"
                      description="Try adjusting your filter criteria or create a new lead."
                      actionLabel="Create New Lead"
                      onAction={handleOpenCreate}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => {
                  const ratingInfo = (lead.rating && RATING_CONFIG[lead.rating]) ? RATING_CONFIG[lead.rating] : RATING_CONFIG.HOT;
                  const RatingIcon = ratingInfo.icon;
                  const fullName = lead.fullName || lead.displayName || 'Lead';
                  return (
                    <TableRow key={lead.id} className="hover:bg-[#F1F2F4] transition-colors border-b border-[#EBECF0] text-xs">
                      {/* Contact */}
                      <TableCell className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-[3px] bg-[#EAE6FF] text-[#403294] border border-[#D3C7FF] font-bold text-xs flex items-center justify-center shrink-0">
                            {fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{fullName}</div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                              <span className="font-mono text-slate-400">{lead.id.toUpperCase()}</span>
                              <span>•</span>
                              <span className="font-mono">{lead.phone || '---'}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Company & Job Title */}
                      <TableCell className="py-2 px-3">
                        <div>
                          <div className="font-medium text-slate-800 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{lead.companyName || '---'}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">{lead.jobTitle || '---'}</div>
                        </div>
                      </TableCell>

                      {/* Rating */}
                      <TableCell className="py-2 px-3">
                        <Badge className={`${ratingInfo.className} gap-1 text-[11px] px-1.5 py-0.5 rounded-[3px]`}>
                          <RatingIcon className="w-3 h-3" />
                          <span>{ratingInfo.label}</span>
                        </Badge>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-2 px-3">
                        {renderLeadStatusBadge(lead.status)}
                      </TableCell>

                      {/* Estimated Value */}
                      <TableCell className="py-2 px-3">
                        <div className="font-semibold text-slate-900 font-mono text-xs">
                          {lead.estimatedRevenue ? `${lead.estimatedRevenue.toLocaleString('en-US')} ₫` : '—'}
                        </div>
                      </TableCell>

                      {/* Source */}
                      <TableCell className="py-2 px-3">
                        <span className="bg-[#EBECF0] text-[#42526E] font-semibold text-[11px] uppercase tracking-wider px-1.5 py-0.5 rounded-[3px]">
                          {(lead.leadSource && LEAD_SOURCE_CONFIG[lead.leadSource]) ? LEAD_SOURCE_CONFIG[lead.leadSource].label : (lead.leadSource || 'Other')}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-2 px-3 text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setCallingLead(lead);
                              setIsCallModalOpen(true);
                            }}
                            className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            title="Quick Call & Log Activity"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCalculateScore(lead)}
                            className="h-7 w-7 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            title="Calculate AI Lead Propensity Score"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAutoAssign(lead)}
                            className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Auto-assign Lead (Round-Robin)"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </Button>
                          {lead.status !== 'CONVERTED' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleConvert(lead)}
                              className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              title="Convert to Customer Account & Opportunity"
                            >
                              <ArrowRightCircle className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <ActionTooltip label="Chỉnh sửa lead">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(lead)}
                              className="h-7 w-7 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                              aria-label="Edit Lead Details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          </ActionTooltip>
                          <ActionTooltip label="Xóa lead">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(lead.id, lead.fullName || lead.displayName || lead.leadNumber)}
                              className="h-7 w-7 text-slate-600 hover:text-red-600 hover:bg-red-50"
                              aria-label="Delete Lead"
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
            itemLabel="leads"
          />
        )}
      </Card>

      {/* Create / Edit Lead Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border border-slate-200 shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingLead ? 'Edit Lead Profile' : 'Create New Lead'}
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    {editingLead ? `Lead ID: ${editingLead.id.toUpperCase()}` : 'Capture prospective contact details & commercial interest'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveLead} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Full Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  placeholder="e.g. Alex Toan Tran"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Company / Organization</Label>
                <Input
                  placeholder="e.g. ABC Technologies Corp"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Job Title</Label>
                <Input
                  placeholder="e.g. Chief Executive Officer (CEO)"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">City / Region</Label>
                <Input
                  placeholder="e.g. Hanoi / Ho Chi Minh City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Email Address <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  type="email"
                  placeholder="ceo@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Phone Number</Label>
                <Input
                  placeholder="+84 903 123 456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Lead Source</Label>
                <Select value={leadSource} onValueChange={(val: any) => setLeadSource(val)}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEBSITE">Website / Inbound</SelectItem>
                    <SelectItem value="EVENT">Event / Conference</SelectItem>
                    <SelectItem value="REFERRAL">Customer Referral</SelectItem>
                    <SelectItem value="COLD_CALL">Outbound Telesales</SelectItem>
                    <SelectItem value="SOCIAL">Social Media</SelectItem>
                    <SelectItem value="PARTNER">Partner Channel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Interest Rating</Label>
                <Select value={rating} onValueChange={(val: any) => setRating(val)}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOT">HOT</SelectItem>
                    <SelectItem value="WARM">WARM</SelectItem>
                    <SelectItem value="COLD">COLD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Estimated Value (VND)</Label>
                <Input
                  type="number"
                  placeholder="50,000,000"
                  value={estimatedRevenue}
                  onChange={(e) => setEstimatedRevenue(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Lead Status</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="CONTACTED">Contacted</SelectItem>
                    <SelectItem value="QUALIFIED">Qualified</SelectItem>
                    <SelectItem value="CONVERTED">Converted</SelectItem>
                    <SelectItem value="UNQUALIFIED">Unqualified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Assigned Sales Rep</Label>
                <Input
                  placeholder="Alex Nguyen"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Commercial Notes / Customer Needs</Label>
              <textarea
                rows={3}
                placeholder="Client interested in Enterprise CRM and requested an architecture consultation this week..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
                <span>{editingLead ? 'Save Changes' : 'Create Lead'}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lead Scoring Intelligence Modal */}
      {showScoringModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Lead Scoring Intelligence Report</h3>
                  <p className="text-[11px] text-slate-500">Multi-dimensional analysis on budget, profile completeness &amp; conversion probability</p>
                </div>
              </div>
              <button onClick={() => setShowScoringModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {isScoringLoading ? (
              <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                <span className="text-xs font-semibold">Aggregating customer signals and computing score...</span>
              </div>
            ) : scoringResult ? (
              <div className="space-y-4 text-xs">
                {/* Score Card */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 via-indigo-50 to-white border border-purple-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 block">Propensity Score</span>
                    <div className="text-3xl font-black text-purple-900 tracking-tight mt-0.5">
                      {scoringResult.score} <span className="text-sm font-normal text-purple-600">/ 100</span>
                    </div>
                  </div>
                  <Badge className={`text-xs font-black px-3 py-1 ${
                    scoringResult.grade === 'HOT' ? 'bg-rose-600 text-white shadow-xs' :
                    scoringResult.grade === 'WARM' ? 'bg-amber-500 text-white shadow-xs' :
                    'bg-slate-500 text-white'
                  }`}>
                    {scoringResult.grade === 'HOT' ? '🔥 HOT LEAD (High Propensity)' :
                     scoringResult.grade === 'WARM' ? '⚡ WARM LEAD (Engaged)' : '❄ COLD LEAD (Nurture)'}
                  </Badge>
                </div>

                {/* Factors list */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-700 block">Key Scoring Drivers:</span>
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    {scoringResult.scoringFactors.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-700 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendation */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                    Recommended Next Action:
                  </span>
                  <p className="text-amber-800 leading-relaxed text-xs">
                    {scoringResult.recommendedAction}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button size="sm" onClick={() => setShowScoringModal(false)} className="h-8 text-xs font-semibold bg-slate-900 text-white">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Call Log Modal */}
      {callingLead && (
        <QuickCallLogModal
          open={isCallModalOpen}
          onClose={() => {
            setIsCallModalOpen(false);
            setCallingLead(null);
          }}
          targetName={callingLead.fullName || callingLead.displayName || 'Lead'}
          targetPhone={callingLead.phone || ''}
          entityType="LEAD"
          entityId={callingLead.id}
          onCallLogged={fetchLeads}
        />
      )}
    </div>
  );
};

export default LeadsPage;
