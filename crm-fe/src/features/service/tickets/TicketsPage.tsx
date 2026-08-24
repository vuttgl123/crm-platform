import React, { useState, useEffect, useCallback } from 'react';
import {
  ticketApi,
  TicketItem,
  TicketPriority,
  TicketStatus,
  TicketChannel,
  TICKET_STATUS_CONFIG,
} from '@/services/api/ticketApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/common/EmptyState';
import { renderPriorityBadge } from '@/config/crmStatusConfig';
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
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Loader2,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Headphones,
  Inbox,
} from 'lucide-react';

export const TicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [subject, setSubject] = useState('');
  const [accountName, setAccountName] = useState('');
  const [contactName, setContactName] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [status, setStatus] = useState<TicketStatus>('NEW');
  const [channel, setChannel] = useState<TicketChannel>('PORTAL');
  const [category, setCategory] = useState('Service Request');
  const [assignedTo, setAssignedTo] = useState('Alex Nguyen');

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ticketApi.list({
        search: searchQuery,
        status: selectedStatus,
        priority: selectedPriority,
        page,
        size: pageSize,
      });
      setTickets(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch {
      toast.error('Unable to load service tickets from server');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedStatus, selectedPriority, page, pageSize]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedPriority('ALL');
    setPage(0);
    fetchTickets();
  };

  const handleOpenCreate = () => {
    setEditingTicket(null);
    setSubject('');
    setAccountName('');
    setContactName('');
    setPriority('MEDIUM');
    setStatus('NEW');
    setChannel('PORTAL');
    setCategory('Service Request');
    setAssignedTo('Alex Nguyen');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ticket: TicketItem) => {
    setEditingTicket(ticket);
    setSubject(ticket.subject);
    setAccountName(ticket.accountName || '');
    setContactName(ticket.contactName || '');
    setPriority(ticket.priority);
    setStatus(ticket.status);
    setChannel(ticket.channel || 'PORTAL');
    setCategory(ticket.category || 'Service Request');
    setAssignedTo(ticket.assignedTo || '');
    setIsModalOpen(true);
  };

  const handleSaveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      toast.error('Please enter Ticket Subject / Problem Description');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTicket) {
        await ticketApi.update(editingTicket.id, {
          version: editingTicket.version || 1,
          subject,
          priority,
          category,
          status,
          accountName,
          contactName,
          assignedTo,
          channel,
        });
        toast.success('Ticket updated successfully!');
      } else {
        await ticketApi.create({
          subject,
          priority,
          category,
          accountId: 'acc-custom',
          accountName: accountName || 'Enterprise Account',
          contactName: contactName || 'Submitter',
          assignedTo: assignedTo || 'Alex Nguyen',
          channel,
        });
        toast.success('New service ticket created successfully!');
      }
      setIsModalOpen(false);
      fetchTickets();
    } catch {
      toast.error('Unable to save ticket details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to delete ticket "${code}"?`)) return;
    try {
      await ticketApi.delete(id);
      toast.success(`Deleted ticket "${code}"`);
      fetchTickets();
    } catch {
      toast.error('Unable to delete ticket');
    }
  };

  // KPI Metrics
  const openCount = tickets.filter((t) => t.status === 'NEW' || t.status === 'OPEN').length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const urgentCount = tickets.filter((t) => t.priority === 'URGENT' || t.priority === 'HIGH').length;

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedStatus !== 'ALL' ? 1 : 0) +
    (selectedPriority !== 'ALL' ? 1 : 0);

  // View Tabs Config
  const viewTabs: ViewTabItem[] = [
    { id: 'ALL', label: 'All Tickets', count: totalElements },
    { id: 'OPEN', label: 'Open / Unassigned', count: openCount, icon: Inbox, dotColor: 'bg-blue-500' },
    { id: 'IN_PROGRESS', label: 'In Progress', count: inProgressCount, icon: Clock, dotColor: 'bg-amber-500' },
    { id: 'RESOLVED', label: 'Resolved', count: resolvedCount, icon: CheckCircle2, dotColor: 'bg-emerald-500' },
  ];

  const currentActiveTab = selectedStatus === 'OPEN' ? 'OPEN' : selectedStatus === 'IN_PROGRESS' ? 'IN_PROGRESS' : selectedStatus === 'RESOLVED' ? 'RESOLVED' : 'ALL';

  const handleTabChange = (tabId: string) => {
    if (tabId === 'OPEN') {
      setSelectedStatus('OPEN');
    } else if (tabId === 'IN_PROGRESS') {
      setSelectedStatus('IN_PROGRESS');
    } else if (tabId === 'RESOLVED') {
      setSelectedStatus('RESOLVED');
    } else {
      setSelectedStatus('ALL');
    }
    setPage(0);
  };

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Page Header */}
      <StandardPageHeader
        title="Service Tickets &amp; Help Desk"
        subtitle="Track customer technical issues, SLA response milestones, omnichannel inquiries &amp; resolutions"
        icon={Headphones}
        badgeCount={totalElements}
        badgeLabel="tickets"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTickets}
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
              <span>New Ticket</span>
            </Button>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-[4px] border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Inbox className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Total Inquiries</div>
            <div className="text-lg font-black text-slate-900 leading-tight">{totalElements}</div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-blue-100 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Clock className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Pending / Open</div>
            <div className="text-lg font-black text-blue-700 leading-tight">{openCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-rose-100 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4.5 h-4.5 text-rose-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">High / Urgent SLA</div>
            <div className="text-lg font-black text-rose-700 leading-tight">{urgentCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-emerald-100 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Resolved Issues</div>
            <div className="text-lg font-black text-emerald-700 leading-tight">{resolvedCount}</div>
          </div>
        </div>
      </div>

      {/* Standard Filter Bar */}
      <StandardFilterBar
        searchQuery={searchQuery}
        onSearchChange={(val) => { setSearchQuery(val); setPage(0); }}
        searchPlaceholder="Search ticket subject, ID, organization..."
        viewTabs={viewTabs}
        activeTab={currentActiveTab}
        onTabChange={handleTabChange}
        activeFiltersCount={activeFiltersCount}
        onResetFilters={handleResetFilters}
        filterControls={
          <>
            <div className="w-40">
              <Select value={selectedStatus} onValueChange={(val) => { setSelectedStatus(val); setPage(0); }}>
                <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                  <SelectValue placeholder="Ticket Status" />
                </SelectTrigger>
                <SelectContent className="rounded-[3px]">
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="NEW">NEW</SelectItem>
                  <SelectItem value="OPEN">OPEN</SelectItem>
                  <SelectItem value="IN_PROGRESS">IN PROGRESS</SelectItem>
                  <SelectItem value="RESOLVED">RESOLVED</SelectItem>
                  <SelectItem value="CLOSED">CLOSED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-40">
              <Select value={selectedPriority} onValueChange={(val) => { setSelectedPriority(val); setPage(0); }}>
                <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="rounded-[3px]">
                  <SelectItem value="ALL">All Priorities</SelectItem>
                  <SelectItem value="URGENT">URGENT</SelectItem>
                  <SelectItem value="HIGH">HIGH</SelectItem>
                  <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                  <SelectItem value="LOW">LOW</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        }
      />

      {/* Tickets Table */}
      <Card className="overflow-hidden border border-slate-200 rounded-[4px] bg-white shadow-none">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F7F8F9] border-b border-slate-200 hover:bg-[#F7F8F9]">
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Ticket ID &amp; Subject</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Organization &amp; Submitter</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Priority Level</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Status</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Channel</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Assigned Lead</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3 text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-xs">Loading support tickets...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <EmptyState
                      icon={Headphones}
                      title="No tickets found"
                      description="Try adjusting your filter criteria or submit a new service ticket."
                      actionLabel="Create Ticket"
                      onAction={handleOpenCreate}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => {
                  const statusInfo = TICKET_STATUS_CONFIG[ticket.status] || { label: ticket.status, className: 'bg-slate-100 text-slate-700' };

                  return (
                    <TableRow key={ticket.id} className="hover:bg-[#F1F2F4] transition-colors border-b border-[#EBECF0] text-xs">
                      {/* Ticket Code & Subject */}
                      <TableCell className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-[3px] bg-[#E9F2FF] text-[#0C66E4] border border-[#C0D9FF] font-bold text-xs flex items-center justify-center shrink-0">
                            <Headphones className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 line-clamp-1">{ticket.subject}</div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">{ticket.ticketNumber}</div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Account & Submitter */}
                      <TableCell className="py-2 px-3">
                        <div>
                          <div className="font-medium text-slate-800 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{ticket.accountName}</span>
                          </div>
                          {ticket.contactName && (
                            <div className="text-[11px] text-slate-500 mt-0.5">{ticket.contactName}</div>
                          )}
                        </div>
                      </TableCell>

                      {/* Priority */}
                      <TableCell className="py-2 px-3">
                        {renderPriorityBadge(ticket.priority)}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-2 px-3">
                        <Badge className={`${statusInfo.className} text-[11px] rounded-[3px]`}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>

                      {/* Channel */}
                      <TableCell className="py-2 px-3 font-semibold text-[11px] text-slate-600">
                        {ticket.channel}
                      </TableCell>

                      {/* Assigned */}
                      <TableCell className="py-2 px-3 text-slate-700">
                        {ticket.assignedTo || 'Unassigned'}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-2 px-3 text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <ActionTooltip label="Edit Ticket">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(ticket)}
                              className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-[#0C66E4] hover:bg-[#E9F2FF]"
                              aria-label="Edit Ticket"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          </ActionTooltip>
                          <ActionTooltip label="Delete Ticket">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(ticket.id, ticket.ticketNumber)}
                              className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-red-600 hover:bg-red-50"
                              aria-label="Delete Ticket"
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
            itemLabel="tickets"
          />
        )}
      </Card>

      {/* Create / Edit Ticket Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border border-slate-200 shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingTicket ? 'Edit Support Ticket' : 'Create New Service Ticket'}
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    {editingTicket ? `Ticket ID: ${editingTicket.ticketNumber}` : 'Record incident summary, SLA priority level & assigned support specialist'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveTicket} className="p-6 space-y-4">
            <div>
              <Label className="text-xs font-semibold text-slate-700">
                Ticket Subject / Issue Summary <span className="text-rose-500">*</span>
              </Label>
              <Input
                required
                placeholder="e.g. Webhook API synchronization timeout with external ERP"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
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
                <Label className="text-xs font-semibold text-slate-700">Submitter Contact</Label>
                <Input
                  placeholder="e.g. David Harrison"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Priority Level</Label>
                <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="URGENT">URGENT</SelectItem>
                    <SelectItem value="HIGH">HIGH</SelectItem>
                    <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                    <SelectItem value="LOW">LOW</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Ticket Status</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">NEW</SelectItem>
                    <SelectItem value="OPEN">OPEN</SelectItem>
                    <SelectItem value="IN_PROGRESS">IN PROGRESS</SelectItem>
                    <SelectItem value="RESOLVED">RESOLVED</SelectItem>
                    <SelectItem value="CLOSED">CLOSED</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Inbound Channel</Label>
                <Select value={channel} onValueChange={(val: any) => setChannel(val)}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PORTAL">PORTAL</SelectItem>
                    <SelectItem value="EMAIL">EMAIL</SelectItem>
                    <SelectItem value="PHONE">PHONE</SelectItem>
                    <SelectItem value="CHAT">CHAT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Issue Category</Label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Technical Incident"
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Assigned Support Engineer</Label>
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
                <span>{editingTicket ? 'Save Changes' : 'Create Ticket'}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketsPage;
