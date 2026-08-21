import React, { useState, useEffect, useCallback } from 'react';
import {
  contactApi,
  ContactItem,
} from '@/services/api/contactApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { QuickCallLogModal } from '@/features/crm/call/QuickCallLogModal';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';
import { StandardFilterBar, ViewTabItem } from '@/components/common/StandardFilterBar';
import { StandardPagination } from '@/components/common/StandardPagination';
import {
  Users,
  Building2,
  Phone,
  Mail,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Star,
  Loader2,
  PhoneCall,
} from 'lucide-react';

export const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [primaryOnly, setPrimaryOnly] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [callingContact, setCallingContact] = useState<ContactItem | null>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [salutation, setSalutation] = useState<'MR' | 'MS' | 'MRS' | 'DR'>('MR');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [accountName, setAccountName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await contactApi.list({
        search: searchQuery,
        status: selectedStatus,
        page,
        size: pageSize,
      });
      let list = res.content || [];
      if (selectedDepartment !== 'ALL') {
        list = list.filter((c) => c.department === selectedDepartment);
      }
      if (primaryOnly) {
        list = list.filter((c) => c.isPrimaryContact);
      }
      setContacts(list);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch {
      toast.error('Unable to load contacts list from server');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedStatus, selectedDepartment, primaryOnly, page, pageSize]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedDepartment('ALL');
    setPrimaryOnly(false);
    setPage(0);
    fetchContacts();
  };

  const handleOpenCreate = () => {
    setEditingContact(null);
    setFullName('');
    setSalutation('MR');
    setJobTitle('');
    setDepartment('');
    setAccountName('');
    setEmail('');
    setPhone('');
    setCity('');
    setIsPrimary(false);
    setStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (contact: ContactItem) => {
    setEditingContact(contact);
    setFullName(contact.fullName);
    setSalutation((contact.salutation as any) || 'MR');
    setJobTitle(contact.jobTitle || '');
    setDepartment(contact.department || '');
    setAccountName(contact.accountName || '');
    setEmail(contact.email || '');
    setPhone(contact.phone || '');
    setCity(contact.city || '');
    setIsPrimary(!!contact.isPrimaryContact);
    setStatus((contact.status as any) || 'ACTIVE');
    setIsModalOpen(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error('Please enter both Full Name and Email Address');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingContact) {
        await contactApi.update(editingContact.id, {
          version: editingContact.version ?? 1,
          displayName: fullName,
          fullName,
          salutation,
          jobTitle,
          department,
          email,
          phone,
          city,
          isPrimaryContact: isPrimary,
          status,
        });
        toast.success('Contact updated successfully!');
      } else {
        await contactApi.create({
          displayName: fullName,
          fullName,
          salutation,
          jobTitle: jobTitle || 'Representative',
          department: department || 'Sales & Business',
          email,
          phone,
          city: city || 'Hanoi',
          isPrimaryContact: isPrimary,
          status,
        });
        toast.success('New contact created successfully!');
      }
      setIsModalOpen(false);
      fetchContacts();
    } catch {
      toast.error('Unable to save contact details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete contact "${name}"?`)) return;
    try {
      await contactApi.delete(id);
      toast.success(`Deleted contact "${name}"`);
      fetchContacts();
    } catch {
      toast.error('Unable to delete contact');
    }
  };

  // KPI Metrics
  const activeCount = contacts.filter((c) => c.status === 'ACTIVE').length;
  const primaryCount = contacts.filter((c) => c.isPrimaryContact).length;

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedStatus !== 'ALL' ? 1 : 0) +
    (selectedDepartment !== 'ALL' ? 1 : 0) +
    (primaryOnly ? 1 : 0);

  // View Tabs Config
  const viewTabs: ViewTabItem[] = [
    { id: 'ALL', label: 'All', count: totalElements },
    { id: 'ACTIVE', label: 'Active', count: activeCount, dotColor: 'bg-emerald-500' },
    { id: 'PRIMARY', label: 'Primary Representatives', count: primaryCount, icon: Star },
  ];

  const currentActiveTab = primaryOnly ? 'PRIMARY' : selectedStatus === 'ACTIVE' ? 'ACTIVE' : 'ALL';

  const handleTabChange = (tabId: string) => {
    if (tabId === 'PRIMARY') {
      setPrimaryOnly(true);
      setSelectedStatus('ALL');
    } else if (tabId === 'ACTIVE') {
      setPrimaryOnly(false);
      setSelectedStatus('ACTIVE');
    } else {
      setPrimaryOnly(false);
      setSelectedStatus('ALL');
    }
    setPage(0);
  };

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Page Header */}
      <StandardPageHeader
        title="Customer &amp; Client Contacts"
        subtitle="Manage business cards, contact directories, organizational roles &amp; key account representatives"
        icon={Users}
        badgeCount={totalElements}
        badgeLabel="contacts"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchContacts}
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
              <span>New Contact</span>
            </Button>
          </>
        }
      />

      {/* Standard Filter & Search Bar */}
      <StandardFilterBar
        searchQuery={searchQuery}
        onSearchChange={(val) => { setSearchQuery(val); setPage(0); }}
        searchPlaceholder="Search by name, email, phone..."
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
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-44">
              <Select value={selectedDepartment} onValueChange={(val) => { setSelectedDepartment(val); setPage(0); }}>
                <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent className="rounded-[3px]">
                  <SelectItem value="ALL">All Departments</SelectItem>
                  <SelectItem value="Executive Board">Executive Board</SelectItem>
                  <SelectItem value="IT & Technology">IT &amp; Technology</SelectItem>
                  <SelectItem value="Finance & Accounting">Finance &amp; Accounting</SelectItem>
                  <SelectItem value="Procurement & Supply">Procurement &amp; Supply</SelectItem>
                  <SelectItem value="Sales & Business">Sales &amp; Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        }
      />

      {/* Contacts Table */}
      <Card className="overflow-hidden border border-slate-200 rounded-[4px] bg-white shadow-none">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F7F8F9] border-b border-slate-200 hover:bg-[#F7F8F9]">
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Contact Name</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Organization</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Role &amp; Department</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Communication Channels</TableHead>
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
                      <span className="text-xs">Loading contacts...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <EmptyState
                      icon={Users}
                      title="No contacts found"
                      description="Try adjusting your search criteria or add a new contact."
                      actionLabel="Add Contact"
                      onAction={handleOpenCreate}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => (
                  <TableRow key={contact.id} className="hover:bg-[#F1F2F4] transition-colors border-b border-[#EBECF0] text-xs">
                    {/* Name */}
                    <TableCell className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-[3px] bg-[#E9F2FF] text-[#0C66E4] border border-[#C0D9FF] font-bold text-xs flex items-center justify-center shrink-0">
                          {contact.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span>{contact.fullName}</span>
                            {contact.isPrimaryContact && (
                              <span className="bg-[#EAE6FF] text-[#403294] text-[10px] px-1 py-0.2 rounded-[2px] font-bold inline-flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-[#403294] text-[#403294]" />
                                Primary
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{contact.id.toUpperCase()}</div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Organization */}
                    <TableCell className="py-2 px-3">
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{contact.accountName}</span>
                      </div>
                    </TableCell>

                    {/* Role & Department */}
                    <TableCell className="py-2 px-3">
                      <div>
                        <div className="font-medium text-slate-800">{contact.jobTitle || 'Specialist'}</div>
                        <div className="text-[11px] text-slate-500">{contact.department || 'Commercial Division'}</div>
                      </div>
                    </TableCell>

                    {/* Communication */}
                    <TableCell className="py-2 px-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="font-mono text-[11px]">{contact.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="font-mono text-[11px]">{contact.phone}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-2 px-3">
                      {contact.status === 'ACTIVE' ? (
                        <span className="bg-[#E3FCEF] text-[#006644] font-bold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="bg-[#FFFAE6] text-[#974F0C] font-bold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5">
                          INACTIVE
                        </span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-2 px-3 text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCallingContact(contact);
                            setIsCallModalOpen(true);
                          }}
                          className="h-7 w-7 rounded-[3px] text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          title="Quick Call & Log Activity"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </Button>
                        <ActionTooltip label="Chỉnh sửa liên hệ">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(contact)}
                            className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-[#0C66E4] hover:bg-[#E9F2FF]"
                            aria-label="Edit Contact"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        </ActionTooltip>
                        <ActionTooltip label="Xóa liên hệ">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(contact.id, contact.fullName)}
                            className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-red-600 hover:bg-red-50"
                            aria-label="Delete Contact"
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
            itemLabel="contacts"
          />
        )}
      </Card>

      {/* Create / Edit Contact Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border border-slate-200 shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingContact ? 'Edit Contact Details' : 'Create New Contact'}
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    {editingContact ? `Contact ID: ${editingContact.id.toUpperCase()}` : 'Add business contact card & communication channels'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveContact} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Honorific</Label>
                <Select value={salutation} onValueChange={(val: any) => setSalutation(val)}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MR">Mr.</SelectItem>
                    <SelectItem value="MS">Ms.</SelectItem>
                    <SelectItem value="MRS">Mrs.</SelectItem>
                    <SelectItem value="DR">Dr.</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Full Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  placeholder="e.g. David Harrison"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Associated Organization / Company</Label>
                <Input
                  placeholder="Enter organization name..."
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Job Title</Label>
                <Input
                  placeholder="e.g. Chief Technology Officer (CTO)"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Department</Label>
                <Input
                  placeholder="e.g. Technology & Engineering"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">City / Location</Label>
                <Input
                  placeholder="e.g. Hanoi"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Work Email <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Mobile Phone</Label>
                <Input
                  placeholder="+84 912 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="primary-checkbox"
                  checked={isPrimary}
                  onCheckedChange={(checked) => setIsPrimary(!!checked)}
                />
                <label htmlFor="primary-checkbox" className="text-xs font-semibold text-slate-800 cursor-pointer select-none">
                  Set as Primary Key Account Representative
                </label>
              </div>

              <div className="w-40">
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className="h-8.5 text-xs border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                    <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                  </SelectContent>
                </Select>
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
                <span>{editingContact ? 'Save Changes' : 'Create Contact'}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quick Call Log Modal */}
      {callingContact && (
        <QuickCallLogModal
          open={isCallModalOpen}
          onClose={() => {
            setIsCallModalOpen(false);
            setCallingContact(null);
          }}
          targetName={callingContact.fullName}
          targetPhone={callingContact.phone || ''}
          entityType="CONTACT"
          entityId={callingContact.id}
          onCallLogged={fetchContacts}
        />
      )}
    </div>
  );
};

export default ContactsPage;
