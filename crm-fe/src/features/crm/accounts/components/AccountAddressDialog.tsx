import React, { useState, useEffect } from 'react';
import {
  accountAddressApi,
  AccountAddressResponse,
  AccountAddressType,
} from '@/services/api/accountAddressApi';
import { extractErrorMessage } from '@/services/api/apiClient';
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
import { Checkbox } from '@/components/ui/checkbox';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { DatePicker } from '@/components/ui/date-picker';
import { toast } from 'sonner';
import {
  MapPin,
  ChevronDown,
  ChevronUp,
  Save,
  Loader2,
  Compass,
  Calendar,
} from 'lucide-react';

interface AccountAddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  address?: AccountAddressResponse | null;
  defaultIsPrimary?: boolean;
  onSuccess: () => void;
}

const COUNTRY_OPTIONS = [
  { label: 'Việt Nam (VN)', value: 'VN' },
  { label: 'Hoa Kỳ (US)', value: 'US' },
  { label: 'Nhật Bản (JP)', value: 'JP' },
  { label: 'Singapore (SG)', value: 'SG' },
  { label: 'Hàn Quốc (KR)', value: 'KR' },
  { label: 'Úc (AU)', value: 'AU' },
  { label: 'Vương quốc Anh (GB)', value: 'GB' },
  { label: 'Đức (DE)', value: 'DE' },
  { label: 'Trung Quốc (CN)', value: 'CN' },
  { label: 'Thái Lan (TH)', value: 'TH' },
  { label: 'Đài Loan (TW)', value: 'TW' },
  { label: 'Malaysia (MY)', value: 'MY' },
  { label: 'Indonesia (ID)', value: 'ID' },
  { label: 'Pháp (FR)', value: 'FR' },
];

const ADDRESS_TYPE_OPTIONS = [
  { label: 'Văn phòng / Chi nhánh (Office)', value: 'OFFICE' },
  { label: 'Đăng ký kinh doanh (ĐKKD / Registered)', value: 'REGISTERED' },
  { label: 'Địa chỉ xuất Hóa đơn (Billing)', value: 'BILLING' },
  { label: 'Địa chỉ Giao nhận hàng (Shipping)', value: 'SHIPPING' },
  { label: 'Địa chỉ khác (Other)', value: 'OTHER' },
];

export const AccountAddressDialog: React.FC<AccountAddressDialogProps> = ({
  open,
  onOpenChange,
  accountId,
  address,
  defaultIsPrimary = false,
  onSuccess,
}) => {
  const [addrType, setAddrType] = useState<AccountAddressType>('OFFICE');
  const [addrCountryCode, setAddrCountryCode] = useState('VN');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrLocality, setAddrLocality] = useState('');
  const [addrAdminArea, setAddrAdminArea] = useState('');
  const [addrPostalCode, setAddrPostalCode] = useState('');
  const [addrFormatted, setAddrFormatted] = useState('');
  const [addrIsPrimary, setAddrIsPrimary] = useState(false);
  const [addrValidFrom, setAddrValidFrom] = useState('');
  const [addrLatitude, setAddrLatitude] = useState('');
  const [addrLongitude, setAddrLongitude] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (address) {
        setAddrType(address.addressType);
        setAddrCountryCode(address.countryCode || 'VN');
        setAddrLine1(address.addressLine1 || '');
        setAddrLine2(address.addressLine2 || '');
        setAddrLocality(address.locality || '');
        setAddrAdminArea(address.administrativeArea || '');
        setAddrPostalCode(address.postalCode || '');
        setAddrFormatted(address.formattedAddress || '');
        setAddrIsPrimary(address.isPrimary);
        setAddrValidFrom(address.validFrom || '');
        setAddrLatitude(
          address.latitude !== undefined && address.latitude !== null
            ? address.latitude.toString()
            : ''
        );
        setAddrLongitude(
          address.longitude !== undefined && address.longitude !== null
            ? address.longitude.toString()
            : ''
        );
        // If there are existing advanced fields, auto expand
        if (
          address.addressLine2 ||
          address.postalCode ||
          address.latitude ||
          address.longitude ||
          address.validFrom ||
          address.formattedAddress
        ) {
          setShowAdvanced(true);
        } else {
          setShowAdvanced(false);
        }
      } else {
        // Reset form for create
        setAddrType('OFFICE');
        setAddrCountryCode('VN');
        setAddrLine1('');
        setAddrLine2('');
        setAddrLocality('');
        setAddrAdminArea('');
        setAddrPostalCode('');
        setAddrFormatted('');
        setAddrIsPrimary(defaultIsPrimary);
        setAddrValidFrom('');
        setAddrLatitude('');
        setAddrLongitude('');
        setShowAdvanced(false);
      }
    }
  }, [open, address, defaultIsPrimary]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) return;

    const trimmedLine1 = addrLine1.trim();
    const trimmedLocality = addrLocality.trim();
    const trimmedAdminArea = addrAdminArea.trim();
    const trimmedPostal = addrPostalCode.trim();

    // Auto compute formatted address if not explicitly specified
    const computedFull = [
      trimmedLine1,
      addrLine2.trim(),
      trimmedLocality,
      trimmedAdminArea,
      addrCountryCode === 'VN' ? 'Việt Nam' : addrCountryCode,
    ]
      .filter(Boolean)
      .join(', ');

    const finalFormatted = addrFormatted.trim() || computedFull || null;

    if (
      !trimmedLine1 &&
      !trimmedLocality &&
      !trimmedAdminArea &&
      !trimmedPostal &&
      !finalFormatted
    ) {
      toast.error('Vui lòng nhập số nhà, tên đường hoặc tỉnh/thành phố');
      return;
    }

    if (!addrCountryCode.trim() || addrCountryCode.trim().length !== 2) {
      toast.error('Vui lòng chọn quốc gia hợp lệ (mã 2 ký tự)');
      return;
    }

    const latNum = addrLatitude.trim() ? parseFloat(addrLatitude.trim()) : undefined;
    const lngNum = addrLongitude.trim() ? parseFloat(addrLongitude.trim()) : undefined;

    if (
      (latNum !== undefined && lngNum === undefined) ||
      (latNum === undefined && lngNum !== undefined)
    ) {
      toast.error('Vui lòng nhập cả Vĩ độ (Latitude) và Kinh độ (Longitude) hoặc để trống');
      return;
    }

    setIsSubmitting(true);
    try {
      if (address) {
        await accountAddressApi.update(accountId, address.id, address.version, {
          addressType: addrType,
          addressLine1: trimmedLine1 || null,
          addressLine2: addrLine2.trim() || null,
          locality: trimmedLocality || null,
          administrativeArea: trimmedAdminArea || null,
          postalCode: trimmedPostal || null,
          countryCode: addrCountryCode.trim().toUpperCase(),
          latitude: latNum,
          longitude: lngNum,
          formattedAddress: finalFormatted,
          isPrimary: addrIsPrimary,
          validFrom: addrValidFrom || null,
        });
        toast.success('Đã cập nhật thông tin địa chỉ thành công!');
      } else {
        await accountAddressApi.create(accountId, {
          addressType: addrType,
          addressLine1: trimmedLine1 || null,
          addressLine2: addrLine2.trim() || null,
          locality: trimmedLocality || null,
          administrativeArea: trimmedAdminArea || null,
          postalCode: trimmedPostal || null,
          countryCode: addrCountryCode.trim().toUpperCase(),
          latitude: latNum,
          longitude: lngNum,
          formattedAddress: finalFormatted,
          isPrimary: addrIsPrimary,
          validFrom: addrValidFrom || null,
        });
        toast.success('Đã thêm địa chỉ mới cho khách hàng thành công!');
      }
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Không thể lưu thông tin địa chỉ'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-white p-0 gap-0 overflow-hidden font-sans border-slate-200 shadow-xl rounded-2xl">
        {/* Header */}
        <DialogHeader className="p-5 pb-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center shadow-2xs shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                {address ? 'Chỉnh sửa Địa chỉ' : 'Thêm Địa chỉ mới'}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Thiết lập địa chỉ trụ sở, văn phòng, giao hàng hoặc xuất hóa đơn
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Nhóm 1: Loại địa chỉ & Quốc gia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 text-xs">
                Loại địa chỉ <span className="text-red-500">*</span>
              </Label>
              <SearchableSelect
                placeholder="Chọn loại địa chỉ..."
                searchPlaceholder="Tìm kiếm..."
                value={addrType}
                onValueChange={(v) => setAddrType(v as AccountAddressType)}
                options={ADDRESS_TYPE_OPTIONS}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 text-xs">
                Quốc gia <span className="text-red-500">*</span>
              </Label>
              <SearchableSelect
                placeholder="Chọn quốc gia..."
                searchPlaceholder="Tìm quốc gia..."
                value={addrCountryCode}
                onValueChange={(v) => setAddrCountryCode(v)}
                options={COUNTRY_OPTIONS}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Nhóm 2: Thông tin Địa chỉ Chi tiết */}
          <div className="space-y-3.5 pt-1">
            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 text-xs">
                Số nhà, tên đường <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="VD: 72 Phạm Hùng, Tòa nhà Keangnam Landmark"
                value={addrLine1}
                onChange={(e) => setAddrLine1(e.target.value)}
                className="h-9 text-xs bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">
                  Quận / Huyện <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="VD: Nam Từ Liêm"
                  value={addrLocality}
                  onChange={(e) => setAddrLocality(e.target.value)}
                  className="h-9 text-xs bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">
                  Tỉnh / Thành phố <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="VD: Hà Nội"
                  value={addrAdminArea}
                  onChange={(e) => setAddrAdminArea(e.target.value)}
                  className="h-9 text-xs bg-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Checkbox Đặt làm địa chỉ chính */}
          <div className="pt-2 flex items-center space-x-2 border-t border-slate-100">
            <Checkbox
              id="dialogAddrPrimary"
              checked={addrIsPrimary}
              onCheckedChange={(c) => setAddrIsPrimary(Boolean(c))}
            />
            <Label
              htmlFor="dialogAddrPrimary"
              className="text-xs font-semibold text-slate-700 cursor-pointer select-none"
            >
              Đặt làm Địa chỉ Chính cho loại hình này
            </Label>
          </div>

          {/* Toggle Tùy chọn nâng cao */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 py-1 focus:outline-none"
            >
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showAdvanced ? 'Thu gọn tùy chọn nâng cao' : 'Tùy chọn nâng cao (Tòa nhà, Mã bưu chính, Ngày hiệu lực, GPS)'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 animate-in fade-in-50 duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700 text-xs">
                      Tòa nhà, Tầng, Phòng (Tùy chọn)
                    </Label>
                    <Input
                      placeholder="VD: Tháp A, Tầng 12, P.1205"
                      value={addrLine2}
                      onChange={(e) => setAddrLine2(e.target.value)}
                      className="h-8 text-xs bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700 text-xs">
                      Mã Bưu chính (Zip code)
                    </Label>
                    <Input
                      placeholder="VD: 100000"
                      value={addrPostalCode}
                      onChange={(e) => setAddrPostalCode(e.target.value)}
                      className="h-8 text-xs bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-700 text-xs">
                    Địa chỉ hiển thị tùy chỉnh (Ghi đè)
                  </Label>
                  <Input
                    placeholder="Để trống nếu muốn tự động ghép từ các mục trên..."
                    value={addrFormatted}
                    onChange={(e) => setAddrFormatted(e.target.value)}
                    className="h-8 text-xs bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-200/60">
                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700 text-xs flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Ngày bắt đầu</span>
                    </Label>
                    <DatePicker
                      value={addrValidFrom}
                      onChange={setAddrValidFrom}
                      placeholder="Chọn ngày..."
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700 text-xs flex items-center gap-1">
                      <Compass className="w-3 h-3 text-slate-400" />
                      <span>Vĩ độ (Lat)</span>
                    </Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="VD: 21.0169"
                      value={addrLatitude}
                      onChange={(e) => setAddrLatitude(e.target.value)}
                      className="h-8 text-xs bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700 text-xs flex items-center gap-1">
                      <Compass className="w-3 h-3 text-slate-400" />
                      <span>Kinh độ (Lng)</span>
                    </Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="VD: 105.7839"
                      value={addrLongitude}
                      onChange={(e) => setAddrLongitude(e.target.value)}
                      className="h-8 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-9 text-xs font-semibold px-4"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 gap-1.5 shadow-2xs"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{address ? 'Lưu Thay đổi' : 'Tạo Địa chỉ'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
