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
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
} from 'lucide-react';
import { NAVIGATION_GROUPS } from '@/config/navigationConfig';
import { useAuth } from '@/core/session/useAuth';
import { canAccessRoute } from '@/core/permissions/evaluator';
import { NavigationItem } from '@/types/navigation';
import { useTranslation } from 'react-i18next';

// Icon Map for dynamic icon rendering
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
};

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onMobileClose,
}) => {
  const { session } = useAuth();
  const { i18n } = useTranslation();
  const isVi = !i18n.language || i18n.language.startsWith('vi');

  const renderNavItem = (item: NavigationItem) => {
    if (!canAccessRoute(item, session)) return null;

    const Icon = ICON_MAP[item.iconName] || Layers;
    const title = isVi ? item.titleVi : item.titleEn;

    return (
      <NavLink
        key={item.id}
        to={item.path}
        onClick={onMobileClose}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive
              ? 'bg-blue-50 text-blue-700 font-semibold'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`
        }
        title={collapsed ? title : undefined}
      >
        <Icon className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-slate-700" />
        {!collapsed && <span className="truncate">{title}</span>}
      </NavLink>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Header / Brand */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200">
        <NavLink to="/app/overview" className="flex items-center gap-2 font-bold text-slate-900">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-base font-extrabold tracking-wider">
            VUM
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight text-slate-900">
              VUM <span className="text-blue-600 text-xs font-semibold uppercase ml-1">CRM</span>
            </span>
          )}
        </NavLink>

        {/* Mobile Close Button */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="md:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Desktop Collapse Toggle */}
        {!onMobileClose && (
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
            aria-label="Toggle sidebar collapse"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {NAVIGATION_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) => canAccessRoute(item, session));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.id} className="space-y-1">
              {!collapsed && (
                <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  {isVi ? group.titleVi : group.titleEn}
                </h3>
              )}
              {visibleItems.map(renderNavItem)}
            </div>
          );
        })}
      </div>

      {/* Footer info */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex items-center justify-between">
          <span>VUM Foundation v1.0</span>
          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">Mock</span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block h-screen sticky top-0 transition-all duration-200 ease-in-out shrink-0 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sheet / Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          <div className="relative w-72 max-w-full h-full z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
