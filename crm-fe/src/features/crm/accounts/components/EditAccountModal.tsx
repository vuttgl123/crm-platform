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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Edit3, Loader2, Save, Users } from 'lucide-react';
import { useAuth } from '@/core/session/useAuth';
import { DynamicForm } from '@/components/common/DynamicForm';
import { createAccountFormSchema, AccountFormValues } from '../schemas/accountFormSchema';

interface EditAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: AccountResponse | null;
  allAccounts?: AccountSummaryResponse[];
  onSuccess: () => void;
}

const initialValues: AccountFormValues = {
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
};

export const EditAccountModal: React.FC<EditAccountModalProps> = ({
  open,
  onOpenChange,
  account,
  allAccounts = [],
  onSuccess,
}) => {
  const { session } = useAuth();
  const [formValues, setFormValues] = useState<AccountFormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form when account prop changes
  useEffect(() => {
    if (account) {
      setFormValues({
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
  }, [account]);

  const handleFieldChange = (field: keyof AccountFormValues, value: any) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    if (!formValues.displayName.trim()) {
      toast.error('Vui lòng nhập Tên hiển thị khách hàng');
      return;
    }

    setIsSubmitting(true);

    const payload: UpdateAccountRequest = {
      version: account.version,
      displayName: formValues.displayName.trim(),
      legalName: formValues.legalName.trim() || undefined,
      parentAccountId:
        formValues.parentAccountId && formValues.parentAccountId !== 'NONE'
          ? formValues.parentAccountId
          : undefined,
      accountType: formValues.accountType,
      lifecycleStage: formValues.lifecycleStage,
      taxIdentifier: formValues.taxIdentifier.trim() || undefined,
      registrationNumber: formValues.registrationNumber.trim() || undefined,
      industryCode: formValues.industryCode.trim() || undefined,
      website: formValues.website.trim() || undefined,
      annualRevenue: formValues.revenueAmount
        ? { amount: parseFloat(formValues.revenueAmount), currencyCode: formValues.currencyCode || 'VND' }
        : undefined,
      employeeCount: formValues.employeeCount ? parseInt(formValues.employeeCount, 10) : undefined,
      description: formValues.description.trim() || undefined,
      doNotContact: formValues.doNotContact,
      owner: account.owner ? { type: account.owner.type, id: account.owner.id } : undefined,
    };

    try {
      await accountApi.update(account.id, payload);
      toast.success(`Đã cập nhật thông tin khách hàng "${formValues.displayName}" thành công!`);
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Cập nhật thất bại. Vui lòng kiểm tra lại.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const accountSchema = createAccountFormSchema(allAccounts, account?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden font-sans border-slate-200 shadow-xl">
        <DialogHeader className="p-5 pb-4 border-b border-slate-200 bg-slate-50/90 shrink-0">
          <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-blue-600" />
            <span>Chỉnh sửa Thông tin Khách hàng</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-0.5">
            Cập nhật các thông tin đăng ký doanh nghiệp, khách hàng cha và pháp lý qua Form động
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Read-only Account Number & Owner Info Banner */}
          {account && (
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Mã Khách hàng (Cố định):</span>
                <span className="font-mono font-bold text-blue-700">{account.accountNumber}</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900 block">Quyền phụ trách dữ liệu</span>
                    <span className="text-[11px] text-slate-600">Bảo lưu theo vai trò và quyền hạn hiện tại</span>
                  </div>
                </div>
                {account.owner ? (
                  <Badge
                    variant="outline"
                    className={`font-bold text-[11px] px-2.5 py-1 shrink-0 ${
                      account.owner.type === 'TEAM'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {account.owner.type === 'TEAM'
                      ? '🏢 Nhóm phụ trách'
                      : session?.user && account.owner.id === session.user.id
                      ? `👤 ${session.user.email} (Chính tôi)`
                      : `👤 Cá nhân phụ trách`}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 font-medium text-[11px] px-2.5 py-1 shrink-0">
                    Chưa phân công
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Dynamic Form Engine Renderer */}
          <DynamicForm
            formId="editAccountForm"
            schema={accountSchema}
            values={formValues}
            onChange={handleFieldChange}
            onSubmit={handleSubmit}
            disabled={isSubmitting}
          />
        </div>

        <DialogFooter className="p-4 border-t border-slate-200 bg-slate-50/80 shrink-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="text-xs">
            Hủy
          </Button>
          <Button
            type="submit"
            form="editAccountForm"
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
      </DialogContent>
    </Dialog>
  );
};
