import React, { useState, useEffect, useCallback } from 'react';
import {
  mockContactsApi,
  ContactItem,
} from '@/services/mock/mockContactsData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { EmptyState } from '@/components/common/EmptyState';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
  Save,
  MapPin,
} from 'lucide-react';

export const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
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
      setContacts(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch {
      toast.error('Không thể tải danh sách người liên hệ');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedStatus, page, pageSize]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            <span>Người liên hệ</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý thông tin danh thiếp, chức danh và kênh liên lạc của các nhân sự đối tác
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchContacts}
            disabled={loading}
            className="h-9 px-3 text-xs font-semibold gap-1.5 shadow-2xs border-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Người liên hệ</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng người liên hệ</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{totalElements}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đang hoạt động</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Liên hệ chính (Primary)</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{primaryCount}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Công ty liên kết</p>
              <h3 className="text-2xl font-black text-purple-600 mt-1">7</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Card */}
      <Card className="border-slate-200 shadow-2xs bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80 focus-within:border-blue-500 focus-within:bg-white transition-all">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Tìm kiếm theo họ tên, email, số điện thoại, công ty..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-48">
                <SearchableSelect
                  placeholder="Lọc trạng thái..."
                  searchPlaceholder="Tìm trạng thái..."
                  value={selectedStatus}
                  onValueChange={(val) => {
                    setSelectedStatus(val);
                    setPage(0);
                  }}
                  options={[
                    { label: 'Tất cả trạng thái', value: 'ALL' },
                    { label: 'Đang hoạt động', value: 'ACTIVE' },
                    { label: 'Ngừng hoạt động', value: 'INACTIVE' },
                  ]}
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card className="border-slate-200 shadow-2xs bg-white overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Đang tải danh sách người liên hệ...</span>
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Users}
              title="Không tìm thấy người liên hệ nào"
              description="Thử thay đổi bộ lọc tìm kiếm hoặc thêm mới người liên hệ đầu tiên."
              actionLabel="Thêm Người liên hệ"
              onAction={handleOpenCreate}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 pl-5">Họ & Tên</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Chức danh & Phòng ban</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Khách hàng / Doanh nghiệp</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Kênh liên lạc</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Trạng thái</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 text-right pr-5">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {contacts.map((contact) => (
                  <TableRow key={contact.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="pl-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100/80 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {contact.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-xs">{contact.fullName}</span>
                            {contact.isPrimaryContact && (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold px-1.5 py-0">
                                Chính
                              </Badge>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-300" />
                            {contact.city}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5">
                      <p className="text-xs font-semibold text-slate-800">{contact.jobTitle}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{contact.department}</p>
                    </TableCell>

                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{contact.accountName}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700">
                          <Mail className="w-3 h-3 text-blue-500 shrink-0" />
                          <span>{contact.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{contact.phone}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5">
                      {contact.status === 'ACTIVE' ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-xs">
                          Đang hoạt động
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300 font-semibold text-xs">
                          Ngừng hoạt động
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right pr-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(contact)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(contact.id, contact.fullName)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && contacts.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>Hiển thị</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setPage(0);
                }}
              >
                <SelectTrigger className="h-8 w-16 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>trên tổng số <b>{totalElements}</b> bản ghi</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">
                Trang {page + 1} / {totalPages || 1}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl bg-white p-0 gap-0 overflow-hidden font-sans border-slate-200 shadow-xl rounded-2xl">
          <DialogHeader className="p-5 pb-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  {editingContact ? 'Chỉnh sửa Người liên hệ' : 'Thêm Người liên hệ mới'}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Nhập thông tin nhân sự đối tác và kênh liên lạc trực tiếp
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveContact} className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Họ và tên *</Label>
                <Input
                  placeholder="VD: Nguyễn Văn An"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Danh xưng</Label>
                <Select value={salutation} onValueChange={(v) => setSalutation(v as any)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MR">Ông (Mr.)</SelectItem>
                    <SelectItem value="MS">Bà / Cô (Ms.)</SelectItem>
                    <SelectItem value="MRS">Bà (Mrs.)</SelectItem>
                    <SelectItem value="DR">Tiến sĩ (Dr.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Chức danh</Label>
                <Input
                  placeholder="VD: Giám đốc Mua sắm"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Phòng ban</Label>
                <Input
                  placeholder="VD: Phòng Cung ứng"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 text-xs">Khách hàng / Doanh nghiệp</Label>
              <Input
                placeholder="VD: Tập đoàn Công nghệ FPT"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Địa chỉ Email *</Label>
                <Input
                  type="email"
                  placeholder="VD: an.nguyen@company.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Số điện thoại</Label>
                <Input
                  placeholder="VD: 0912 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Tỉnh / Thành phố</Label>
                <Input
                  placeholder="VD: Hà Nội"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Trạng thái</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                    <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-2 flex items-center space-x-2 border-t border-slate-100">
              <Checkbox
                id="contactPrimaryCheck"
                checked={isPrimary}
                onCheckedChange={(c) => setIsPrimary(Boolean(c))}
              />
              <Label
                htmlFor="contactPrimaryCheck"
                className="text-xs font-semibold text-slate-700 cursor-pointer select-none"
              >
                Đặt làm Người liên hệ Chính của Khách hàng
              </Label>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="h-9 text-xs font-semibold px-4"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 gap-1.5"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{editingContact ? 'Lưu Thay đổi' : 'Tạo Người liên hệ'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
