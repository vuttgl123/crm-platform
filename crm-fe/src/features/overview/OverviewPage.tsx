import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { useAuth } from '@/core/session/useAuth';
import { NAVIGATION_GROUPS } from '@/config/navigationConfig';
import { canAccessRoute } from '@/core/permissions/evaluator';
import {
  Building,
  Shield,
  Layers,
  Users,
  Info,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const OverviewPage: React.FC = () => {
  const { session } = useAuth();
  const { i18n, t } = useTranslation();
  const isVi = !i18n.language || i18n.language.startsWith('vi');

  if (!session) return null;

  const activeRoleName = session.activeRole.name;
  const scopeType = session.effectiveScopeType;

  const scopeDescMap: Record<string, string> = {
    TENANT: t('overview.dataScopeDesc.TENANT', 'Truy cập toàn bộ dữ liệu tổ chức (TENANT scope)'),
    TEAM_TREE: t('overview.dataScopeDesc.TEAM_TREE', 'Truy cập dữ liệu nhóm hiện tại và các nhóm con (TEAM_TREE scope)'),
    TEAM: t('overview.dataScopeDesc.TEAM', 'Truy cập dữ liệu trong nhóm hiện tại (TEAM scope)'),
    OWN: t('overview.dataScopeDesc.OWN', 'Chỉ truy cập dữ liệu do cá nhân tạo hoặc phụ trách (OWN scope)'),
  };

  // Collect authorized quick links
  const authorizedItems: { path: string; title: string; groupTitle: string }[] = [];
  NAVIGATION_GROUPS.forEach((group) => {
    group.items.forEach((item) => {
      if (canAccessRoute(item, session)) {
        authorizedItems.push({
          path: item.path,
          title: isVi ? item.titleVi : item.titleEn,
          groupTitle: isVi ? group.titleVi : group.titleEn,
        });
      }
    });
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${t('overview.welcome', 'Xin chào')}, ${session.user.display_name}!`}
        description={t('overview.dashboardSubtitle', 'Chào mừng bạn quay trở lại với nền tảng quản trị VUM CRM')}
        badge={
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Sparkles className="w-3.5 h-3.5" />
            {activeRoleName}
          </span>
        }
      />

      {/* Active Session Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tenant Info */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex items-start gap-4">
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600 shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t('common.tenant', 'Tổ chức')}
            </div>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              {session.tenant.display_name}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              Code: {session.tenant.tenant_code} ({session.tenant.default_currency_code})
            </div>
          </div>
        </div>

        {/* Role & Permission Info */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex items-start gap-4">
          <div className="p-3 rounded-lg bg-purple-50 text-purple-600 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t('common.role', 'Vai trò & Phân quyền')}
            </div>
            <div className="text-base font-bold text-slate-900 mt-0.5">{activeRoleName}</div>
            <div className="text-xs text-slate-500 mt-1">
              {session.grantedPermissions.length} quyền đã cấp
            </div>
          </div>
        </div>

        {/* Data Scope Info */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex items-start gap-4">
          <div className="p-3 rounded-lg bg-amber-50 text-amber-600 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t('common.scope', 'Phạm vi Dữ liệu')}
            </div>
            <div className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-2">
              <span>{scopeType}</span>
              {session.assignedTeam && (
                <span className="text-xs font-normal text-slate-500 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {session.assignedTeam.name}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-1 leading-snug">
              {scopeDescMap[scopeType] || scopeType}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Links */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
        <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <span>{t('overview.quickNavTitle', 'Lối truy cập nhanh theo phân quyền')}</span>
          <span className="text-xs font-normal text-slate-400">({authorizedItems.length} chức năng)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {authorizedItems.slice(0, 9).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="p-3 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 rounded-lg transition-colors group flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600">
                  {item.title}
                </div>
                <div className="text-xs text-slate-500">{item.groupTitle}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ))}
        </div>
      </div>

      {/* Foundation Mock Service Notice */}
      <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 text-xs text-slate-600 flex items-start gap-3">
        <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-slate-800 mb-0.5">
            Thông tin Nền tảng Frontend VUM CRM
          </h4>
          <p>
            Đây là phiên bản nền tảng SPA (Frontend Foundation) đáp ứng các yêu cầu bảo mật, xác thực, phân quyền 
            RBAC và giới hạn phạm vi dữ liệu (Data Scope) chuẩn định dạng schema SQL. Các chức năng chi tiết 
            thuộc từng phân hệ hiển thị dưới dạng các trang &ldquo;Sắp ra mắt&rdquo; tương ứng.
          </p>
        </div>
      </div>
    </div>
  );
};
