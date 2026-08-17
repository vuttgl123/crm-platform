import React, { useState, useEffect, useCallback } from 'react';
import {
  mockContactsApi,
  ContactItem,
} from '@/services/mock/mockContactsData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Users,
  UserCheck,
  Building2,
  Phone,
  Mail,
  Search,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Star,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  RotateCcw,
  UserX,
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
      const res = await mockContactsApi.list({
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
    setJobTitle(contact.jobTitle);
    setDepartment(contact.department);
    setAccountName(contact.accountName);
    setEmail(contact.email);
    setPhone(contact.phone);
    setCity(contact.city);
    setIsPrimary(contact.isPrimaryContact);
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
        await mockContactsApi.update(editingContact.id, {
          fullName,
          salutation,
          jobTitle,
          department,
          accountName,
          email,
          phone,
          city,
          isPrimaryContact: isPrimary,
          status,
        });
        toast.success('Đã cập nhật thông tin người liên hệ!');
      } else {
        await mockContactsApi.create({
          fullName,
          salutation,
          jobTitle,
          department,
          accountId: 'acc-custom',
          accountName: accountName || 'Doanh nghiệp chưa gán',
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
      await mockContactsApi.delete(id);
      toast.success(`Đã xóa liên hệ "${name}"`);
      fetchContacts();
    } catch {
      toast.error('Không thể xóa người liên hệ');
    }
  };

  // KPI Metrics
  const activeCount = contacts.filter((c) => c.status === 'ACTIVE').length;
  const primaryCount = contacts.filter((c) => c.isPrimaryContact).length;
  const inactiveCount = contacts.filter((c) => c.status === 'INACTIVE').length;

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedStatus !== 'ALL' ? 1 : 0) +
    (selectedDepartment !== 'ALL' ? 1 : 0) +
    (primaryOnly ? 1 : 0);

  return (
    <div className="space-y-5 pb-12 font-sans w-full">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-xs shrink-0">
              <Users className="w-4.5 h-4.5 text-white" />
            </div>
            Quản lý Người liên hệ (Contacts)
          </h1>
          <p className="text-xs text-slate-500 mt-1 ml-10.5">
            Quản lý thông tin danh thiếp, chức danh và kênh liên lạc của các nhân sự đối tác
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchContacts}
            disabled={loading}
            className="text-xs gap-1.5 border-slate-200 h-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs h-8"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Người liên hệ Mới</span>
          </Button>
        </div>
      </div>

      {/* ── Quick Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Users className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Tổng Người liên hệ</div>
            <div className="text-lg font-black text-slate-900 leading-tight">{totalElements}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-emerald-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <UserCheck className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Đang hoạt động</div>
            <div className="text-lg font-black text-emerald-700 leading-tight">{activeCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-purple-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <Star className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Đại diện chính</div>
            <div className="text-lg font-black text-purple-700 leading-tight">{primaryCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-amber-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <UserX className="w-4.5 h-4.5 text-amber-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Ngừng hoạt động</div>
            <div className="text-lg font-black text-amber-700 leading-tight">{inactiveCount}</div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <Card className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Tìm kiếm theo họ tên, email, điện thoại, chức vụ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 text-xs h-8.5 bg-slate-50/60 focus:bg-white border-slate-200 rounded-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="w-36">
              <Select value={selectedStatus} onValueChange={(val) => { setSelectedStatus(val); setPage(0); }}>
                <SelectTrigger className="h-8.5 text-xs bg-slate-50/60 border-slate-200 rounded-lg">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                  <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-36">
              <Select value={selectedDepartment} onValueChange={(val) => { setSelectedDepartment(val); setPage(0); }}>
                <SelectTrigger className="h-8.5 text-xs bg-slate-50/60 border-slate-200 rounded-lg">
                  <SelectValue placeholder="Phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả phòng ban</SelectItem>
                  <SelectItem value="Ban Giám Đốc">Ban Giám Đốc</SelectItem>
                  <SelectItem value="Phòng Công Nghệ (IT)">Phòng Công Nghệ</SelectItem>
                  <SelectItem value="Phòng Tài Chính Kế Toán">Phòng Tài Chính</SelectItem>
                  <SelectItem value="Phòng Mua Hàng & Cung Ứng">Phòng Mua Hàng</SelectItem>
                  <SelectItem value="Phòng Kinh Doanh">Phòng Kinh Doanh</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50/80 border border-slate-200 rounded-lg h-8.5">
              <Checkbox
                id="filter-primary-contact"
                checked={primaryOnly}
                onCheckedChange={(checked) => setPrimaryOnly(!!checked)}
              />
              <label htmlFor="filter-primary-contact" className="text-xs text-slate-700 cursor-pointer font-medium select-none">
                Đại diện chính
              </label>
            </div>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs text-slate-500 hover:text-slate-800 gap-1 h-8.5 px-2"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt lại ({activeFiltersCount})</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* ── Contacts Table ── */}
      <Card className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200">
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 pl-4">Họ &amp; Tên Người liên hệ</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Thuộc Doanh nghiệp</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Chức vụ &amp; Phòng ban</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Kênh Liên lạc</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Trạng thái</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 text-right pr-4">Thao tác</TableHead>
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
                  <TableRow key={contact.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 text-xs">
                    {/* Cột 1: Tên */}
                    <TableCell className="pl-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {contact.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{contact.fullName}</span>
                            {contact.isPrimaryContact && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] px-1.5 py-0 font-bold gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-purple-600 text-purple-600" />
                                Chính
                              </Badge>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{contact.id.toUpperCase()}</div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Cột 2: Doanh nghiệp */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{contact.accountName}</span>
                      </div>
                    </TableCell>

                    {/* Cột 3: Chức vụ & Phòng ban */}
                    <TableCell>
                      <div>
                        <div className="font-semibold text-slate-800">{contact.jobTitle || 'Chuyên viên'}</div>
                        <div className="text-[11px] text-slate-500">{contact.department || 'Phòng Kinh Doanh'}</div>
                      </div>
                    </TableCell>

                    {/* Cột 4: Kênh liên lạc */}
                    <TableCell>
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
                    <TableCell>
                      {contact.status === 'ACTIVE' ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[11px]">
                          Hoạt động
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-semibold text-[11px]">
                          Ngừng hoạt động
                        </Badge>
                      )}
                    </TableCell>

                    {/* Cột 6: Thao tác */}
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(contact)}
                          className="h-7 w-7 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                          title="Chỉnh sửa thông tin"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(contact.id, contact.fullName)}
                          className="h-7 w-7 text-slate-600 hover:text-red-600 hover:bg-red-50"
                          title="Xóa người liên hệ"
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
        {!loading && contacts.length > 0 && (
          <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Hiển thị <span className="font-bold text-slate-800">{page * pageSize + 1}</span> -{' '}
              <span className="font-bold text-slate-800">{Math.min((page + 1) * pageSize, totalElements)}</span> trong tổng số{' '}
              <span className="font-bold text-slate-800">{totalElements}</span> người liên hệ
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 border-slate-200"
                onClick={() => setPage(0)}
                disabled={page === 0}
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 border-slate-200"
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                disabled={page === 0}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <div className="px-2 font-medium text-slate-700">
                Trang {page + 1} / {Math.max(totalPages, 1)}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 border-slate-200"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 border-slate-200"
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
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
    </div>
  );
};
