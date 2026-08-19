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
      toast.error('Không thể tải danh sách người liên hệ');
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
    setCity('Hà Nội');
    setIsPrimary(false);
    setStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (contact: ContactItem) => {
    setEditingContact(contact);
    setFullName(contact.fullName);
    setSalutation(contact.salutation || 'MR');
    setJobTitle(contact.jobTitle || '');
    setDepartment(contact.department || '');
    setAccountName(contact.accountName || '');
    setEmail(contact.email || '');
    setPhone(contact.phone || '');
    setCity(contact.city || '');
    setIsPrimary(contact.isPrimaryContact || false);
    setStatus(contact.status);
    setIsModalOpen(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error('Vui lòng nhập họ tên và email');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingContact) {
        await contactApi.update(editingContact.id, {
          version: editingContact.version || 1,
          fullName,
          salutation,
          jobTitle,
          department,
          displayName: fullName,
          email,
          phone,
          city,
          isPrimaryContact: isPrimary,
          status,
        });
        toast.success('Đã cập nhật thông tin người liên hệ!');
      } else {
        await contactApi.create({
          fullName,
          salutation,
          jobTitle,
          department,
          displayName: fullName,
          email,
          phone,
          city: city || 'Hà Nội',
          isPrimaryContact: isPrimary,
          status,
        });
        toast.success('Đã thêm người liên hệ mới thành công!');
      }
      setIsModalOpen(false);
      fetchContacts();
    } catch {
      toast.error('Không thể lưu thông tin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa người liên hệ "${name}"?`)) return;
    try {
      await contactApi.delete(id);
      toast.success(`Đã xóa liên hệ "${name}"`);
      fetchContacts();
    } catch {
      toast.error('Không thể xóa người liên hệ');
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
    { id: 'ALL', label: 'Tất cả', count: totalElements },
    { id: 'ACTIVE', label: 'Đang hoạt động', count: activeCount, dotColor: 'bg-emerald-500' },
    { id: 'PRIMARY', label: 'Đại diện chính', count: primaryCount, icon: Star },
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
        title="Quản lý Người liên hệ"
        subtitle="Quản lý danh thiếp, thông tin liên lạc, chức vụ & người đại diện chính của doanh nghiệp đối tác"
        icon={Users}
        badgeCount={totalElements}
        badgeLabel="nhân sự"
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
              <span>Làm mới</span>
            </Button>

            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white gap-1.5 shadow-none h-8 rounded-[3px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Liên hệ</span>
            </Button>
          </>
        }
      />

      {/* Standard Filter & Search Bar */}
      <StandardFilterBar
        searchQuery={searchQuery}
        onSearchChange={(val) => { setSearchQuery(val); setPage(0); }}
        searchPlaceholder="Tìm kiếm theo họ tên, email, điện thoại..."
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
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent className="rounded-[3px]">
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                  <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-40">
              <Select value={selectedDepartment} onValueChange={(val) => { setSelectedDepartment(val); setPage(0); }}>
                <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                  <SelectValue placeholder="Phòng ban" />
                </SelectTrigger>
                <SelectContent className="rounded-[3px]">
                  <SelectItem value="ALL">Tất cả phòng ban</SelectItem>
                  <SelectItem value="Ban Giám Đốc">Ban Giám Đốc</SelectItem>
                  <SelectItem value="Phòng Công Nghệ (IT)">Phòng Công Nghệ</SelectItem>
                  <SelectItem value="Phòng Tài Chính Kế Toán">Phòng Tài Chính</SelectItem>
                  <SelectItem value="Phòng Mua Hàng & Cung Ứng">Phòng Mua Hàng</SelectItem>
                  <SelectItem value="Phòng Kinh Doanh">Phòng Kinh Doanh</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        }
      />

      {/* ── Contacts Table ── */}
      <Card className="overflow-hidden border border-slate-200 rounded-[4px] bg-white shadow-none">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F7F8F9] border-b border-slate-200 hover:bg-[#F7F8F9]">
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Họ &amp; Tên Người liên hệ</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Thuộc Doanh nghiệp</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Chức vụ &amp; Phòng ban</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Kênh Liên lạc</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Trạng thái</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3 text-right pr-4">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-xs">Đang tải danh sách người liên hệ...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <EmptyState
                      icon={Users}
                      title="Không tìm thấy người liên hệ nào"
                      description="Hãy thử thay đổi điều kiện tìm kiếm hoặc thêm người liên hệ mới."
                      actionLabel="Thêm Người liên hệ"
                      onAction={handleOpenCreate}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => (
                  <TableRow key={contact.id} className="hover:bg-[#F1F2F4] transition-colors border-b border-[#EBECF0] text-xs">
                    {/* Cột 1: Tên */}
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
                                Chính
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{contact.id.toUpperCase()}</div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Cột 2: Doanh nghiệp */}
                    <TableCell className="py-2 px-3">
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{contact.accountName}</span>
                      </div>
                    </TableCell>

                    {/* Cột 3: Chức vụ & Phòng ban */}
                    <TableCell className="py-2 px-3">
                      <div>
                        <div className="font-medium text-slate-800">{contact.jobTitle || 'Chuyên viên'}</div>
                        <div className="text-[11px] text-slate-500">{contact.department || 'Phòng Kinh Doanh'}</div>
                      </div>
                    </TableCell>

                    {/* Cột 4: Kênh liên lạc */}
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

                    {/* Cột 5: Trạng thái */}
                    <TableCell className="py-2 px-3">
                      {contact.status === 'ACTIVE' ? (
                        <span className="bg-[#E3FCEF] text-[#006644] font-bold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5">
                          Hoạt động
                        </span>
                      ) : (
                        <span className="bg-[#FFFAE6] text-[#974F0C] font-bold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5">
                          Ngừng hoạt động
                        </span>
                      )}
                    </TableCell>

                    {/* Cột 6: Thao tác */}
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
                          title="Gọi nhanh & Ghi nhận nhật ký cuộc gọi"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(contact)}
                          className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-[#0C66E4] hover:bg-[#E9F2FF]"
                          title="Chỉnh sửa liên hệ"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(contact.id, contact.fullName)}
                          className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-red-600 hover:bg-red-50"
                          title="Xóa liên hệ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination Bar ── */}
        {/* ── Standard Pagination Bar ── */}
        {!loading && (
          <StandardPagination
            currentPage={page + 1}
            totalPages={Math.max(totalPages, 1)}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p - 1)}
            itemLabel="người liên hệ"
          />
        )}
      </Card>

      {/* ── Create / Edit Contact Modal ── */}
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
                    {editingContact ? 'Chỉnh sửa Người liên hệ' : 'Thêm Người liên hệ Mới'}
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    {editingContact ? `Mã: ${editingContact.id.toUpperCase()}` : 'Cập nhật danh thiếp & kênh liên lạc của nhân sự'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveContact} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Danh xưng</Label>
                <Select value={salutation} onValueChange={(val: any) => setSalutation(val)}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MR">Ông (Mr.)</SelectItem>
                    <SelectItem value="MS">Bà / Cô (Ms.)</SelectItem>
                    <SelectItem value="MRS">Bà (Mrs.)</SelectItem>
                    <SelectItem value="DR">Tiến sĩ / Bác sĩ (Dr.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Họ và tên <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Thuộc Doanh nghiệp / Tổ chức</Label>
                <Input
                  placeholder="Nhập tên doanh nghiệp..."
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Chức vụ</Label>
                <Input
                  placeholder="Ví dụ: Giám đốc Kỹ thuật (CTO)"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Phòng ban</Label>
                <Input
                  placeholder="Ví dụ: Phòng Công Nghệ"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Tỉnh / Thành phố</Label>
                <Input
                  placeholder="Ví dụ: Hà Nội"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Email làm việc <span className="text-rose-500">*</span>
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
                <Label className="text-xs font-semibold text-slate-700">Số điện thoại di động</Label>
                <Input
                  placeholder="0912 345 678"
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
                  Đặt làm Người liên hệ đại diện chính
                </label>
              </div>

              <div className="w-40">
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className="h-8.5 text-xs border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                    <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
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
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs h-9"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>{editingContact ? 'Lưu Thay Đổi' : 'Thêm Người Liên Hệ'}</span>
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
