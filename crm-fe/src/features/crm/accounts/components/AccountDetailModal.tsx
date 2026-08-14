import React, { useState, useEffect } from 'react';
import {
  accountApi,
  AccountResponse,
  AccountSummaryResponse,
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatVietnameseReading } from '@/components/ui/BusinessNumberInput';
import { toast } from 'sonner';
import {
  renderLifecycleStageBadge as getLifecycleStageBadge,
  renderAccountTypeBadge as getAccountTypeBadge,
} from '@/config/crmStatusConfig';
import { DynamicForm } from '@/components/common/DynamicForm';
import { createAccountFormSchema, AccountFormValues } from '../schemas/accountFormSchema';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { extractErrorMessage } from '@/services/api/apiClient';
import {
  accountChannelApi,
  AccountCommunicationChannelResponse,
  ChannelType,
  normalizeChannelValue,
} from '@/services/api/accountChannelApi';
import {
  accountRelationshipApi,
  AccountRelationshipResponse,
  RelationshipType,
} from '@/services/api/accountRelationshipApi';
import {
  accountAddressApi,
  AccountAddressResponse,
  ACCOUNT_ADDRESS_TYPE_CONFIG,
} from '@/services/api/accountAddressApi';
import { AccountAddressDialog } from './AccountAddressDialog';
import {
  Edit3,
  Loader2,
  ExternalLink,
  Save,
  ArrowLeft,
  Trash2,
  Link2,
  Building,
  Users,
  DollarSign,
  MapPin,
  Star,
  Plus,
  CalendarOff,
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

  // Edit Form State (Dynamic Form Values)
  const [inPlaceValues, setInPlaceValues] = useState<AccountFormValues>({
    displayName: '',
    legalName: '',
    parentAccountId: undefined,
    accountType: 'ORGANIZATION',
    lifecycleStage: 'PROSPECT',
    taxIdentifier: '',
    registrationNumber: '',
    industryCode: '',
    website: '',
    revenueAmount: '',
    currencyCode: 'VND',
    employeeCount: '',
    description: '',
    doNotContact: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Tabs & API Data States
  const [activeTab, setActiveTab] = useState<'general' | 'addresses' | 'channels' | 'relationships'>('general');
  const [addresses, setAddresses] = useState<AccountAddressResponse[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [includeHistoryAddresses, setIncludeHistoryAddresses] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AccountAddressResponse | null>(null);

  const [channels, setChannels] = useState<AccountCommunicationChannelResponse[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [relationships, setRelationships] = useState<AccountRelationshipResponse[]>([]);
  const [loadingRelationships, setLoadingRelationships] = useState(false);

  // Form States for Channel & Relationship Creation
  const [newChannelType, setNewChannelType] = useState<ChannelType>('EMAIL');
  const [newChannelValue, setNewChannelValue] = useState('');
  const [newChannelLabel, setNewChannelLabel] = useState('');
  const [isAddingChannel, setIsAddingChannel] = useState(false);

  const [newRelType, setNewRelType] = useState<RelationshipType>('PARTNER');
  const [newRelTargetId, setNewRelTargetId] = useState('');
  const [newRelDesc, setNewRelDesc] = useState('');
  const [isAddingRel, setIsAddingRel] = useState(false);

  // Fetch data when modal opens or tab changes
  useEffect(() => {
    if (account && open) {
      if (activeTab === 'addresses') {
        fetchAddresses();
      } else if (activeTab === 'channels') {
        fetchChannels();
      } else if (activeTab === 'relationships') {
        fetchRelationships();
      }
    }
  }, [account?.id, open, activeTab, includeHistoryAddresses]);

  const fetchAddresses = async () => {
    if (!account) return;
    setLoadingAddresses(true);
    try {
      const data = await accountAddressApi.list(account.id, {
        includeHistory: includeHistoryAddresses,
      });
      setAddresses(data || []);
    } catch {
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleOpenCreateAddress = () => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: AccountAddressResponse) => {
    setEditingAddress(addr);
    setIsAddressModalOpen(true);
  };

  const handleEndAddress = async (addr: AccountAddressResponse) => {
    if (!account) return;
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn kết thúc hiệu lực địa chỉ "${
          addr.formattedAddress || addr.addressLine1 || addr.addressType
        }"?`
      )
    ) {
      return;
    }

    try {
      await accountAddressApi.end(account.id, addr.id, addr.version);
      toast.success('Đã kết thúc hiệu lực địa chỉ thành công');
      fetchAddresses();
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Không thể kết thúc hiệu lực địa chỉ'));
    }
  };

  const handleSetPrimaryAddress = async (addr: AccountAddressResponse) => {
    if (!account) return;
    try {
      await accountAddressApi.update(account.id, addr.id, addr.version, {
        addressType: addr.addressType,
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2,
        locality: addr.locality,
        administrativeArea: addr.administrativeArea,
        postalCode: addr.postalCode,
        countryCode: addr.countryCode,
        latitude: addr.latitude,
        longitude: addr.longitude,
        formattedAddress: addr.formattedAddress,
        isPrimary: true,
        validFrom: addr.validFrom,
      });
      toast.success(
        `Đã đặt địa chỉ làm Địa chỉ chính cho loại ${
          ACCOUNT_ADDRESS_TYPE_CONFIG[addr.addressType]?.label || addr.addressType
        }`
      );
      fetchAddresses();
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Không thể đặt làm địa chỉ chính'));
    }
  };

  const fetchChannels = async () => {
    if (!account) return;
    setLoadingChannels(true);
    try {
      const data = await accountChannelApi.list(account.id);
      setChannels(data || []);
    } catch {
      setChannels([]);
    } finally {
      setLoadingChannels(false);
    }
  };

  const fetchRelationships = async () => {
    if (!account) return;
    setLoadingRelationships(true);
    try {
      const data = await accountRelationshipApi.search(account.id);
      setRelationships(data?.items || []);
    } catch {
      setRelationships([]);
    } finally {
      setLoadingRelationships(false);
    }
  };

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !newChannelValue.trim()) return;

    const normalizedVal = normalizeChannelValue(newChannelType, newChannelValue);

    if (newChannelType === 'EMAIL' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedVal)) {
      toast.error('Địa chỉ Email không đúng định dạng. Ví dụ: name@company.com');
      return;
    }

    setIsAddingChannel(true);
    try {
      await accountChannelApi.create(account.id, {
        channelType: newChannelType,
        rawValue: normalizedVal,
        label: newChannelLabel.trim() || undefined,
      });
      toast.success(`Đã thêm kênh ${newChannelType} (${normalizedVal}) thành công`);
      setNewChannelValue('');
      setNewChannelLabel('');
      fetchChannels();
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Không thể thêm kênh liên lạc'));
    } finally {
      setIsAddingChannel(false);
    }
  };

  const handleDeleteChannel = async (channelId: string, version: number) => {
    if (!account) return;
    try {
      await accountChannelApi.delete(account.id, channelId, version);
      toast.success('Đã xóa kênh liên lạc');
      fetchChannels();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể xóa kênh liên lạc');
    }
  };

  const handleAddRelationship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !newRelTargetId) return;
    setIsAddingRel(true);
    try {
      await accountRelationshipApi.create(account.id, {
        relatedAccountId: newRelTargetId,
        relationshipType: newRelType,
        description: newRelDesc.trim() || undefined,
      });
      toast.success('Đã thiết lập mối quan hệ doanh nghiệp mới');
      setNewRelTargetId('');
      setNewRelDesc('');
      fetchRelationships();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể thiết lập mối quan hệ');
    } finally {
      setIsAddingRel(false);
    }
  };

  // Synchronize state when account changes or edit mode toggles
  useEffect(() => {
    if (account) {
      setInPlaceValues({
        displayName: account.displayName || '',
        legalName: account.legalName || '',
        parentAccountId: account.parentAccountId || undefined,
        accountType: account.accountType || 'ORGANIZATION',
        lifecycleStage: account.lifecycleStage || 'PROSPECT',
        taxIdentifier: account.taxIdentifier || '',
        registrationNumber: account.registrationNumber || '',
        industryCode: account.industryCode || '',
        website: account.website || '',
        revenueAmount: account.annualRevenue?.amount ? account.annualRevenue.amount.toString() : '',
        currencyCode: account.annualRevenue?.currencyCode || 'VND',
        employeeCount: account.employeeCount ? account.employeeCount.toString() : '',
        description: account.description || '',
        doNotContact: Boolean(account.doNotContact),
      });
    }
  }, [account, open]);

  useEffect(() => {
    setIsEditing(initialEditMode);
  }, [initialEditMode, open]);

  const handleInPlaceFieldChange = (field: keyof AccountFormValues, value: any) => {
    setInPlaceValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    if (!inPlaceValues.displayName.trim()) {
      toast.error('Vui lòng nhập Tên hiển thị khách hàng');
      return;
    }

    setIsSaving(true);
    const payload: UpdateAccountRequest = {
      version: account.version,
      displayName: inPlaceValues.displayName.trim(),
      legalName: inPlaceValues.legalName.trim() || undefined,
      parentAccountId:
        inPlaceValues.parentAccountId && inPlaceValues.parentAccountId !== 'NONE'
          ? inPlaceValues.parentAccountId
          : undefined,
      accountType: inPlaceValues.accountType,
      lifecycleStage: inPlaceValues.lifecycleStage,
      taxIdentifier: inPlaceValues.taxIdentifier.trim() || undefined,
      registrationNumber: inPlaceValues.registrationNumber.trim() || undefined,
      industryCode: inPlaceValues.industryCode.trim() || undefined,
      website: inPlaceValues.website.trim() || undefined,
      annualRevenue: inPlaceValues.revenueAmount
        ? { amount: parseFloat(inPlaceValues.revenueAmount), currencyCode: inPlaceValues.currencyCode || 'VND' }
        : undefined,
      employeeCount: inPlaceValues.employeeCount ? parseInt(inPlaceValues.employeeCount, 10) : undefined,
      description: inPlaceValues.description.trim() || undefined,
      doNotContact: inPlaceValues.doNotContact,
      owner: account.owner ? { type: account.owner.type, id: account.owner.id } : undefined,
    };

    try {
      await accountApi.update(account.id, payload);
      toast.success(`Đã cập nhật thành công khách hàng "${inPlaceValues.displayName}"!`);
      setIsEditing(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Cập nhật thất bại';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const accountSchema = createAccountFormSchema(allAccounts, account?.id);

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
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full space-y-4">
                <TabsList className="grid grid-cols-4 bg-slate-100 p-1 text-xs rounded-lg">
                  <TabsTrigger value="general" className="font-semibold text-xs py-1.5 flex items-center justify-center">
                    <span>Tổng quan</span>
                  </TabsTrigger>
                  <TabsTrigger value="addresses" className="font-semibold text-xs py-1.5 flex items-center justify-center">
                    <span>Địa chỉ ({addresses.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="channels" className="font-semibold text-xs py-1.5 flex items-center justify-center">
                    <span>Kênh liên lạc ({channels.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="relationships" className="font-semibold text-xs py-1.5 flex items-center justify-center">
                    <span>Mối quan hệ ({relationships.length})</span>
                  </TabsTrigger>
                </TabsList>

                {/* TAB 1: GENERAL OVERVIEW */}
                <TabsContent value="general" className="space-y-4 pt-1">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Annual Revenue Card */}
                    <div className="p-3 rounded-xl bg-gradient-to-br from-white via-white to-blue-50/40 border border-blue-200 shadow-2xs hover:border-blue-300 flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Doanh thu năm</span>
                        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                          <DollarSign className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div className="font-extrabold text-sm sm:text-base text-slate-900 truncate" title={account.annualRevenue?.amount ? `${new Intl.NumberFormat('vi-VN').format(account.annualRevenue.amount)} VNĐ` : undefined}>
                        {formatCurrency(account.annualRevenue?.amount, account.annualRevenue?.currencyCode) || (
                          <span className="text-slate-400 font-normal italic text-xs">Chưa cập nhật</span>
                        )}
                      </div>
                    </div>

                    {/* Employee Count Card */}
                    <div className="p-3 rounded-xl bg-gradient-to-br from-white via-white to-emerald-50/40 border border-emerald-200 shadow-2xs hover:border-emerald-300 flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Quy mô nhân sự</span>
                        <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                          <Users className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div className="font-extrabold text-sm text-slate-900 truncate">
                        {account.employeeCount ? `${new Intl.NumberFormat('vi-VN').format(account.employeeCount)} người` : (
                          <span className="text-slate-400 font-normal italic text-xs">Chưa cập nhật</span>
                        )}
                      </div>
                    </div>

                    {/* Website Card */}
                    <div className="p-3 rounded-xl bg-gradient-to-br from-white via-white to-purple-50/40 border border-purple-200 shadow-2xs hover:border-purple-300 flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Trang web</span>
                        <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div className="text-slate-900 truncate">
                        {account.website ? (
                          <a
                            href={account.website.startsWith('http') ? account.website : `https://${account.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1 truncate"
                          >
                            <span>{account.website.replace(/^https?:\/\//, '')}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 font-normal italic text-xs">Chưa cập nhật</span>
                        )}
                      </div>
                    </div>

                    {/* Parent Account Card */}
                    <div className="p-3 rounded-xl bg-gradient-to-br from-white via-white to-amber-50/40 border border-amber-200 shadow-2xs hover:border-amber-300 flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Cấp trên</span>
                        <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
                          <Building className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div className="text-slate-900 truncate">
                        {parentAccountObj ? (
                          <span className="font-bold text-amber-900 text-xs truncate block" title={parentAccountObj.displayName}>
                            {parentAccountObj.displayName}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal italic text-xs">Không có</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Core Attributes Panel */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
                      <span>Hồ sơ Khách hàng & Pháp lý</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                      <div>
                        <span className="text-slate-400 font-medium block">Tên hiển thị (Thương hiệu):</span>
                        <span className="font-bold text-slate-900">{account.displayName}</span>
                      </div>

                      <div>
                        <span className="text-slate-400 font-medium block">Tên Pháp lý (ĐKKD):</span>
                        <span className="font-semibold text-slate-800">
                          {account.legalName || <span className="text-slate-400 font-normal italic">Chưa cập nhật</span>}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 font-medium block">Khách hàng Cha / Cấp trên:</span>
                        {parentAccountObj ? (
                          <span className="font-semibold text-blue-700 block mt-0.5">
                            {parentAccountObj.accountNumber} - {parentAccountObj.displayName}
                          </span>
                        ) : (
                          <span className="text-slate-600 font-medium italic">Khách hàng độc lập / Cấp cao nhất</span>
                        )}
                      </div>

                      <div>
                        <span className="text-slate-400 font-medium block">Người / Nhóm phụ trách:</span>
                        {account.owner ? (
                          <Badge variant="outline" className={`mt-0.5 font-bold ${
                            account.owner.type === 'TEAM'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {account.owner.type === 'TEAM'
                              ? 'Nhóm phụ trách'
                              : (session?.user && account.owner.id === session.user.id
                                  ? `${session.user.email} (Chính tôi)`
                                  : 'Cá nhân phụ trách')}
                          </Badge>
                        ) : (
                          <span className="text-slate-400 font-normal italic">Chưa phân công</span>
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
                          <span className="text-red-600 font-bold block mt-0.5">
                            Từ chối nhận cuộc gọi / email (DNC)
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-bold block mt-0.5">
                            Sẵn sàng nhận thông tin tiếp thị
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="text-slate-400 font-medium block">Cập nhật lần cuối:</span>
                        <span className="font-semibold text-slate-700 block mt-0.5">
                          {formatDate(account.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  {account.description && (
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5 text-xs">
                      <h4 className="font-bold text-slate-700">
                        <span>Ghi chú & Mô tả</span>
                      </h4>
                      <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200/80 whitespace-pre-wrap">
                        {account.description}
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* TAB 2: ADDRESSES */}
                <TabsContent value="addresses" className="space-y-4 pt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50/70 border border-slate-200">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-slate-800 text-xs">Danh sách Địa chỉ & Chi nhánh</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Checkbox
                          id="modalIncludeHistAddr"
                          checked={includeHistoryAddresses}
                          onCheckedChange={(c) => setIncludeHistoryAddresses(Boolean(c))}
                        />
                        <Label
                          htmlFor="modalIncludeHistAddr"
                          className="text-[11px] text-slate-600 cursor-pointer select-none"
                        >
                          Hiện lịch sử
                        </Label>
                      </div>

                      <Button
                        size="sm"
                        onClick={handleOpenCreateAddress}
                        className="h-7 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold px-3 gap-1 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm Địa chỉ</span>
                      </Button>
                    </div>
                  </div>

                  {loadingAddresses ? (
                    <div className="py-8 text-center text-slate-500 flex justify-center items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Đang tải danh sách địa chỉ...</span>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 italic">Chưa có địa chỉ nào được lưu.</div>
                  ) : (
                    <div className="space-y-2.5">
                      {addresses.map((addr) => {
                        const typeConfig = ACCOUNT_ADDRESS_TYPE_CONFIG[addr.addressType] || {
                          label: addr.addressType,
                          badge: addr.addressType,
                          color: 'bg-slate-50 text-slate-700 border-slate-200',
                        };
                        const isEnded = Boolean(addr.validTo);

                        return (
                          <div
                            key={addr.id}
                            className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                              isEnded ? 'bg-slate-50/50 border-slate-200 opacity-75' : 'bg-white border-slate-200 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <Badge className={`text-[10px] font-bold ${typeConfig.color}`}>
                                    {typeConfig.label}
                                  </Badge>

                                  {addr.isPrimary && (
                                    <Badge className="text-[10px] font-bold bg-amber-50 text-amber-700 border-amber-200 gap-1">
                                      <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-600" />
                                      <span>Chính</span>
                                    </Badge>
                                  )}

                                  {isEnded && (
                                    <Badge variant="outline" className="text-[9px] text-rose-600 border-rose-200">
                                      Đã kết thúc
                                    </Badge>
                                  )}
                                </div>

                                <p className="font-bold text-slate-900 text-xs">
                                  {addr.formattedAddress || addr.addressLine1 || 'Chưa đặt tên đường'}
                                </p>
                                {(addr.locality || addr.administrativeArea) && (
                                  <p className="text-[11px] text-slate-500">
                                    {[addr.locality, addr.administrativeArea, addr.countryCode === 'VN' ? 'Việt Nam' : addr.countryCode]
                                      .filter(Boolean)
                                      .join(', ')}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {!isEnded && !addr.isPrimary && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSetPrimaryAddress(addr)}
                                    className="h-6 text-[10px] text-slate-500 hover:text-amber-600 px-1.5"
                                    title="Đặt làm địa chỉ chính"
                                  >
                                    <Star className="w-3 h-3" />
                                  </Button>
                                )}
                                {!isEnded && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleOpenEditAddress(addr)}
                                      className="h-6 text-[10px] text-slate-500 hover:text-blue-600 px-1.5"
                                      title="Chỉnh sửa địa chỉ"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEndAddress(addr)}
                                      className="h-6 text-[10px] text-slate-400 hover:text-rose-600 px-1.5"
                                      title="Kết thúc hiệu lực"
                                    >
                                      <CalendarOff className="w-3 h-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                {/* TAB 3: COMMUNICATION CHANNELS */}
                <TabsContent value="channels" className="space-y-4 pt-1">
                  {/* Add New Channel Form */}
                  <form onSubmit={handleAddChannel} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                    <h4 className="font-bold text-slate-900 text-xs">
                      <span>Thêm Kênh Liên lạc Mới</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <Select value={newChannelType} onValueChange={(v: ChannelType) => setNewChannelType(v)}>
                        <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          <SelectItem value="EMAIL">Email</SelectItem>
                          <SelectItem value="PHONE">Điện thoại bàn</SelectItem>
                          <SelectItem value="MOBILE">Di động</SelectItem>
                          <SelectItem value="SMS">SMS</SelectItem>
                          <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                          <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                          <SelectItem value="OTHER">Khác / Địa chỉ</SelectItem>
                        </SelectContent>
                      </Select>

                      <div>
                        <Input
                          placeholder={
                            newChannelType === 'EMAIL'
                              ? 'VD: contact@company.com'
                              : ['PHONE', 'MOBILE', 'SMS', 'WHATSAPP'].includes(newChannelType)
                              ? 'VD: 0912345678 hoặc +84912345678'
                              : newChannelType === 'LINKEDIN'
                              ? 'VD: https://linkedin.com/in/profile'
                              : 'Giá trị liên lạc...'
                          }
                          value={newChannelValue}
                          onChange={(e) => setNewChannelValue(e.target.value)}
                          className="h-8 text-xs bg-white"
                          required
                        />
                        {['PHONE', 'MOBILE', 'SMS', 'WHATSAPP'].includes(newChannelType) && newChannelValue.trim() !== '' && (
                          <p className="text-[11px] text-blue-600 mt-1 font-medium flex items-center gap-1">
                            <span>Chuẩn hóa E.164:</span>
                            <span className="font-mono font-bold bg-blue-50 px-1 py-0.5 rounded border border-blue-100">
                              {normalizeChannelValue(newChannelType, newChannelValue)}
                            </span>
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Input
                          placeholder="Nhãn (VD: Email đăng ký)..."
                          value={newChannelLabel}
                          onChange={(e) => setNewChannelLabel(e.target.value)}
                          className="h-8 text-xs bg-white flex-1"
                        />
                        <Button type="submit" size="sm" disabled={isAddingChannel || !newChannelValue.trim()} className="h-8 bg-blue-600 hover:bg-blue-700 text-xs font-semibold px-3 shrink-0">
                          {isAddingChannel ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Thêm'}
                        </Button>
                      </div>
                    </div>
                  </form>

                  {/* Channel List */}
                  {loadingChannels ? (
                    <div className="py-8 text-center text-slate-500">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-1" />
                      <span>Đang tải danh sách kênh liên lạc...</span>
                    </div>
                  ) : channels.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-slate-500">
                      <p className="font-semibold text-slate-700">Chưa có kênh liên lạc nào</p>
                      <p className="text-[11px] mt-0.5">Sử dụng biểu mẫu phía trên để thêm Email, SĐT hoặc Kênh liên hệ.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {channels.map((ch) => (
                        <div key={ch.id} className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{ch.rawValue}</span>
                                {ch.isPrimary && (
                                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] px-1.5 py-0">
                                    Chính
                                  </Badge>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500">
                                {ch.label || ch.channelType} • Tạo lúc: {new Date(ch.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteChannel(ch.id, ch.version)}
                            className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title="Xóa kênh liên lạc"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* TAB 3: CORPORATE RELATIONSHIPS */}
                <TabsContent value="relationships" className="space-y-4 pt-1">
                  {/* Add New Relationship Form */}
                  <form onSubmit={handleAddRelationship} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                    <h4 className="font-bold text-slate-900 text-xs">
                      <span>Thiết lập Mối quan hệ Doanh nghiệp Mới</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <Select value={newRelType} onValueChange={(v: RelationshipType) => setNewRelType(v)}>
                        <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          <SelectItem value="PARTNER">Đối tác kinh doanh</SelectItem>
                          <SelectItem value="PARENT_CHILD">Công ty Mẹ / Con</SelectItem>
                          <SelectItem value="AFFILIATE">Đơn vị liên kết</SelectItem>
                          <SelectItem value="SUPPLIER">Nhà cung cấp</SelectItem>
                          <SelectItem value="CUSTOMER">Khách hàng mua sắm</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={newRelTargetId} onValueChange={setNewRelTargetId}>
                        <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                          <SelectValue placeholder="Chọn Khách hàng liên kết..." />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          {allAccounts
                            .filter((a) => a.id !== account.id)
                            .map((a) => (
                              <SelectItem key={a.id} value={a.id}>
                                {a.accountNumber} - {a.displayName}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>

                      <div className="flex gap-2">
                        <Input
                          placeholder="Mô tả quan hệ..."
                          value={newRelDesc}
                          onChange={(e) => setNewRelDesc(e.target.value)}
                          className="h-8 text-xs bg-white flex-1"
                        />
                        <Button type="submit" size="sm" disabled={isAddingRel || !newRelTargetId} className="h-8 bg-blue-600 hover:bg-blue-700 text-xs font-semibold px-3 shrink-0">
                          {isAddingRel ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Lưu'}
                        </Button>
                      </div>
                    </div>
                  </form>

                  {/* Relationship List */}
                  {loadingRelationships ? (
                    <div className="py-8 text-center text-slate-500">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-purple-600 mb-1" />
                      <span>Đang tải danh sách mối quan hệ doanh nghiệp...</span>
                    </div>
                  ) : relationships.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-slate-500">
                      <Link2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-700">Chưa ghi nhận mối quan hệ liên kết nào</p>
                      <p className="text-[11px] mt-0.5">Thêm mối quan hệ Mẹ-Con, Đối tác hoặc Liên kết doanh nghiệp phía trên.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {relationships.map((rel) => (
                        <div key={rel.id} className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
                              <Link2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">
                                  {rel.relatedAccount.displayName}
                                </span>
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
                                  {rel.relationshipType}
                                </Badge>
                              </div>
                              <span className="text-[11px] text-slate-500">
                                Mã KH: {rel.relatedAccount.accountNumber} {rel.description ? `• ${rel.description}` : ''}
                              </span>
                            </div>
                          </div>

                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(rel.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              /* IN-PLACE EDIT MODE (DYNAMIC FORM ENGINE) */
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-800">
                  <span className="font-medium">Chế độ Chỉnh sửa trực tiếp thông tin Khách hàng</span>
                  <span className="font-mono font-bold text-amber-900">{account.accountNumber}</span>
                </div>

                {/* Automated Role-Based Owner Info Banner */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-900 block">Quyền phụ trách dữ liệu</span>
                      <span className="text-[11px] text-slate-600">Bảo lưu theo vai trò và quyền hạn hiện tại</span>
                    </div>
                  </div>
                  {account.owner ? (
                    <Badge variant="outline" className={`font-bold text-[11px] px-2.5 py-1 shrink-0 ${
                      account.owner.type === 'TEAM'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {account.owner.type === 'TEAM' ? '🏢 Nhóm phụ trách' : '👤 Cá nhân phụ trách'}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 font-medium text-[11px] px-2.5 py-1 shrink-0">
                      Chưa phân công
                    </Badge>
                  )}
                </div>

                <DynamicForm
                  formId="inPlaceEditForm"
                  schema={accountSchema}
                  values={inPlaceValues}
                  onChange={handleInPlaceFieldChange}
                  onSubmit={handleSaveEdit}
                  disabled={isSaving}
                />
              </div>
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

      {/* Modal Thêm / Chỉnh sửa Địa chỉ Chuẩn hóa */}
      <AccountAddressDialog
        open={isAddressModalOpen}
        onOpenChange={setIsAddressModalOpen}
        accountId={account?.id || ''}
        address={editingAddress}
        defaultIsPrimary={addresses.length === 0}
        onSuccess={fetchAddresses}
      />
    </Dialog>
  );
};
