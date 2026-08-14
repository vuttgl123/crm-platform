import { Badge } from '@/components/ui/badge';
import { AccountLifecycleStage, AccountType } from '@/services/api/accountApi';
import { Building, GitCommit } from 'lucide-react';

/**
 * System-Wide Color Palette & Badge Configuration for CRM Entities
 */

export interface StatusBadgeConfig {
  label: string;
  className: string;
  priorityLevel: number; // 1 = Highest Priority (Customer), 5 = Lowest
}

export const LifecycleStageConfigMap: Record<AccountLifecycleStage, StatusBadgeConfig> = {
  PROSPECT: {
    label: 'Tiềm năng',
    className: 'bg-purple-50 text-purple-700 border-purple-200 font-bold',
    priorityLevel: 3,
  },
  QUALIFIED: {
    label: 'Đạt chuẩn',
    className: 'bg-blue-50 text-blue-700 border-blue-200 font-bold',
    priorityLevel: 2,
  },
  CUSTOMER: {
    label: 'Khách hàng chính thức',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
    priorityLevel: 1,
  },
  INACTIVE: {
    label: 'Ngừng hoạt động',
    className: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
    priorityLevel: 4,
  },
  CHURNED: {
    label: 'Rời bỏ',
    className: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    priorityLevel: 5,
  },
};

export const AccountTypeConfigMap: Record<AccountType, { label: string; className: string }> = {
  ORGANIZATION: {
    label: 'Doanh nghiệp',
    className: 'bg-blue-50 text-blue-700 border-blue-200 font-bold',
  },
  PERSON: {
    label: 'Cá nhân',
    className: 'bg-slate-100 text-slate-600 border-slate-300 font-semibold',
  },
  PARTNER: {
    label: 'Đối tác chiến lược',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
  },
  RESELLER: {
    label: 'Đại lý ủy quyền',
    className: 'bg-amber-50 text-amber-700 border-amber-200 font-bold',
  },
  SUPPLIER: {
    label: 'Nhà cung cấp',
    className: 'bg-orange-50 text-orange-700 border-orange-200 font-semibold',
  },
};

/** Helper function to render uniform system lifecycle stage badge */
export const renderLifecycleStageBadge = (stage?: AccountLifecycleStage) => {
  if (!stage) return null;
  const config = LifecycleStageConfigMap[stage];
  if (!config) return <Badge variant="outline">{stage}</Badge>;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

/** Helper function to render uniform system account type badge */
export const renderAccountTypeBadge = (type?: AccountType) => {
  if (!type) return null;
  const config = AccountTypeConfigMap[type];
  if (!config) return <Badge variant="outline">{type}</Badge>;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

/** Helper function to render root account badge */
export const renderRootAccountBadge = () => (
  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-bold gap-1 px-2 py-0.5">
    <Building className="w-3 h-3 text-indigo-600" />
    <span>CẤP CAO NHẤT</span>
  </Badge>
);

/** Helper function to render child account count badge */
export const renderChildCountBadge = (count: number) => (
  <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 text-[10px] font-semibold px-2 py-0.5">
    {count} Đơn vị trực thuộc
  </Badge>
);

/** Helper function to render branch/child unit badge */
export const renderBranchUnitBadge = () => (
  <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-[10px] font-medium gap-1 px-2 py-0.5">
    <GitCommit className="w-3 h-3 text-slate-400" />
    <span>Đơn vị trực thuộc</span>
  </Badge>
);
