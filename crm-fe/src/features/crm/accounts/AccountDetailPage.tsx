import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  accountApi,
  AccountResponse,
  AccountSummaryResponse,
  AccountType,
  AccountLifecycleStage,
  UpdateAccountRequest,
} from '@/services/api/accountApi';
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
  AccountAddressType,
  ACCOUNT_ADDRESS_TYPE_CONFIG,
} from '@/services/api/accountAddressApi';
import { AccountAddressDialog } from './components/AccountAddressDialog';
import { ProfileHeaderCard } from '@/components/common/ProfileHeaderCard';
import { EmptyState } from '@/components/common/EmptyState';
import { useAuth } from '@/core/session/useAuth';
import { toast } from 'sonner';
import { formatVietnameseReading, BusinessNumberInput } from '@/components/ui/BusinessNumberInput';
import {
  renderLifecycleStageBadge as getLifecycleStageBadge,
  renderAccountTypeBadge as getAccountTypeBadge,
} from '@/config/crmStatusConfig';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { ActivityTimelineWidget } from '@/features/crm/timeline/ActivityTimelineWidget';
import { QuickNotesWidget } from '@/features/crm/notes/QuickNotesWidget';
import { QuickTaggingWidget } from '@/features/crm/tags/QuickTaggingWidget';
import { CustomFieldsRenderer } from '@/features/crm/customfields/CustomFieldsRenderer';
import { CustomerHealthWidget } from '@/features/crm/health/CustomerHealthWidget';
import {
  RefreshCw,
  Edit3,
  Trash2,
  Save,
  Loader2,
  ExternalLink,
  Building2,
  Building,
  Users,
  DollarSign,
  Briefcase,
  Globe,
  FileText,
  Phone,
  Link2,
  Calendar,
  ShieldAlert,
  Copy,
  Mail,
  PhoneCall,
  MessageSquare,
  Star,
  Plus,
  ArrowRight,
  XCircle,
  Ban,
  MapPin,
  CalendarOff,
  Truck,
  Search,
  X,
  Clock,
} from 'lucide-react';

interface AccountNoteItem {
  id: string;
  category: 'GENERAL' | 'CALL' | 'MEETING' | 'RISK';
  content: string;
  authorName: string;
  createdAt: string;
}
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export const AccountDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();

  const [account, setAccount] = useState<AccountResponse | null>(null);
  const [allAccounts, setAllAccounts] = useState<AccountSummaryResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

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

  // Addresses States
  const [addresses, setAddresses] = useState<AccountAddressResponse[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [includeHistoryAddresses, setIncludeHistoryAddresses] = useState(false);
  const [selectedAddressTypeFilter, setSelectedAddressTypeFilter] = useState<string>('ALL');
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AccountAddressResponse | null>(null);

  // Communication Channels & Relationships States
  const [channels, setChannels] = useState<AccountCommunicationChannelResponse[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [newChannelType, setNewChannelType] = useState<ChannelType>('EMAIL');
  const [newChannelValue, setNewChannelValue] = useState('');
  const [newChannelLabel, setNewChannelLabel] = useState('');
  const [isAddingChannel, setIsAddingChannel] = useState(false);

  const [relationships, setRelationships] = useState<AccountRelationshipResponse[]>([]);
  const [loadingRelationships, setLoadingRelationships] = useState(false);
  const [newRelType, setNewRelType] = useState<RelationshipType>('PARTNER');
  const [newRelTargetId, setNewRelTargetId] = useState('');
  const [newRelDesc, setNewRelDesc] = useState('');
  const [isAddingRel, setIsAddingRel] = useState(false);

  // Notes & Assessment Timeline State
  const [notesList, setNotesList] = useState<AccountNoteItem[]>([]);
  const [newNoteCategory, setNewNoteCategory] = useState<'GENERAL' | 'CALL' | 'MEETING' | 'RISK'>('GENERAL');
  const [newNoteContent, setNewNoteContent] = useState('');

  useEffect(() => {
    if (id) {
      fetchAccountDetail();
      fetchAllAccountsSummary();
      fetchAddresses();
      fetchChannels();
      fetchRelationships();
    }
  }, [id, includeHistoryAddresses, selectedAddressTypeFilter]);

  useEffect(() => {
    if (id) {
      const stored = localStorage.getItem(`crm_notes_${id}`);
      if (stored) {
        try {
          setNotesList(JSON.parse(stored));
        } catch {
          setNotesList([]);
        }
      } else {
        setNotesList([]);
      }
    }
  }, [id]);

  const fetchAccountDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await accountApi.get(id);
      setAccount(data);
      if (data) {
        setDisplayName(data.displayName || '');
        setLegalName(data.legalName || '');
        setParentAccountId(data.parentAccountId || undefined);
        setAccountType(data.accountType || 'ORGANIZATION');
        setLifecycleStage(data.lifecycleStage || 'PROSPECT');
        setTaxIdentifier(data.taxIdentifier || '');
        setRegistrationNumber(data.registrationNumber || '');
        setIndustryCode(data.industryCode || '');
        setWebsite(data.website || '');
        setRevenueAmount(data.annualRevenue?.amount ? data.annualRevenue.amount.toString() : '');
        setEmployeeCount(data.employeeCount ? data.employeeCount.toString() : '');
        setDescription(data.description || '');
        setDoNotContact(Boolean(data.doNotContact));
      }
    } catch {
      toast.error('Không thể tải thông tin khách hàng');
      navigate('/app/crm/accounts');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAccountsSummary = async () => {
    try {
      const res = await accountApi.search({ size: 100 });
      setAllAccounts(res?.items || []);
    } catch {
      setAllAccounts([]);
    }
  };

  const fetchChannels = async () => {
    if (!id) return;
    setLoadingChannels(true);
    try {
      const data = await accountChannelApi.list(id);
      setChannels(data || []);
    } catch {
      setChannels([]);
    } finally {
      setLoadingChannels(false);
    }
  };

  const fetchRelationships = async () => {
    if (!id) return;
    setLoadingRelationships(true);
    try {
      const data = await accountRelationshipApi.search(id);
      setRelationships(data?.items || []);
    } catch {
      setRelationships([]);
    } finally {
      setLoadingRelationships(false);
    }
  };

  const fetchAddresses = async () => {
    if (!id) return;
    setLoadingAddresses(true);
    try {
      const data = await accountAddressApi.list(id, {
        addressType:
          selectedAddressTypeFilter !== 'ALL'
            ? (selectedAddressTypeFilter as AccountAddressType)
            : undefined,
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
    if (!id) return;
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
      await accountAddressApi.end(id, addr.id, addr.version);
      toast.success('Đã kết thúc hiệu lực địa chỉ thành công');
      fetchAddresses();
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Không thể kết thúc hiệu lực địa chỉ'));
    }
  };

  const handleSetPrimaryAddress = async (addr: AccountAddressResponse) => {
    if (!id) return;
    try {
      await accountAddressApi.update(id, addr.id, addr.version, {
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
      toast.success(`Đã cập nhật thành công thông tin "${displayName}"!`);
      setIsEditing(false);
      fetchAccountDetail();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Cập nhật thất bại';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!account) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ khách hàng "${account.displayName}"?`)) return;

    try {
      await accountApi.delete(account.id, account.version);
      toast.success('Đã xóa hồ sơ khách hàng thành công');
      navigate('/app/crm/accounts');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể xóa khách hàng này');
    }
  };

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newChannelValue.trim()) return;

    const normalizedVal = normalizeChannelValue(newChannelType, newChannelValue);

    if (newChannelType === 'EMAIL' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedVal)) {
      toast.error('Địa chỉ Email không đúng định dạng. Ví dụ: name@company.com');
      return;
    }

    setIsAddingChannel(true);
    try {
      await accountChannelApi.create(id, {
        channelType: newChannelType,
        rawValue: normalizedVal,
        label: newChannelLabel.trim() || undefined,
        isPrimary: false,
        doNotUse: false,
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
    if (!id) return;
    try {
      await accountChannelApi.delete(id, channelId, version);
      toast.success('Đã xóa kênh liên lạc');
      fetchChannels();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể xóa kênh liên lạc');
    }
  };

  const handleTogglePrimaryChannel = async (ch: AccountCommunicationChannelResponse) => {
    if (!id) return;
    try {
      await accountChannelApi.update(id, ch.id, ch.version, {
        isPrimary: true,
      });
      toast.success(`Đã thiết lập ${ch.rawValue} làm kênh liên lạc chính`);
      fetchChannels();
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Không thể cập nhật kênh chính'));
    }
  };

  const handleToggleDncChannel = async (ch: AccountCommunicationChannelResponse) => {
    if (!id) return;
    try {
      await accountChannelApi.update(id, ch.id, ch.version, {
        doNotUse: !ch.doNotUse,
      });
      toast.success(`Đã ${!ch.doNotUse ? 'đánh dấu Không sử dụng (DNC)' : 'bỏ đánh dấu DNC'} cho kênh ${ch.rawValue}`);
      fetchChannels();
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Không thể cập nhật trạng thái DNC'));
    }
  };

  const handleAddRelationship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newRelTargetId) return;
    setIsAddingRel(true);
    try {
      await accountRelationshipApi.create(id, {
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

  const handleEndRelationship = async (relId: string) => {
    if (!id) return;
    if (!window.confirm('Bạn có chắc chắn muốn kết thúc mối quan hệ doanh nghiệp này?')) return;
    try {
      await accountRelationshipApi.end(id, relId, { reason: 'Người dùng hủy liên kết' });
      toast.success('Đã kết thúc mối quan hệ doanh nghiệp');
      fetchRelationships();
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Không thể kết thúc mối quan hệ'));
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !id) return;
    const newNote: AccountNoteItem = {
      id: `note-${Date.now()}`,
      category: newNoteCategory,
      content: newNoteContent.trim(),
      authorName: session?.user?.display_name || session?.user?.email || 'Chuyên viên CRM',
      createdAt: new Date().toISOString(),
    };
    const updated = [newNote, ...notesList];
    setNotesList(updated);
    localStorage.setItem(`crm_notes_${id}`, JSON.stringify(updated));
    setNewNoteContent('');
    toast.success('Đã thêm ghi chú mới vào nhật ký chăm sóc');
  };

  const handleDeleteNote = (noteId: string) => {
    if (!id) return;
    const updated = notesList.filter((n) => n.id !== noteId);
    setNotesList(updated);
    localStorage.setItem(`crm_notes_${id}`, JSON.stringify(updated));
    toast.success('Đã xóa ghi chú khỏi nhật ký');
  };

  const copyToClipboard = (text: string, labelName: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${labelName}: ${text}`);
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

  const getInitials = (name?: string) => {
    if (!name) return 'KH';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const parentAccountObj = allAccounts.find((a) => a.id === account?.parentAccountId);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <span className="text-sm font-semibold">Đang tải hồ sơ thông tin chi tiết khách hàng...</span>
      </div>
    );
  }

  if (!account) return null;

  return (
    <ProfileHeaderCard
      backUrl="/app/crm/accounts"
      backLabel="Khách hàng"
      breadcrumbCurrent={account.displayName}
      coverTag="Hồ sơ Khách hàng Doanh nghiệp"
      avatarText={getInitials(account.displayName)}
      title={account.displayName}
      subtitle={account.legalName}
      verified={true}
      badges={
        <>
          {account.accountNumber && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-mono font-bold text-xs py-1 px-3">
              Mã KH: {account.accountNumber}
            </Badge>
          )}
          {getAccountTypeBadge(account.accountType)}
          {getLifecycleStageBadge(account.lifecycleStage)}
          {account.doNotContact && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-bold text-xs py-1 px-3">
              DNC (Từ chối liên hệ)
            </Badge>
          )}
        </>
      }
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAccountDetail}
            disabled={loading}
            className="h-9 text-xs font-semibold border-slate-200 gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>

          {!isEditing ? (
            <>
              <Button
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-9 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Chỉnh sửa Hồ sơ</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteAccount}
                className="h-9 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa Hồ sơ</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="h-9 text-xs font-semibold border-slate-200"
              >
                Hủy Chỉnh sửa
              </Button>
              <Button
                type="submit"
                form="detailEditForm"
                disabled={isSaving}
                className="h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Lưu thay đổi</span>
              </Button>
            </>
          )}
        </>
      }
    >

      {/* Quick Tagging Widget Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs mb-4 flex items-center justify-between gap-4">
        <QuickTaggingWidget targetType="ACCOUNT" targetId={account.id} />
      </div>

      {/* Main Tabs Navigation Component - Standardized with User Profile Page */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="bg-white border border-slate-200 p-1 shadow-2xs w-full justify-start flex-wrap sm:flex-nowrap h-auto overflow-hidden">
          <TabsTrigger value="timeline" className="gap-2 text-xs font-semibold py-2 px-4">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Dòng thời gian 360°</span>
          </TabsTrigger>
          <TabsTrigger value="info" className="gap-2 text-xs font-semibold py-2 px-4">
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>Hồ sơ & Pháp lý</span>
          </TabsTrigger>
          <TabsTrigger value="addresses" className="gap-2 text-xs font-semibold py-2 px-4">
            <MapPin className="w-4 h-4 text-slate-500" />
            <span>Địa chỉ & Chi nhánh ({addresses.length})</span>
          </TabsTrigger>
          <TabsTrigger value="channels" className="gap-2 text-xs font-semibold py-2 px-4">
            <Phone className="w-4 h-4 text-slate-500" />
            <span>Kênh liên lạc ({channels.length})</span>
          </TabsTrigger>
          <TabsTrigger value="relationships" className="gap-2 text-xs font-semibold py-2 px-4">
            <Link2 className="w-4 h-4 text-slate-500" />
            <span>Mối quan hệ Doanh nghiệp ({relationships.length})</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2 text-xs font-semibold py-2 px-4">
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Sổ Ghi chú & Đánh giá</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 0: 360° ACTIVITY TIMELINE & QUICK ACTIONS */}
        <TabsContent value="timeline" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <ActivityTimelineWidget
                entityType="account"
                entityId={account.id}
              />
            </div>
            <div className="space-y-6">
              <QuickNotesWidget
                accountId={account.id}
                onNoteAdded={fetchAccountDetail}
              />
            </div>
          </div>
        </TabsContent>

        {/* TAB 1: ENTERPRISE PROFILE & LEGAL DETAILS */}
        <TabsContent value="info" className="mt-6 space-y-6">
          {!isEditing ? (
            <>
              {/* Customer Health Score & Churn Risk Engine */}
              <CustomerHealthWidget accountId={account.id} accountName={account.displayName} />

              {/* 4 Premium Summary Cards */}
              {/* 4 Harmonious Uniform Metric Cards with Light Colored Borders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Annual Revenue Card */}
                <Card className="border border-blue-200 bg-gradient-to-br from-white via-white to-blue-50/40 hover:border-blue-300 hover:shadow-xs transition-all duration-200 rounded-xl overflow-hidden">
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Doanh thu năm
                      </span>
                      <div className="text-base font-extrabold text-slate-900 truncate" title={account.annualRevenue?.amount ? `${new Intl.NumberFormat('vi-VN').format(account.annualRevenue.amount)} VNĐ` : undefined}>
                        {formatCurrency(account.annualRevenue?.amount, account.annualRevenue?.currencyCode) || (
                          <span className="text-slate-400 font-normal italic text-xs">Chưa cập nhật</span>
                        )}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/80 shrink-0">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>

                {/* Employee Count Card */}
                <Card className="border border-emerald-200 bg-gradient-to-br from-white via-white to-emerald-50/40 hover:border-emerald-300 hover:shadow-xs transition-all duration-200 rounded-xl overflow-hidden">
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Quy mô nhân sự
                      </span>
                      <div className="text-base font-extrabold text-slate-900 truncate">
                        {account.employeeCount ? (
                          formatVietnameseReading(account.employeeCount, 'người')
                        ) : (
                          <span className="text-slate-400 font-normal italic text-xs">Chưa cập nhật</span>
                        )}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/80 shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>

                {/* Industry Code Card */}
                <Card className="border border-purple-200 bg-gradient-to-br from-white via-white to-purple-50/40 hover:border-purple-300 hover:shadow-xs transition-all duration-200 rounded-xl overflow-hidden">
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Lĩnh vực hoạt động
                      </span>
                      <div className="text-base font-extrabold text-slate-900 truncate" title={account.industryCode || undefined}>
                        {account.industryCode || <span className="text-slate-400 font-normal italic text-xs">Chưa phân loại</span>}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100/80 shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>

                {/* Official Website Card */}
                <Card className="border border-amber-200 bg-gradient-to-br from-white via-white to-amber-50/40 hover:border-amber-300 hover:shadow-xs transition-all duration-200 rounded-xl overflow-hidden">
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Website chính thức
                      </span>
                      <div className="text-sm font-bold text-slate-900 truncate mt-0.5">
                        {account.website ? (
                          <a
                            href={account.website.startsWith('http') ? account.website : `https://${account.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold truncate"
                          >
                            <span>{account.website.replace(/^https?:\/\//, '')}</span>
                            <ExternalLink className="w-3 h-3 text-blue-500 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-slate-400 font-normal italic text-xs">Chưa cập nhật</span>
                        )}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100/80 shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Legal & Profile Information */}
              <Card className="shadow-xs border-slate-200 w-full bg-white">
                <CardHeader className="pb-4 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-900">Thông tin Pháp lý & Quản trị</CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Hồ sơ định danh doanh nghiệp, đăng ký kinh doanh và người phụ trách
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold flex items-center gap-1.5 text-slate-500">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        Tên hiển thị (Thương hiệu)
                      </Label>
                      <span className="font-bold text-slate-900 text-sm block">{account.displayName}</span>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold flex items-center gap-1.5 text-slate-500">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        Tên Pháp lý (ĐKKD)
                      </Label>
                      <span className="font-semibold text-slate-800 block">
                        {account.legalName || <span className="text-slate-400 font-normal italic">Chưa cập nhật</span>}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold flex items-center gap-1.5 text-slate-500">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        Khách hàng Cha / Cấp trên
                      </Label>
                      {parentAccountObj ? (
                        <Link to={`/app/crm/accounts/${parentAccountObj.id}`} className="font-semibold text-blue-600 hover:underline block">
                          {parentAccountObj.accountNumber} - {parentAccountObj.displayName}
                        </Link>
                      ) : (
                        <span className="text-slate-600 font-medium italic block">Khách hàng độc lập / Cấp cao nhất</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold flex items-center gap-1.5 text-slate-500">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        Người / Nhóm phụ trách
                      </Label>
                      <span className="font-bold text-slate-900 block">
                        {account.owner
                          ? (session?.user && account.owner.id === session.user.id
                              ? `${session.user.email} (Chính tôi)`
                              : 'Cá nhân phụ trách')
                          : 'Chưa phân công'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold flex items-center gap-1.5 text-slate-500">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        Mã số thuế (MST)
                      </Label>
                      <span className="font-mono font-bold text-slate-900 block">
                        {account.taxIdentifier || <span className="text-slate-400 font-normal italic">Chưa cập nhật</span>}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold flex items-center gap-1.5 text-slate-500">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        Số Giấy phép ĐKKD
                      </Label>
                      <span className="font-mono font-bold text-slate-900 block">
                        {account.registrationNumber || <span className="text-slate-400 font-normal italic">Chưa cập nhật</span>}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold flex items-center gap-1.5 text-slate-500">
                        <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                        Trạng thái Tiếp thị & Liên hệ
                      </Label>
                      {account.doNotContact ? (
                        <span className="text-red-600 font-bold block">
                          Từ chối nhận cuộc gọi / email (DNC)
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-bold block">
                          Sẵn sàng nhận thông tin tiếp thị
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold flex items-center gap-1.5 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Cập nhật lần cuối
                      </Label>
                      <span className="font-semibold text-slate-700 block">
                        {formatDate(account.updatedAt)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dynamic Custom Fields Section */}
              <CustomFieldsRenderer
                entityType="ACCOUNT"
                entityId={account.id}
                onSaved={fetchAccountDetail}
              />
            </>
          ) : (
            /* IN-PLACE EDIT FORM MODE */
            <Card className="shadow-xs border-slate-200 bg-white">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900">
                  Chỉnh sửa Thông tin Hồ sơ Khách hàng
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Cập nhật các thông tin đăng ký pháp lý và quản trị của doanh nghiệp
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form id="detailEditForm" onSubmit={handleSaveEdit} className="space-y-6 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <Label className="font-bold text-slate-700">Tên Thương hiệu / Hiển thị <span className="text-red-500">*</span></Label>
                      <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className="h-9 text-xs" />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-bold text-slate-700">Tên Pháp lý (ĐKKD)</Label>
                      <Input value={legalName} onChange={(e) => setLegalName(e.target.value)} className="h-9 text-xs" />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-bold text-slate-700">Khách hàng Cha / Cấp trên</Label>
                      <Select value={parentAccountId || 'NONE'} onValueChange={(v) => setParentAccountId(v)}>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="Chọn cấp trên..." />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          <SelectItem value="NONE">Khách hàng độc lập / Cấp cao nhất</SelectItem>
                          {allAccounts
                            .filter((a) => a.id !== account.id)
                            .map((a) => (
                              <SelectItem key={a.id} value={a.id}>
                                {a.accountNumber} - {a.displayName}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-bold text-slate-700">Loại hình Khách hàng <span className="text-red-500">*</span></Label>
                      <Select value={accountType} onValueChange={(v: AccountType) => setAccountType(v)}>
                        <SelectTrigger className="h-9 text-xs">
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
                      <Label className="font-bold text-slate-700">Vòng đời Kinh doanh <span className="text-red-500">*</span></Label>
                      <Select value={lifecycleStage} onValueChange={(v: AccountLifecycleStage) => setLifecycleStage(v)}>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          <SelectItem value="PROSPECT">Tiềm năng</SelectItem>
                          <SelectItem value="QUALIFIED">Đạt chuẩn</SelectItem>
                          <SelectItem value="CUSTOMER">Khách hàng chính thức</SelectItem>
                          <SelectItem value="CHURNED">Rời bỏ</SelectItem>
                          <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <BusinessNumberInput label="Mã số thuế (MST)" value={taxIdentifier} onChange={setTaxIdentifier} placeholder="Nhập 10 hoặc 13 chữ số MST..." />
                    </div>

                    <div className="space-y-1.5">
                      <BusinessNumberInput label="Số Giấy phép ĐKKD" value={registrationNumber} onChange={setRegistrationNumber} placeholder="Nhập số ĐKKD..." />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-bold text-slate-700">Doanh thu hàng năm (VNĐ)</Label>
                      <Input type="number" value={revenueAmount} onChange={(e) => setRevenueAmount(e.target.value)} placeholder="VD: 5000000000" className="h-9 text-xs" />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-bold text-slate-700">Website chính thức</Label>
                      <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://company.com" className="h-9 text-xs" />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-bold text-slate-700">Quy mô nhân sự</Label>
                      <Input type="number" value={employeeCount} onChange={(e) => setEmployeeCount(e.target.value)} placeholder="Số nhân viên..." className="h-9 text-xs" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700">Ghi chú & Mô tả Chăm sóc</Label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="detailDnc" checked={doNotContact} onCheckedChange={(c) => setDoNotContact(Boolean(c))} />
                    <Label htmlFor="detailDnc" className="text-xs font-semibold text-slate-700 cursor-pointer">
                      Từ chối nhận liên lạc & tiếp thị (DNC)
                    </Label>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB 2: ADDRESSES & BRANCHES */}
        <TabsContent value="addresses" className="mt-6 space-y-6">
          {/* 4 KPI Summary Cards for Addresses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Addresses */}
            <Card className="border-blue-100 bg-linear-to-br from-blue-50/50 via-white to-blue-50/20 shadow-2xs hover:shadow-xs transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Tổng số Địa chỉ
                    </p>
                    <p className="text-xl font-black text-slate-900 tracking-tight">
                      {addresses.length}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center shadow-2xs">
                    <MapPin className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Primary Address */}
            <Card className="border-emerald-100 bg-linear-to-br from-emerald-50/50 via-white to-emerald-50/20 shadow-2xs hover:shadow-xs transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 overflow-hidden pr-2">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Địa chỉ Chính
                    </p>
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {addresses.find((a) => a.isPrimary && !a.validTo)?.formattedAddress ||
                        addresses.find((a) => a.isPrimary && !a.validTo)?.addressLine1 ||
                        'Chưa thiết lập'}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <Star className="w-5 h-5 fill-emerald-500 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Office & Registered */}
            <Card className="border-purple-100 bg-linear-to-br from-purple-50/50 via-white to-purple-50/20 shadow-2xs hover:shadow-xs transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Trụ sở & ĐKKD
                    </p>
                    <p className="text-xl font-black text-slate-900 tracking-tight">
                      {addresses.filter((a) => (a.addressType === 'OFFICE' || a.addressType === 'REGISTERED') && !a.validTo).length}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-100/70 text-purple-700 flex items-center justify-center shadow-2xs">
                    <Building className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Billing & Shipping */}
            <Card className="border-amber-100 bg-linear-to-br from-amber-50/50 via-white to-amber-50/20 shadow-2xs hover:shadow-xs transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Hóa đơn & Giao hàng
                    </p>
                    <p className="text-xl font-black text-slate-900 tracking-tight">
                      {addresses.filter((a) => (a.addressType === 'BILLING' || a.addressType === 'SHIPPING') && !a.validTo).length}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-700 flex items-center justify-center shadow-2xs">
                    <Truck className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Card with Filter Bar and Address List */}
          <Card className="shadow-xs border-slate-200 bg-white">
            <CardHeader className="pb-4 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Danh bạ Địa chỉ & Chi nhánh</span>
                    <Badge variant="outline" className="text-xs font-bold text-slate-600 bg-slate-50">
                      {addresses.length} địa chỉ
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">
                    Quản lý trụ sở, văn phòng đại diện, địa chỉ xuất hóa đơn (Billing) và kho giao hàng (Shipping)
                  </CardDescription>
                </div>

                <Button
                  onClick={handleOpenCreateAddress}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 gap-1.5 shadow-2xs shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Địa chỉ Mới</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-5 space-y-5">
              {/* Search & Filter Bar */}
              <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/70 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="flex flex-1 items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="Tìm kiếm theo địa chỉ, quận/huyện, tỉnh/thành..."
                      value={addressSearchQuery}
                      onChange={(e) => setAddressSearchQuery(e.target.value)}
                      className="pl-8 h-8 text-xs bg-white border-slate-200"
                    />
                    {addressSearchQuery && (
                      <button
                        onClick={() => setAddressSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="w-48 shrink-0">
                    <SearchableSelect
                      placeholder="Tất cả loại địa chỉ"
                      searchPlaceholder="Tìm loại địa chỉ..."
                      value={selectedAddressTypeFilter}
                      onValueChange={setSelectedAddressTypeFilter}
                      options={[
                        { label: 'Tất cả loại hình', value: 'ALL' },
                        { label: 'Văn phòng / Chi nhánh', value: 'OFFICE' },
                        { label: 'Đăng ký KD (ĐKKD)', value: 'REGISTERED' },
                        { label: 'Xuất hóa đơn (Billing)', value: 'BILLING' },
                        { label: 'Giao hàng (Shipping)', value: 'SHIPPING' },
                        { label: 'Địa chỉ khác', value: 'OTHER' },
                      ]}
                      className="h-8 text-xs bg-white border-slate-200"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-200/80 pt-2 md:pt-0 md:pl-3">
                  <Checkbox
                    id="includeHistoryAddr"
                    checked={includeHistoryAddresses}
                    onCheckedChange={(c) => setIncludeHistoryAddresses(Boolean(c))}
                  />
                  <Label
                    htmlFor="includeHistoryAddr"
                    className="text-xs font-semibold text-slate-700 cursor-pointer select-none whitespace-nowrap"
                  >
                    Bao gồm địa chỉ đã kết thúc / lịch sử
                  </Label>
                </div>
              </div>

              {/* Address List / Grid */}
              {loadingAddresses ? (
                <div className="py-12 text-center text-slate-500 flex justify-center items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="text-xs font-medium">Đang tải danh sách địa chỉ khách hàng...</span>
                </div>
              ) : addresses.filter((addr) => {
                  if (!addressSearchQuery.trim()) return true;
                  const query = addressSearchQuery.toLowerCase();
                  return (
                    (addr.formattedAddress && addr.formattedAddress.toLowerCase().includes(query)) ||
                    (addr.addressLine1 && addr.addressLine1.toLowerCase().includes(query)) ||
                    (addr.addressLine2 && addr.addressLine2.toLowerCase().includes(query)) ||
                    (addr.locality && addr.locality.toLowerCase().includes(query)) ||
                    (addr.administrativeArea && addr.administrativeArea.toLowerCase().includes(query)) ||
                    (addr.postalCode && addr.postalCode.toLowerCase().includes(query)) ||
                    (addr.countryCode && addr.countryCode.toLowerCase().includes(query))
                  );
                }).length === 0 ? (
                <EmptyState
                  icon={MapPin}
                  title="Chưa có thông tin địa chỉ nào"
                  description={
                    addressSearchQuery || selectedAddressTypeFilter !== 'ALL'
                      ? 'Không tìm thấy địa chỉ phù hợp với bộ lọc tìm kiếm.'
                      : 'Khách hàng này chưa được thiết lập địa chỉ văn phòng, trụ sở hay địa chỉ giao hàng.'
                  }
                  actionLabel="Thêm Địa chỉ Đầu tiên"
                  onAction={handleOpenCreateAddress}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses
                    .filter((addr) => {
                      if (!addressSearchQuery.trim()) return true;
                      const query = addressSearchQuery.toLowerCase();
                      return (
                        (addr.formattedAddress && addr.formattedAddress.toLowerCase().includes(query)) ||
                        (addr.addressLine1 && addr.addressLine1.toLowerCase().includes(query)) ||
                        (addr.addressLine2 && addr.addressLine2.toLowerCase().includes(query)) ||
                        (addr.locality && addr.locality.toLowerCase().includes(query)) ||
                        (addr.administrativeArea && addr.administrativeArea.toLowerCase().includes(query)) ||
                        (addr.postalCode && addr.postalCode.toLowerCase().includes(query)) ||
                        (addr.countryCode && addr.countryCode.toLowerCase().includes(query))
                      );
                    })
                    .map((addr) => {
                      const typeConfig = ACCOUNT_ADDRESS_TYPE_CONFIG[addr.addressType] || {
                        label: addr.addressType,
                        badge: addr.addressType,
                        color: 'bg-slate-50 text-slate-700 border-slate-200',
                      };
                      const isEnded = Boolean(addr.validTo);
                      const isFuture = Boolean(addr.validFrom && new Date(addr.validFrom) > new Date());

                      return (
                        <div
                          key={addr.id}
                          className={`p-4 rounded-xl border transition-all relative flex flex-col justify-between space-y-3 ${
                            isEnded
                              ? 'border-slate-200 bg-slate-50/50 opacity-75'
                              : addr.isPrimary
                              ? 'border-blue-300/80 bg-blue-50/20 shadow-2xs hover:border-blue-400'
                              : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                          }`}
                        >
                          <div className="space-y-2.5">
                            {/* Card Header: Type Badge, Primary, Validity Status */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <Badge className={`text-[11px] font-bold ${typeConfig.color}`}>
                                  {typeConfig.label}
                                </Badge>

                                {addr.isPrimary && (
                                  <Badge className="text-[11px] font-bold bg-amber-50 text-amber-700 border-amber-200 gap-1">
                                    <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                                    <span>Địa chỉ chính</span>
                                  </Badge>
                                )}

                                {isEnded ? (
                                  <Badge variant="outline" className="text-[10px] font-semibold text-rose-600 border-rose-200 bg-rose-50/50">
                                    Đã kết thúc: {addr.validTo}
                                  </Badge>
                                ) : isFuture ? (
                                  <Badge variant="outline" className="text-[10px] font-semibold text-purple-600 border-purple-200 bg-purple-50/50">
                                    Hiệu lực từ: {addr.validFrom}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[10px] font-semibold text-emerald-600 border-emerald-200 bg-emerald-50/50">
                                    Đang hiệu lực
                                  </Badge>
                                )}
                              </div>

                              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                v{addr.version}
                              </span>
                            </div>

                            {/* Formatted or Constructed Address */}
                            <div>
                              <p className="font-bold text-slate-900 text-sm leading-snug">
                                {addr.formattedAddress || addr.addressLine1 || 'Chưa đặt tên đường'}
                              </p>
                              {addr.addressLine2 && (
                                <p className="text-xs text-slate-600 mt-0.5 font-medium">
                                  {addr.addressLine2}
                                </p>
                              )}
                            </div>

                            {/* Locality, Admin Area, Postal Code, Country */}
                            <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-1">
                              {addr.locality && (
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-medium text-[11px]">
                                  {addr.locality}
                                </span>
                              )}
                              {addr.administrativeArea && (
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-medium text-[11px]">
                                  {addr.administrativeArea}
                                </span>
                              )}
                              {addr.postalCode && (
                                <span className="font-mono text-slate-500 text-[11px]">
                                  Zip: {addr.postalCode}
                                </span>
                              )}
                              <span className="font-bold text-slate-700 text-[11px]">
                                🌍 {addr.countryCode === 'VN' ? 'Việt Nam (VN)' : addr.countryCode}
                              </span>
                            </div>

                            {/* Coordinates / Map link */}
                            {addr.latitude !== null && addr.latitude !== undefined && addr.longitude !== null && addr.longitude !== undefined && (
                              <div className="pt-1 flex items-center justify-between text-[11px]">
                                <span className="font-mono text-slate-500 text-[10px]">
                                  GPS: {addr.latitude}, {addr.longitude}
                                </span>
                                <a
                                  href={`https://www.google.com/maps?q=${addr.latitude},${addr.longitude}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 hover:underline"
                                >
                                  <span>Xem bản đồ</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Card Actions Footer */}
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <div className="text-[10px] text-slate-400">
                              {addr.validFrom ? `Bắt đầu: ${addr.validFrom}` : `Tạo: ${new Date(addr.createdAt).toLocaleDateString('vi-VN')}`}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {!isEnded && !addr.isPrimary && !isFuture && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSetPrimaryAddress(addr)}
                                  className="h-7 text-[11px] font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50 px-2 gap-1"
                                  title="Đặt làm địa chỉ chính"
                                >
                                  <Star className="w-3 h-3" />
                                  <span className="hidden sm:inline">Đặt chính</span>
                                </Button>
                              )}

                              {!isEnded && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenEditAddress(addr)}
                                    className="h-7 text-[11px] font-semibold text-slate-600 hover:text-blue-700 hover:bg-blue-50 px-2 gap-1"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>Sửa</span>
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEndAddress(addr)}
                                    className="h-7 text-[11px] font-semibold text-slate-400 hover:text-rose-700 hover:bg-rose-50 px-2 gap-1"
                                    title="Kết thúc hiệu lực địa chỉ này"
                                  >
                                    <CalendarOff className="w-3 h-3" />
                                    <span>Kết thúc</span>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: COMMUNICATION CHANNELS */}
        <TabsContent value="channels" className="mt-6">
          <Card className="shadow-xs border-slate-200 bg-white">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900">
                Kênh Liên lạc & Đầu mối Xử lý ({channels.length})
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Quản lý Email, Số điện thoại (tự động chuyển E.164), WhatsApp và kênh liên lạc trực tiếp
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6 text-xs">
              {/* Form thêm kênh mới */}
              <form onSubmit={handleAddChannel} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <span className="font-bold text-slate-900 block text-xs">Thêm Kênh Liên lạc Mới</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Select value={newChannelType} onValueChange={(v: ChannelType) => setNewChannelType(v)}>
                    <SelectTrigger className="h-9 text-xs bg-white border-slate-200">
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
                      className="h-9 text-xs bg-white"
                      required
                    />
                    {['PHONE', 'MOBILE', 'SMS', 'WHATSAPP'].includes(newChannelType) && newChannelValue.trim() !== '' && (
                      <p className="text-[11px] text-blue-600 mt-1 font-medium flex items-center gap-1">
                        <span>Chuẩn hóa E.164:</span>
                        <span className="font-mono font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
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
                      className="h-9 text-xs bg-white flex-1"
                    />
                    <Button type="submit" size="sm" disabled={isAddingChannel || !newChannelValue.trim()} className="h-9 bg-blue-600 hover:bg-blue-700 text-xs font-semibold px-4 shrink-0 gap-1">
                      {isAddingChannel ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>Thêm</span>
                    </Button>
                  </div>
                </div>
              </form>

              {/* Danh sách Kênh */}
              {loadingChannels ? (
                <div className="py-8 text-center text-slate-500 flex justify-center items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Đang tải danh sách kênh liên lạc...</span>
                </div>
              ) : channels.length === 0 ? (
                <div className="py-12 text-center text-slate-400 italic">Chưa có kênh liên lạc nào được lưu.</div>
              ) : (
                <div className="space-y-3">
                  {channels.map((ch) => (
                    <div key={ch.id} className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                          {ch.channelType === 'EMAIL' ? <Mail className="w-4 h-4" /> :
                           ch.channelType === 'WHATSAPP' ? <MessageSquare className="w-4 h-4 text-emerald-600" /> :
                           <PhoneCall className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-slate-900 text-sm">{ch.rawValue}</span>
                            {ch.isPrimary && (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] px-2 py-0.5 font-bold gap-1">
                                <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                                Kênh Chính
                              </Badge>
                            )}
                            {ch.doNotUse && (
                              <Badge className="bg-red-100 text-red-800 border-red-200 text-[10px] px-2 py-0.5 font-bold gap-1">
                                <Ban className="w-3 h-3 text-red-600" />
                                Không sử dụng (DNC)
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 mt-0.5 block">
                            Loại: <strong className="text-slate-700">{ch.label || ch.channelType}</strong> • Ngày tạo: {new Date(ch.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>

                      {/* Quick Action Buttons Group */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(ch.rawValue, 'Giá trị kênh')}
                          className="h-8 text-xs px-2.5 text-slate-600 border-slate-200 gap-1"
                          title="Sao chép"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">Sao chép</span>
                        </Button>

                        {ch.channelType === 'EMAIL' && (
                          <a
                            href={`mailto:${ch.rawValue}`}
                            className="h-8 px-2.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 inline-flex items-center gap-1"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Gửi Mail</span>
                          </a>
                        )}

                        {['PHONE', 'MOBILE'].includes(ch.channelType) && (
                          <a
                            href={`tel:${ch.rawValue}`}
                            className="h-8 px-2.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 inline-flex items-center gap-1"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>Gọi điện</span>
                          </a>
                        )}

                        {ch.channelType === 'WHATSAPP' && (
                          <a
                            href={`https://wa.me/${ch.rawValue.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-8 px-2.5 text-xs font-medium text-emerald-700 bg-emerald-100 border border-emerald-300 rounded-md hover:bg-emerald-200 inline-flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        )}

                        {!ch.isPrimary && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTogglePrimaryChannel(ch)}
                            className="h-8 text-xs text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100 gap-1"
                            title="Đặt làm kênh chính"
                          >
                            <Star className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">Đặt Kênh chính</span>
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleDncChannel(ch)}
                          className={`h-8 text-xs gap-1 ${ch.doNotUse ? 'text-blue-600 border-blue-200 bg-blue-50' : 'text-slate-600 border-slate-200'}`}
                          title="Bật/Tắt DNC"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span className="hidden lg:inline">{ch.doNotUse ? 'Bỏ DNC' : 'Đánh dấu DNC'}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteChannel(ch.id, ch.version)}
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Xóa kênh"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: CORPORATE RELATIONSHIPS */}
        <TabsContent value="relationships" className="mt-6">
          <Card className="shadow-xs border-slate-200 bg-white">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900">
                Mối Quan hệ Doanh nghiệp & Liên kết ({relationships.length})
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Thiết lập liên kết giữa các Công ty Mẹ/Con, Đối tác chiến lược và Đơn vị thành viên
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6 text-xs">
              {/* Form thêm mối quan hệ */}
              <form onSubmit={handleAddRelationship} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <span className="font-bold text-slate-900 block text-xs">Thiết lập Mối Quan hệ Mới</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Select value={newRelType} onValueChange={(v: RelationshipType) => setNewRelType(v)}>
                    <SelectTrigger className="h-9 text-xs bg-white border-slate-200">
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
                    <SelectTrigger className="h-9 text-xs bg-white border-slate-200">
                      <SelectValue placeholder="Chọn Khách hàng..." />
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
                      className="h-9 text-xs bg-white flex-1"
                    />
                    <Button type="submit" size="sm" disabled={isAddingRel || !newRelTargetId} className="h-9 bg-blue-600 hover:bg-blue-700 text-xs font-semibold px-4 shrink-0 gap-1">
                      {isAddingRel ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>Lưu</span>
                    </Button>
                  </div>
                </div>
              </form>

              {/* Danh sách Mối quan hệ */}
              {loadingRelationships ? (
                <div className="py-8 text-center text-slate-500 flex justify-center items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Đang tải mối quan hệ...</span>
                </div>
              ) : relationships.length === 0 ? (
                <div className="py-12 text-center text-slate-400 italic">Chưa ghi nhận mối quan hệ liên kết nào.</div>
              ) : (
                <div className="space-y-3">
                  {relationships.map((rel) => {
                    const isOutbound = rel.account.id === account.id;
                    const targetObj = isOutbound ? rel.relatedAccount : rel.account;

                    return (
                      <div key={rel.id} className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
                            <Link2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link to={`/app/crm/accounts/${targetObj.id}`} className="font-bold text-slate-900 text-sm hover:text-blue-600 hover:underline flex items-center gap-1">
                                <span>{targetObj.displayName} ({targetObj.accountNumber})</span>
                                <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
                              </Link>
                              <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-bold">
                                {rel.relationshipType}
                              </Badge>
                              <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 text-[10px]">
                                {isOutbound ? 'Hướng ra (Chiều đi)' : 'Hướng vào (Chiều đến)'}
                              </Badge>
                            </div>
                            {rel.description && <p className="text-xs text-slate-600 mt-1">{rel.description}</p>}
                            <span className="text-[11px] text-slate-400 mt-1 block">
                              Khởi tạo: {new Date(rel.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEndRelationship(rel.id)}
                          className="h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 gap-1 shrink-0"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Hủy liên kết</span>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: GHI CHÚ & ĐÁNH GIÁ CHĂM SÓC */}
        <TabsContent value="notes" className="mt-6 space-y-6">
          <Card className="shadow-xs border-slate-200 bg-white">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900">
                Nhật ký Ghi chú Chăm sóc & Lịch sử Trao đổi ({notesList.length})
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Lưu vết lịch sử cuộc gọi, trao đổi, biên bản cuộc họp và đánh giá rủi ro khách hàng
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6 text-xs">
              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 block text-xs">Thêm Ghi chú / Nhật ký Mới</span>
                  <Select value={newNoteCategory} onValueChange={(v: any) => setNewNoteCategory(v)}>
                    <SelectTrigger className="h-8 w-44 text-xs bg-white border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem value="GENERAL">Ghi chú chung</SelectItem>
                      <SelectItem value="CALL">Cuộc gọi khách hàng</SelectItem>
                      <SelectItem value="MEETING">Cuộc họp & Trao đổi</SelectItem>
                      <SelectItem value="RISK">Đánh giá rủi ro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Nhập nội dung ghi chú chăm sóc, trao đổi hoặc ghi nhận phản hồi từ khách hàng..."
                  rows={3}
                  className="w-full p-3 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />

                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={!newNoteContent.trim()} className="h-8 bg-blue-600 hover:bg-blue-700 text-xs font-semibold px-4 gap-1">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Lưu Ghi chú</span>
                  </Button>
                </div>
              </form>

              {/* Timeline List */}
              {notesList.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="Chưa có ghi chú hoặc nhật ký trao đổi nào"
                  description="Ghi nhận nhật ký cuộc gọi, biên bản làm việc hoặc phản hồi từ khách hàng ở biểu mẫu phía trên."
                />
              ) : (
                <div className="space-y-4">
                  {notesList.map((note) => (
                    <div key={note.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 relative group hover:border-blue-200 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                            {getInitials(note.authorName)}
                          </div>
                          <span className="font-bold text-slate-900">{note.authorName}</span>
                          <span className="text-[11px] text-slate-400">• {new Date(note.createdAt).toLocaleString('vi-VN')}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge className={`text-[10px] font-bold ${
                            note.category === 'CALL' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            note.category === 'MEETING' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            note.category === 'RISK' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {note.category === 'CALL' ? 'Cuộc gọi' :
                             note.category === 'MEETING' ? 'Cuộc họp' :
                             note.category === 'RISK' ? 'Rủi ro' : 'Ghi chú'}
                          </Badge>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteNote(note.id)}
                            className="h-7 w-7 text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Xóa ghi chú"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-slate-800 text-xs leading-relaxed whitespace-pre-wrap pl-8">
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Thêm / Chỉnh sửa Địa chỉ Chuẩn hóa */}
      <AccountAddressDialog
        open={isAddressModalOpen}
        onOpenChange={setIsAddressModalOpen}
        accountId={id || ''}
        address={editingAddress}
        defaultIsPrimary={addresses.length === 0}
        onSuccess={fetchAddresses}
      />
    </ProfileHeaderCard>
  );
};
