import React, { useState, useEffect } from 'react';
import {
  accountApi,
  AccountResponse,
  AccountSummaryResponse,
  AccountType,
  AccountLifecycleStage,
  UpdateAccountRequest,
} from '@/services/api/accountApi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Edit3, Loader2, Save, Building2, Users } from 'lucide-react';

import { useAuth } from '@/core/session/useAuth';

interface EditAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: AccountResponse | null;
  allAccounts?: AccountSummaryResponse[];
  onSuccess: () => void;
}

export const EditAccountModal: React.FC<EditAccountModalProps> = ({
  open,
  onOpenChange,
  account,
  allAccounts = [],
  onSuccess,
}) => {
  const { session } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [parentAccountId, setParentAccountId] = useState<string | undefined>(undefined);
  const [accountType, setAccountType] = useState<AccountType>('ORGANIZATION');
  const [lifecycleStage, setLifecycleStage] = useState<AccountLifecycleStage>('PROSPECT');
  const [taxIdentifier, setTaxIdentifier] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [industryCode, setIndustryCode] = useState('');
  const [website, setWebsite] = useState('');
  const [revenueAmount, setRevenueAmount] = useState('');
  const [currencyCode, setCurrencyCode] = useState('VND');
  const [employeeCount, setEmployeeCount] = useState('');
  const [description, setDescription] = useState('');
  const [doNotContact, setDoNotContact] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form when account prop changes
  useEffect(() => {
    if (account) {
      setDisplayName(account.displayName || '');
      setLegalName(account.legalName || '');
      setParentAccountId(account.parentAccountId || undefined);
      setAccountType(account.accountType || 'ORGANIZATION');
      setLifecycleStage(account.lifecycleStage || 'PROSPECT');
      setTaxIdentifier(account.taxIdentifier || '');
      setRegistrationNumber(account.registrationNumber || '');
      setIndustryCode(account.industryCode || '');
      setWebsite(account.website || '');
      setRevenueAmount(account.annualRevenue?.amount ? account.annualRevenue.amount.toString() : '');
      setCurrencyCode(account.annualRevenue?.currencyCode || 'VND');
      setEmployeeCount(account.employeeCount ? account.employeeCount.toString() : '');
      setDescription(account.description || '');
      setDoNotContact(Boolean(account.doNotContact));
    }
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    if (!displayName.trim()) {
      toast.error('Vui lòng nhập Tên hiển thị khách hàng');
      return;
    }

    setIsSubmitting(true);

    const payload: UpdateAccountRequest = {
      version: account.version,
      displayName: displayName.trim(),
      legalName: legalName.trim() || undefined,
      parentAccountId: parentAccountId && parentAccountId !== 'NONE' ? parentAccountId : undefined,
      accountType,
      lifecycleStage,
      taxIdentifier: taxIdentifier.trim() || undefined,
      registrationNumber: registrationNumber.trim() || undefined,
      industryCode: industryCode.trim() || undefined,
      website: website.trim() || undefined,
      annualRevenue: revenueAmount
        ? { amount: parseFloat(revenueAmount), currencyCode: currencyCode || 'VND' }
        : undefined,
      employeeCount: employeeCount ? parseInt(employeeCount, 10) : undefined,
      description: description.trim() || undefined,
      doNotContact,
      owner: account.owner ? { type: account.owner.type, id: account.owner.id } : undefined,
    };

    try {
      await accountApi.update(account.id, payload);
      toast.success(`Đã cập nhật thông tin khách hàng "${displayName}" thành công!`);
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Cập nhật thất bại. Vui lòng kiểm tra lại.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden font-sans border-slate-200 shadow-xl">
        <DialogHeader className="p-5 pb-4 border-b border-slate-200 bg-slate-50/90 shrink-0">
          <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-blue-600" />
            <span>Chỉnh sửa Thông tin Khách hàng</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-0.5">
            Cập nhật các thông tin đăng ký doanh nghiệp, khách hàng cha và pháp lý
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {/* Read-only Account Number Banner */}
            {account && (
              <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Mã Khách hàng (Cố định):</span>
                <span className="font-mono font-bold text-blue-700">{account.accountNumber}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="editDisplayName" className="text-xs font-semibold">Tên Khách hàng (Hiển thị) *</Label>
                <Input
                  id="editDisplayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ví dụ: Công ty Cổ phần Chứng khoán VNDIRECT"
                  required
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="editLegalName" className="text-xs font-semibold">Tên Pháp lý Đầy đủ</Label>
                <Input
                  id="editLegalName"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="Công ty Cổ phần / TNHH..."
                />
              </div>

              {/* Parent Account Select */}
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold flex items-center gap-1 text-slate-900">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Khách hàng Cha / Đơn vị cấp trên trực thuộc (parentAccountId)</span>
                </Label>
                <Select
                  value={parentAccountId || 'NONE'}
                  onValueChange={(v) => setParentAccountId(v === 'NONE' ? undefined : v)}
                >
                  <SelectTrigger className="text-xs bg-white border-slate-200 font-semibold">
                    <SelectValue placeholder="Chọn Khách hàng Cha / Đơn vị cấp trên" />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="NONE" className="font-semibold text-slate-700">
                      Không có (Khách hàng độc lập / Cấp cao nhất)
                    </SelectItem>
                    {allAccounts
                      .filter((acc) => acc.id !== account?.id)
                      .map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          🏢 {acc.accountNumber} - {acc.displayName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Automated Role-Based Owner Info Banner */}
              <div className="space-y-1 md:col-span-2 p-3 bg-blue-50/70 border border-blue-200/80 rounded-lg text-xs text-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900 block">Quyền Phụ trách Dữ liệu (Account Owner)</span>
                    <span className="text-[11px] text-slate-600">Được bảo lưu theo Vai trò & Phân quyền (`ScopeType`) hiện tại</span>
                  </div>
                </div>
                {account?.owner ? (
                  <Badge variant="outline" className={`font-bold text-[11px] px-2.5 py-1 shrink-0 ${
                    account.owner.type === 'TEAM'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {account.owner.type === 'TEAM'
                      ? '🏢 Nhóm / Team phụ trách'
                      : (session?.user && account.owner.id === session.user.id
                          ? `👤 ${session.user.email} (Chính tôi)`
                          : `👤 Cá nhân phụ trách`)}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 font-medium text-[11px] px-2.5 py-1 shrink-0">
                    Chưa gán
                  </Badge>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Loại hình Khách hàng</Label>
                <Select value={accountType} onValueChange={(v) => setAccountType(v as AccountType)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="ORGANIZATION">Doanh nghiệp</SelectItem>
                    <SelectItem value="PERSON">Cá nhân</SelectItem>
                    <SelectItem value="PARTNER">Đối tác chiến lược</SelectItem>
                    <SelectItem value="RESELLER">Đại lý ủy quyền</SelectItem>
                    <SelectItem value="SUPPLIER">Nhà cung cấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Giai đoạn Vòng đời</Label>
                <Select value={lifecycleStage} onValueChange={(v) => setLifecycleStage(v as AccountLifecycleStage)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="PROSPECT">Tiềm năng (Prospect)</SelectItem>
                    <SelectItem value="QUALIFIED">Đạt chuẩn (Qualified)</SelectItem>
                    <SelectItem value="CUSTOMER">Khách hàng chính thức</SelectItem>
                    <SelectItem value="CHURNED">Rời bỏ (Churned)</SelectItem>
                    <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editTaxId" className="text-xs font-semibold">Mã số thuế (MST)</Label>
                <Input
                  id="editTaxId"
                  value={taxIdentifier}
                  onChange={(e) => setTaxIdentifier(e.target.value)}
                  placeholder="Ví dụ: 0102065678"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editRegNo" className="text-xs font-semibold">Số Giấy phép ĐKKD</Label>
                <Input
                  id="editRegNo"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="Ví dụ: 0102065678-GP"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editIndustry" className="text-xs font-semibold">Ngành nghề / Lĩnh vực</Label>
                <Input
                  id="editIndustry"
                  value={industryCode}
                  onChange={(e) => setIndustryCode(e.target.value)}
                  placeholder="Ví dụ: Tài chính & Chứng khoán"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editWebsite" className="text-xs font-semibold">Website</Label>
                <Input
                  id="editWebsite"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editRevenue" className="text-xs font-semibold">Doanh thu Hàng năm (Số tiền)</Label>
                <Input
                  id="editRevenue"
                  type="number"
                  value={revenueAmount}
                  onChange={(e) => setRevenueAmount(e.target.value)}
                  placeholder="350000000000"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editEmpCount" className="text-xs font-semibold">Quy mô Nhân sự (Số lượng)</Label>
                <Input
                  id="editEmpCount"
                  type="number"
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(e.target.value)}
                  placeholder="1250"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="editDesc" className="text-xs font-semibold">Mô tả / Ghi chú Chăm sóc</Label>
                <textarea
                  id="editDesc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập thông tin mô tả chi tiết về đối tác..."
                  className="w-full rounded-md border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <Checkbox
                    id="editDnc"
                    checked={doNotContact}
                    onCheckedChange={(c) => setDoNotContact(Boolean(c))}
                  />
                  <Label htmlFor="editDnc" className="text-xs font-semibold cursor-pointer text-slate-800">
                    Từ chối liên hệ (Do Not Contact - Chặn tiếp thị qua cuộc gọi & email)
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 border-t border-slate-200 bg-slate-50/80 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 min-w-28"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
