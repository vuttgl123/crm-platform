import React, { useState, useEffect, useCallback } from 'react';
import {
  activityApi,
  ActivityItem,
  ActivityType,
  ActivityPriority,
  ActivityStatus,
  ACTIVITY_TYPE_CONFIG,
} from '@/services/api/activityApi';
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
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Loader2,
  Building2,
  Phone,
  Mail,
  Users,
  CheckSquare,
  CalendarCheck,
  RotateCcw,
} from 'lucide-react';

const TYPE_ICON_MAP: Record<ActivityType, any> = {
  CALL: Phone,
  MEETING: Users,
  TASK: CheckSquare,
  EMAIL: Mail,
  MESSAGE: Mail,
  DEMO: CalendarCheck,
  FOLLOW_UP: RotateCcw,
  OTHER: CalendarCheck,
};

const STATUS_CONFIG: Record<ActivityStatus, { label: string; className: string }> = {
  PLANNED: { label: 'PLANNED', className: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold' },
  IN_PROGRESS: { label: 'IN PROGRESS', className: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold' },
  PENDING: { label: 'PENDING', className: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold' },
  COMPLETED: { label: 'COMPLETED', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' },
  CANCELLED: { label: 'CANCELLED', className: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold' },
  DEFERRED: { label: 'DEFERRED', className: 'bg-slate-100 text-slate-700 border-slate-200 font-semibold' },
};

export const ActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAct, setEditingAct] = useState<ActivityItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [subject, setSubject] = useState('');
  const [type, setType] = useState<ActivityType>('CALL');
  const [priority, setPriority] = useState<ActivityPriority>('MEDIUM');
  const [status, setStatus] = useState<ActivityStatus>('PENDING');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('09:00');
  const [accountName, setAccountName] = useState('');
  const [contactName, setContactName] = useState('');
  const [assignedTo, setAssignedTo] = useState('Alex Nguyen');
  const [description, setDescription] = useState('');

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await activityApi.list({
        search: searchQuery,
        type: selectedType,
        priority: selectedPriority,
        status: selectedStatus,
        page,
        size: pageSize,
      });
      setActivities(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch {
      toast.error('Unable to load activities list');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedType, selectedPriority, selectedStatus, page, pageSize]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('ALL');
    setSelectedPriority('ALL');
    setSelectedStatus('ALL');
    setPage(0);
    fetchActivities();
  };

  const handleOpenCreate = () => {
    setEditingAct(null);
    setSubject('');
    setType('CALL');
    setPriority('MEDIUM');
    setStatus('PENDING');
    setDueDate(new Date().toISOString().split('T')[0]);
    setDueTime('09:00');
    setAccountName('');
    setContactName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (act: ActivityItem) => {
    setEditingAct(act);
    setSubject(act.subject);
    setType(act.type);
    setPriority(act.priority);
    setStatus(act.status);
    setDueDate(act.dueDate);
    setDueTime(act.dueTime || '09:00');
    setAccountName(act.accountName || '');
    setContactName(act.contactName || '');
    setAssignedTo(act.assignedTo);
    setDescription(act.description || '');
    setIsModalOpen(true);
  };

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      toast.error('Please enter Activity Subject');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingAct) {
        await activityApi.update(editingAct.id, {
          version: editingAct.version || 1,
          subject,
          type,
          priority,
          status,
          dueDate,
          dueTime,
          accountName,
          contactName,
          assignedTo,
          description,
        });
        toast.success('Activity updated successfully!');
      } else {
        await activityApi.create({
          subject,
          type,
          priority,
          status,
          dueDate: dueDate || new Date().toISOString().split('T')[0],
          dueTime: dueTime || '09:00',
          accountName: accountName || 'Client Account',
          contactName: contactName || 'Contact Representative',
          assignedTo: assignedTo || 'Alex Nguyen',
          description,
        });
        toast.success('New activity task created successfully!');
      }
      setIsModalOpen(false);
      fetchActivities();
    } catch {
      toast.error('Unable to save activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (act: ActivityItem) => {
    try {
      await activityApi.complete(act.id, act.version || 1);
      toast.success(`Updated status for "${act.subject}"`);
      fetchActivities();
    } catch {
      toast.error('Unable to update activity status');
    }
  };

  const handleDelete = async (id: string, sub: string) => {
    if (!window.confirm(`Are you sure you want to delete activity "${sub}"?`)) return;
    try {
      await activityApi.delete(id);
      toast.success(`Deleted activity "${sub}"`);
      fetchActivities();
    } catch {
      toast.error('Unable to delete activity');
    }
  };

  // KPI Metrics
  const callsCount = activities.filter((a) => a.type === 'CALL').length;
  const meetingsCount = activities.filter((a) => a.type === 'MEETING').length;
  const pendingCount = activities.filter((a) => a.status === 'PENDING').length;

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedType !== 'ALL' ? 1 : 0) +
    (selectedPriority !== 'ALL' ? 1 : 0) +
    (selectedStatus !== 'ALL' ? 1 : 0);

  // View Tabs Config
  const viewTabs: ViewTabItem[] = [
    { id: 'ALL', label: 'All Activities', count: totalElements },
    { id: 'CALL', label: 'Telesales Calls', count: callsCount, icon: Phone, dotColor: 'bg-emerald-500' },
    { id: 'MEETING', label: 'Demos & Meetings', count: meetingsCount, icon: Users, dotColor: 'bg-purple-500' },
    { id: 'PENDING', label: 'Pending Action', count: pendingCount, icon: Clock, dotColor: 'bg-amber-500' },
  ];

  const currentActiveTab = selectedType === 'CALL' ? 'CALL' : selectedType === 'MEETING' ? 'MEETING' : selectedStatus === 'PENDING' ? 'PENDING' : 'ALL';

  const handleTabChange = (tabId: string) => {
    if (tabId === 'CALL') {
      setSelectedType('CALL');
      setSelectedStatus('ALL');
    } else if (tabId === 'MEETING') {
      setSelectedType('MEETING');
      setSelectedStatus('ALL');
    } else if (tabId === 'PENDING') {
      setSelectedStatus('PENDING');
      setSelectedType('ALL');
    } else {
      setSelectedType('ALL');
      setSelectedStatus('ALL');
    }
    setPage(0);
  };

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Page Header */}
      <StandardPageHeader
        title="Activities &amp; Task Management"
        subtitle="Schedule sales calls, client presentations, follow-up emails &amp; customer engagement milestones"
        icon={Calendar}
        badgeCount={totalElements}
        badgeLabel="activities"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchActivities}
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
              <span>New Activity</span>
            </Button>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-[4px] border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Total Tasks</div>
            <div className="text-lg font-black text-slate-900 leading-tight">{totalElements}</div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-emerald-100 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <Phone className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Outbound Calls</div>
            <div className="text-lg font-black text-emerald-700 leading-tight">{callsCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-purple-100 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <Users className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Demos &amp; Meetings</div>
            <div className="text-lg font-black text-purple-700 leading-tight">{meetingsCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-amber-100 px-4 py-3 flex items-center gap-3 shadow-none">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <Clock className="w-4.5 h-4.5 text-amber-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Pending Execution</div>
            <div className="text-lg font-black text-amber-700 leading-tight">{pendingCount}</div>
          </div>
        </div>
      </div>

      {/* Standard Filter Bar */}
      <StandardFilterBar
        searchQuery={searchQuery}
        onSearchChange={(val) => { setSearchQuery(val); setPage(0); }}
        searchPlaceholder="Search activity subject, account, description..."
        viewTabs={viewTabs}
        activeTab={currentActiveTab}
        onTabChange={handleTabChange}
        activeFiltersCount={activeFiltersCount}
        onResetFilters={handleResetFilters}
        filterControls={
          <>
            <div className="w-36">
              <Select value={selectedType} onValueChange={(val) => { setSelectedType(val); setPage(0); }}>
                <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                  <SelectValue placeholder="Activity Type" />
                </SelectTrigger>
                <SelectContent className="rounded-[3px]">
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="CALL">Call</SelectItem>
                  <SelectItem value="MEETING">Meeting</SelectItem>
                  <SelectItem value="TASK">Task</SelectItem>
                  <SelectItem value="EMAIL">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-36">
              <Select value={selectedStatus} onValueChange={(val) => { setSelectedStatus(val); setPage(0); }}>
                <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-[3px]">
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                  <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-36">
              <Select value={selectedPriority} onValueChange={(val) => { setSelectedPriority(val); setPage(0); }}>
                <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="rounded-[3px]">
                  <SelectItem value="ALL">All Priorities</SelectItem>
                  <SelectItem value="HIGH">HIGH</SelectItem>
                  <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                  <SelectItem value="LOW">LOW</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        }
      />

      {/* Activities Table */}
      <Card className="overflow-hidden border border-slate-200 rounded-[4px] bg-white shadow-none">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F7F8F9] border-b border-slate-200 hover:bg-[#F7F8F9]">
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Activity Subject</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Type</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Organization &amp; Contact</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Due Date</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Priority</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Status</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3 text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-xs">Loading activities...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : activities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <EmptyState
                      icon={Calendar}
                      title="No activities found"
                      description="Try adjusting your filter criteria or schedule a new customer engagement task."
                      actionLabel="Create Activity"
                      onAction={handleOpenCreate}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                activities.map((act) => {
                  const TypeIcon = TYPE_ICON_MAP[act.type] || Calendar;
                  const typeInfo = ACTIVITY_TYPE_CONFIG[act.type] || { label: act.type, className: 'bg-slate-100 text-slate-700' };
                  const statusInfo = STATUS_CONFIG[act.status] || STATUS_CONFIG.PENDING;

                  return (
                    <TableRow key={act.id} className="hover:bg-[#F1F2F4] transition-colors border-b border-[#EBECF0] text-xs">
                      {/* Subject */}
                      <TableCell className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-[3px] bg-[#E9F2FF] text-[#0C66E4] border border-[#C0D9FF] font-bold text-xs flex items-center justify-center shrink-0">
                            <TypeIcon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{act.subject}</div>
                            {act.description && (
                              <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{act.description}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Type */}
                      <TableCell className="py-2 px-3">
                        <Badge className={`${typeInfo.className} text-[10px] px-1.5 py-0.5 rounded-[3px] font-bold`}>
                          {typeInfo.label}
                        </Badge>
                      </TableCell>

                      {/* Account */}
                      <TableCell className="py-2 px-3">
                        <div>
                          <div className="font-medium text-slate-800 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{act.accountName || 'Client'}</span>
                          </div>
                          {act.contactName && (
                            <div className="text-[11px] text-slate-500 mt-0.5">{act.contactName}</div>
                          )}
                        </div>
                      </TableCell>

                      {/* Due Date */}
                      <TableCell className="py-2 px-3 font-mono text-slate-600 text-[11px]">
                        <div>{act.dueDate}</div>
                        {act.dueTime && <div className="text-slate-400 text-[10px]">{act.dueTime}</div>}
                      </TableCell>

                      {/* Priority */}
                      <TableCell className="py-2 px-3">
                        {renderPriorityBadge(act.priority)}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-2 px-3">
                        <Badge className={`${statusInfo.className} text-[11px] rounded-[3px]`}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-2 px-3 text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          {act.status !== 'COMPLETED' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleComplete(act)}
                              className="h-7 w-7 rounded-[3px] text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              title="Mark as Completed"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <ActionTooltip label="Chỉnh sửa hoạt động">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(act)}
                              className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-[#0C66E4] hover:bg-[#E9F2FF]"
                              aria-label="Edit Activity"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          </ActionTooltip>
                          <ActionTooltip label="Xóa hoạt động">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(act.id, act.subject)}
                              className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-red-600 hover:bg-red-50"
                              aria-label="Delete Activity"
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
            itemLabel="activities"
          />
        )}
      </Card>

      {/* Create / Edit Activity Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border border-slate-200 shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingAct ? 'Edit Activity Details' : 'Create New Activity'}
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    Schedule client calls, demonstration meetings or follow-up milestones
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveActivity} className="p-6 space-y-4">
            <div>
              <Label className="text-xs font-semibold text-slate-700">
                Activity Subject <span className="text-rose-500">*</span>
              </Label>
              <Input
                required
                placeholder="e.g. Schedule architecture review call with CTO"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-9 text-xs border-slate-200 mt-1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Type</Label>
                <Select value={type} onValueChange={(val: any) => setType(val)}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CALL">Call</SelectItem>
                    <SelectItem value="MEETING">Meeting</SelectItem>
                    <SelectItem value="TASK">Task</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Priority Level</Label>
                <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">HIGH</SelectItem>
                    <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                    <SelectItem value="LOW">LOW</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Status</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">PENDING</SelectItem>
                    <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                    <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Due Date</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Time</Label>
                <Input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Client Organization</Label>
                <Input
                  placeholder="Enter company..."
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Contact Representative</Label>
                <Input
                  placeholder="Enter representative..."
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Commercial Notes &amp; Scope</Label>
              <textarea
                rows={3}
                placeholder="Prepare solution architecture overview deck and demo key security controls..."
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
                <span>{editingAct ? 'Save Changes' : 'Create Activity'}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActivitiesPage;
