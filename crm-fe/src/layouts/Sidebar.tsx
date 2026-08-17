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

  return (
    <aside className="w-64 h-screen sticky top-0 bg-white border-r border-slate-200 flex flex-col shrink-0 font-sans shadow-2xs">
      {/* Brand Header */}
      <div className="h-14 flex items-center px-4 border-b border-slate-200 shrink-0">
        <NavLink to="/app/overview" className="flex items-center gap-2.5 font-bold text-slate-900">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-black tracking-wider shadow-xs shrink-0">
            VUM
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900 truncate">
            VUM <span className="text-blue-600 text-xs font-bold uppercase ml-0.5">CRM</span>
          </span>
        </NavLink>
      </div>

      {/* Navigation Groups - Fixed & Clean */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {NAVIGATION_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) => canAccessRoute(item, session));
          if (visibleItems.length === 0) return null;

          const groupTitle = isVi ? group.titleVi : group.titleEn;

          return (
            <div key={group.id} className="space-y-1">
              {/* Group Section Heading */}
              <div className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none">
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
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all group ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs font-bold'
                            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                            }`}
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

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/70 text-xs text-slate-500 shrink-0">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
          <span>VUM CRM v1.0</span>
          <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-bold text-[10px]">Active</span>
        </div>
      </div>
    </aside>
  );
};
