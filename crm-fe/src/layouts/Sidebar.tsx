import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Building2,
  Users,
  UserPlus,
  TrendingUp,
  Calendar,
  FileText,
  ShoppingCart,
  FileSignature,
  FolderTree,
  Package,
  Tag,
  LifeBuoy,
  Megaphone,
  ShieldCheck,
  Archive,
  UserCheck,
  Lock,
  Link as LinkIcon,
  Send,
  Webhook,
  Upload,
  ClipboardList,
  Eye,
  User,
  Network,
  Shield,
  Settings,
  Layers,
  Workflow,
  BarChart3,
} from 'lucide-react';
import { NAVIGATION_GROUPS } from '@/config/navigationConfig';
import { useAuth } from '@/core/session/useAuth';
import { canAccessRoute } from '@/core/permissions/evaluator';
import { NavigationItem } from '@/types/navigation';
import { useTranslation } from 'react-i18next';

const ICON_MAP: Record<string, React.ElementType> = {
  Building2,
  Users,
  UserPlus,
  TrendingUp,
  Calendar,
  FileText,
  ShoppingCart,
  FileSignature,
  FolderTree,
  Package,
  Tag,
  LifeBuoy,
  Megaphone,
  ShieldCheck,
  Archive,
  UserCheck,
  Lock,
  Link: LinkIcon,
  Send,
  Webhook,
  Upload,
  ClipboardList,
  Eye,
  User,
  Network,
  Shield,
  Settings,
  Workflow,
  BarChart3,
};

export const Sidebar: React.FC = () => {
  const { session } = useAuth();
  const { i18n } = useTranslation();
  const isVi = !i18n.language || i18n.language.startsWith('vi');

  const tenantName = session?.tenant?.display_name || 'Tập đoàn IPA';
  const roleName = session?.activeRole?.name || (session?.membership?.is_tenant_admin ? 'Quản trị viên' : 'Thành viên');

  return (
    <aside className="w-64 h-screen sticky top-0 bg-[#FAFBFC] border-r border-slate-200 flex flex-col shrink-0 font-sans z-20 select-none">
      {/* Jira Workspace / Project Header */}
      <div className="h-13 flex items-center px-3.5 border-b border-slate-200 shrink-0 bg-white">
        <NavLink to="/app/overview" className="flex items-center gap-2.5 w-full group">
          <div className="w-7 h-7 rounded-[4px] bg-[#0C66E4] flex items-center justify-center text-white text-[11px] font-bold tracking-wider shrink-0 shadow-none">
            IPA
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-slate-900 truncate group-hover:text-[#0C66E4] transition-colors leading-tight">
              {tenantName}
            </div>
            <div className="text-[11px] text-slate-500 font-normal truncate mt-0.5">
              Hệ thống CRM Doanh nghiệp
            </div>
          </div>
        </NavLink>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-3.5 custom-scrollbar">
        {NAVIGATION_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) => canAccessRoute(item, session));
          if (visibleItems.length === 0) return null;

          const groupTitle = isVi ? group.titleVi : group.titleEn;

          return (
            <div key={group.id} className="space-y-0.5">
              {/* Group Section Heading */}
              <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {groupTitle}
              </div>

              {/* Items List */}
              <div className="space-y-0.5">
                {visibleItems.map((item: NavigationItem) => {
                  const Icon = ICON_MAP[item.iconName] || Layers;
                  const itemTitle = isVi ? item.titleVi : item.titleEn;

                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-2.5 py-1.5 rounded-[4px] text-[13px] font-medium transition-colors group ${
                          isActive
                            ? 'bg-[#E9F2FF] text-[#0C66E4] font-semibold'
                            : 'text-slate-700 hover:bg-slate-200/50 hover:text-slate-900'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive ? 'text-[#0C66E4]' : 'text-slate-400 group-hover:text-slate-600'
                            }`}
                            strokeWidth={isActive ? 2.2 : 1.8}
                          />
                          <span className="truncate">{itemTitle}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Workspace Footer Info */}
      <div className="px-3.5 py-2.5 border-t border-slate-200 bg-white text-xs text-slate-500 shrink-0">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
          <span className="text-slate-400 font-mono text-[10px]">{roleName}</span>
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-bold px-1.5 py-0.5 rounded-[3px]">
            <span className="w-1 h-1 rounded-full bg-emerald-500" />
            Online
          </span>
        </div>
      </div>
    </aside>
  );
};
