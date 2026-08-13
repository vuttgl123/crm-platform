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
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { BusinessNumberInput, formatVietnameseReading } from '@/components/ui/BusinessNumberInput';
import { toast } from 'sonner';
import {
  Building2,
  Globe,
  DollarSign,
  Users,
  Calendar,
  FileText,
  Edit3,
  Loader2,
  ShieldAlert,
  Briefcase,
  ExternalLink,
  CheckCircle2,
  Save,
  ArrowLeft,
  Building,
} from 'lucide-react';

import { useAuth } from '@/core/session/useAuth';

interface AccountDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: AccountResponse | null;
  loading: boolean;
  allAccounts?: AccountSummaryResponse[];
  initialEditMode?: boolean;
  onSuccess?: () => void;
}

export const AccountDetailModal: React.FC<AccountDetailModalProps> = ({
  open,
  onOpenChange,
  account,
  loading,
  allAccounts = [],
  initialEditMode = false,
  onSuccess,
}) => {
  const { session } = useAuth();
  const [isEditing, setIsEditing] = useState(initialEditMode);

  // Edit Form State
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
  const [employeeCount, setEmployeeCount] = useState('');
  const [description, setDescription] = useState('');
  const [doNotContact, setDoNotContact] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Synchronize state when account changes or edit mode toggles
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
      setEmployeeCount(account.employeeCount ? account.employeeCount.toString() : '');
      setDescription(account.description || '');
      setDoNotContact(Boolean(account.doNotContact));
    }
  }, [account, open]);

  useEffect(() => {
    setIsEditing(initialEditMode);
  }, [initialEditMode, open]);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    if (!displayName.trim()) {
      toast.error('Vui lòng nhập Tên hiển thị khách hàng');
      return;
    }

    setIsSaving(true);
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
        ? { amount: parseFloat(revenueAmount), currencyCode: account.annualRevenue?.currencyCode || 'VND' }
        : undefined,
      employeeCount: employeeCount ? parseInt(employeeCount, 10) : undefined,
      description: description.trim() || undefined,
      doNotContact,
      owner: account.owner ? { type: account.owner.type, id: account.owner.id } : undefined,
    };

    try {
      await accountApi.update(account.id, payload);
      toast.success(`Đã cập nhật thành công khách hàng "${displayName}"!`);
      setIsEditing(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Cập nhật thất bại';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const getAccountTypeBadge = (type?: AccountType) => {
    if (!type) return null;
    switch (type) {
      case 'ORGANIZATION':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold">Doanh nghiệp</Badge>;
      case 'PERSON':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-bold">Cá nhân</Badge>;
      case 'PARTNER':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">Đối tác chiến lược</Badge>;
      case 'RESELLER':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold">Đại lý ủy quyền</Badge>;
      case 'SUPPLIER':
        return <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 font-bold">Nhà cung cấp</Badge>;
    }
  };

  const getLifecycleStageBadge = (stage?: AccountLifecycleStage) => {
    if (!stage) return null;
    switch (stage) {
      case 'PROSPECT':
        return <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 font-semibold">Tiềm năng (Prospect)</Badge>;
      case 'QUALIFIED':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-semibold">Đạt chuẩn (Qualified)</Badge>;
      case 'CUSTOMER':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">Khách hàng chính thức</Badge>;
      case 'CHURNED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-semibold">Rời bỏ (Churned)</Badge>;
      case 'INACTIVE':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-semibold">Ngừng hoạt động</Badge>;
    }
  };

  const formatCurrency = (amount?: number | null, currencyCode?: string | null) => {
    if (amount === undefined || amount === null) return null;
    const curr = currencyCode || 'VNĐ';
    return formatVietnameseReading(amount, curr);
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'Chưa có thông tin';
    try {
      const date = new Date(isoString);
      return `${date.toLocaleTimeString('vi-VN')} ${date.toLocaleDateString('vi-VN')}`;
    } catch {
      return isoString;
    }
  };

  const parentAccountObj = allAccounts.find((a) => a.id === account?.parentAccountId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden font-sans border-slate-200 shadow-lg">
        {/* Header Bar */}
        <DialogHeader className="p-5 pb-4 border-b border-slate-200 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-xs shrink-0">
              {account?.displayName ? account.displayName.slice(0, 2).toUpperCase() : 'KH'}
            </div>

            <div>
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{account?.displayName || 'Chi tiết Khách hàng'}</span>
                {isEditing && (
                  <Badge className="bg-amber-500 text-white font-bold text-[10px] px-2 py-0.5">
                    Đang Chỉnh Sửa
                  </Badge>
                )}
              </DialogTitle>

              {account?.legalName && (
                <p className="text-xs text-slate-500 font-medium mt-0.5">{account.legalName}</p>
              )}

              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {account?.accountNumber && (
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                    Mã KH: {account.accountNumber}
                  </span>
                )}
                {getAccountTypeBadge(account?.accountType)}
                {getLifecycleStageBadge(account?.lifecycleStage)}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Body: Toggle between VIEW MODE and IN-PLACE EDIT MODE */}
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex-1 flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
            <span className="text-xs">Đang tải thông tin chi tiết khách hàng...</span>
          </div>
        ) : account ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {/* VIEW MODE */}
            {!isEditing ? (
              <>
                {/* 4 Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-[11px] font-medium">Doanh thu năm</span>
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="font-bold text-slate-900 truncate" title={account.annualRevenue?.amount ? `${new Intl.NumberFormat('vi-VN').format(account.annualRevenue.amount)} VNĐ` : undefined}>
                      {formatCurrency(account.annualRevenue?.amount, account.annualRevenue?.currencyCode) || (
                        <span className="text-slate-400 font-normal italic">Chưa cập nhật</span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-[11px] font-medium">Quy mô nhân sự</span>
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div className="font-bold text-slate-900 truncate" title={account.employeeCount ? `${new Intl.NumberFormat('vi-VN').format(account.employeeCount)} người` : undefined}>
                      {account.employeeCount ? (
                        formatVietnameseReading(account.employeeCount, 'người')
                      ) : (
                        <span className="text-slate-400 font-normal italic">Chưa cập nhật</span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-[11px] font-medium">Lĩnh vực hoạt động</span>
                      <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                    <div className="font-bold text-slate-900 truncate">
                      {account.industryCode || <span className="text-slate-400 font-normal italic">Chưa phân loại</span>}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-[11px] font-medium">Website chính thức</span>
                      <Globe className="w-3.5 h-3.5 text-sky-600" />
                    </div>
                    <div className="font-bold text-slate-900 truncate">
                      {account.website ? (
                        <a
                          href={account.website.startsWith('http') ? account.website : `https://${account.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          <span>{account.website.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400 font-normal italic">Chưa cập nhật</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Hồ sơ Doanh nghiệp & Pháp lý</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium block">Tên hiển thị (Thương hiệu):</span>
                      <span className="font-bold text-slate-900">{account.displayName}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium block">Tên đăng ký Pháp lý:</span>
                      <span className="font-semibold text-slate-900">
                        {account.legalName || <span className="text-slate-400 font-normal italic">Không có</span>}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium block">Khách hàng Cha / Đơn vị cấp trên:</span>
                      {account.parentAccountId ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mt-0.5 font-bold">
                          🏢 {parentAccountObj?.displayName || 'Đã liên kết Khách hàng Cha'}
                        </Badge>
                      ) : (
                        <span className="text-slate-600 font-medium italic">Khách hàng độc lập / Cấp cao nhất</span>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium block">Người / Nhóm Phụ trách (Owner):</span>
                      {account.owner ? (
                        <Badge variant="outline" className={`mt-0.5 font-bold ${
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
                        <span className="text-slate-400 font-normal italic">Chưa gán (Tự do)</span>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium block">Mã số thuế (MST):</span>
                      <span className="font-mono font-bold text-slate-900">
                        {account.taxIdentifier || <span className="text-slate-400 font-normal italic">Chưa cập nhật</span>}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium block">Số Giấy phép ĐKKD:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {account.registrationNumber || <span className="text-slate-400 font-normal italic">Chưa cập nhật</span>}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium block">Trạng thái Tiếp thị & Liên hệ:</span>
                      {account.doNotContact ? (
                        <span className="text-red-600 font-bold flex items-center gap-1 mt-0.5">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Từ chối nhận cuộc gọi / email (DNC)
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Sẵn sàng nhận thông tin tiếp thị
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium block">Cập nhật lần cuối:</span>
                      <span className="font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(account.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                {account.description && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5 text-xs">
                    <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Ghi chú Chăm sóc & Mô tả Doanh nghiệp</span>
                    </h4>
                    <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200/80 whitespace-pre-wrap">
                      {account.description}
                    </p>
                  </div>
                )}
              </>
            ) : (
              /* IN-PLACE EDIT MODE */
              <form id="inPlaceEditForm" onSubmit={handleSaveEdit} className="space-y-4">
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-800">
                  <span className="font-medium">Chế độ Chỉnh sửa trực tiếp thông tin Khách hàng</span>
                  <span className="font-mono font-bold text-amber-900">{account.accountNumber}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="inPlaceDisplayName" className="text-xs font-semibold">Tên Khách hàng (Hiển thị) *</Label>
                    <Input
                      id="inPlaceDisplayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ví dụ: MB Bank"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="inPlaceLegalName" className="text-xs font-semibold">Tên Pháp lý Đầy đủ</Label>
                    <Input
                      id="inPlaceLegalName"
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                      placeholder="Ngân hàng Thương mại Cổ phần..."
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs font-semibold flex items-center gap-1 text-slate-900">
                      <Building className="w-3.5 h-3.5 text-blue-600" />
                      <span>Khách hàng Cha / Đơn vị cấp trên trực thuộc</span>
                    </Label>
                    <Select
                      value={parentAccountId || 'NONE'}
                      onValueChange={(v) => setParentAccountId(v === 'NONE' ? undefined : v)}
                    >
                      <SelectTrigger className="text-xs bg-white border-slate-200">
                        <SelectValue placeholder="Chọn Khách hàng Cha / Đơn vị cấp trên" />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="NONE" className="font-semibold text-slate-700">
                          Không có (Khách hàng độc lập / Cấp cao nhất)
                        </SelectItem>
                        {allAccounts
                          .filter((accItem) => accItem.id !== account.id)
                          .map((accItem) => (
                            <SelectItem key={accItem.id} value={accItem.id}>
                              🏢 {accItem.accountNumber} - {accItem.displayName}
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
                    {account.owner ? (
                      <Badge variant="outline" className={`font-bold text-[11px] px-2.5 py-1 shrink-0 ${
                        account.owner.type === 'TEAM'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {account.owner.type === 'TEAM' ? '🏢 Nhóm phụ trách (TEAM)' : '👤 Cá nhân phụ trách (USER)'}
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
                    <Label htmlFor="inPlaceTaxId" className="text-xs font-semibold">Mã số thuế (MST)</Label>
                    <Input
                      id="inPlaceTaxId"
                      value={taxIdentifier}
                      onChange={(e) => setTaxIdentifier(e.target.value)}
                      placeholder="Mã số thuế"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="inPlaceRegNo" className="text-xs font-semibold">Số Giấy phép ĐKKD</Label>
                    <Input
                      id="inPlaceRegNo"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="Số ĐKKD"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="inPlaceIndustry" className="text-xs font-semibold">Ngành nghề / Lĩnh vực</Label>
                    <Input
                      id="inPlaceIndustry"
                      value={industryCode}
                      onChange={(e) => setIndustryCode(e.target.value)}
                      placeholder="Ngành nghề"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="inPlaceWebsite" className="text-xs font-semibold">Website</Label>
                    <Input
                      id="inPlaceWebsite"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>

                  <BusinessNumberInput
                    id="inPlaceRevenue"
                    label="Doanh thu Hàng năm (Số tiền)"
                    value={revenueAmount}
                    onChange={setRevenueAmount}
                    placeholder="Ví dụ: 350000000000"
                    unitSuffix="VNĐ"
                    icon={<DollarSign className="w-3.5 h-3.5 text-emerald-600" />}
                  />

                  <BusinessNumberInput
                    id="inPlaceEmpCount"
                    label="Quy mô Nhân sự (Số người)"
                    value={employeeCount}
                    onChange={setEmployeeCount}
                    placeholder="Ví dụ: 2500"
                    unitSuffix="người"
                    icon={<Users className="w-3.5 h-3.5 text-blue-600" />}
                  />

                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="inPlaceDesc" className="text-xs font-semibold">Mô tả / Ghi chú Chăm sóc</Label>
                    <textarea
                      id="inPlaceDesc"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Nhập thông tin ghi chú..."
                      className="w-full rounded-md border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="md:col-span-2 pt-1">
                    <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <Checkbox
                        id="inPlaceDnc"
                        checked={doNotContact}
                        onCheckedChange={(c) => setDoNotContact(Boolean(c))}
                      />
                      <Label htmlFor="inPlaceDnc" className="text-xs font-semibold cursor-pointer text-slate-800">
                        Từ chối nhận cuộc gọi / email (Do Not Contact - DNC)
                      </Label>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        ) : null}

        {/* Footer Bar */}
        <DialogFooter className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            {account && (
              <span>
                Mã đối tác: <strong className="font-mono text-slate-800">{account.accountNumber}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                {account && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-semibold gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Chỉnh sửa thông tin</span>
                  </Button>
                )}
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white min-w-20"
                >
                  Đóng
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="text-xs gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Hủy</span>
                </Button>

                <Button
                  type="submit"
                  form="inPlaceEditForm"
                  disabled={isSaving}
                  className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 min-w-28"
                >
                  {isSaving ? (
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
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
