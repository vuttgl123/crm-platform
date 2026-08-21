import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/core/session/useAuth';
import { resolveAppRoute } from '@/core/navigation/routeResolver';
import { NAVIGATION_GROUP_DEFINITIONS } from '@/config/navigationConfig';
import { DEMO_ROLES } from '@/mocks/fixtures/demoData';
import { DemoRoleCode } from '@/types/auth';
import { env } from '@/config/env';
import {
  Search,
  LogOut,
  User,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onOpenCommandPalette?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCommandPalette }) => {
  const { t } = useTranslation();
  const { session, logout, switchDemoRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const manifestItem = useMemo(() => resolveAppRoute(location.pathname), [location.pathname]);

  const currentGroup = useMemo(() => {
    if (!manifestItem?.groupId) return null;
    return NAVIGATION_GROUP_DEFINITIONS.find((g) => g.id === manifestItem.groupId);
  }, [manifestItem]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSwitchDemoRole = async (roleCode: DemoRoleCode) => {
    if (switchDemoRole) {
      await switchDemoRole(roleCode);
    }
  };

  const getScopeBadgeColor = (scope?: string) => {
    switch (scope) {
      case 'TENANT':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'TEAM_TREE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'TEAM':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'OWN':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-xs text-slate-900 flex justify-between items-center px-4 md:px-6 h-14 sticky top-0 z-30 border-b border-slate-200/80 shrink-0 gap-3">
      {/* 1. Left: Sidebar Trigger & Rich Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <SidebarTrigger className="h-8.5 w-8.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors" />

        <div className="h-4 w-px bg-slate-200 hidden sm:block shrink-0" />

        <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
          <Link
            to="/app/overview"
            className="hover:text-slate-900 transition-colors font-medium hidden sm:inline truncate"
            translate="no"
          >
            VUM CRM
          </Link>

          {currentGroup && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 hidden md:inline shrink-0" />
              <span className="text-slate-400 font-normal hidden md:inline truncate">
                {t(currentGroup.titleKey)}
              </span>
            </>
          )}

          <ChevronRight className="h-3.5 w-3.5 text-slate-300 hidden sm:inline shrink-0" />

          <span className="font-semibold text-slate-900 text-sm truncate">
            {manifestItem ? t(manifestItem.titleKey) : t('nav.overview', 'Tổng quan')}
          </span>
        </nav>
      </div>

      {/* 2. Right: Global Search, Demo Switcher, Language & Account */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Command Palette Trigger */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 h-8.5 px-3 rounded-lg border border-slate-200/90 bg-slate-50/80 hover:bg-slate-100 text-slate-500 hover:text-slate-800 text-xs w-36 sm:w-48 md:w-56 transition-all focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 shadow-2xs"
          aria-label={t('common.searchPlaceholder', 'Tìm nhanh (Ctrl+K)...')}
        >
          <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="flex-1 text-left truncate text-slate-400 font-normal">
            {t('common.search', 'Tìm kiếm...')}
          </span>
          <kbd className="hidden sm:inline-flex h-4.5 items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400 shadow-2xs">
            <span>⌘</span>K
          </kbd>
        </button>

        {/* Demo Role Switcher (Mock Mode only) */}
        {env.useMocks && env.enableRoleSwitcher && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="h-8.5 px-2.5 rounded-lg border border-amber-200/90 bg-amber-50/80 hover:bg-amber-100/80 text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
                aria-label="Đổi vai trò thử nghiệm"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span className="hidden lg:inline font-medium">
                  {session?.activeRole?.name || 'Admin'}
                </span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-amber-200/70 text-amber-900 border border-amber-300/60 font-bold">
                  {session?.effectiveScopeType || 'TENANT'}
                </span>
                <ChevronDown className="h-3 w-3 text-amber-600 shrink-0 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-1.5">
              <DropdownMenuLabel className="px-2 py-1 text-xs text-slate-500 font-medium">
                ⚡ Switch Demo Role (Mock Mode)
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.values(DEMO_ROLES).map((role) => {
                const isCurrent = session?.activeRole?.role_code === role.code;
                return (
                  <DropdownMenuItem
                    key={role.code}
                    onClick={() => handleSwitchDemoRole(role.code)}
                    className={cn(
                      "flex flex-col items-start px-2.5 py-2 rounded-md cursor-pointer transition-colors",
                      isCurrent ? "bg-slate-100 font-semibold" : "hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs text-slate-900 font-medium">{role.nameEn || role.nameVi}</span>
                      <span className={cn("text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border", getScopeBadgeColor(role.scopeType))}>
                        {role.scopeType}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-normal line-clamp-1 mt-0.5">
                      {role.descriptionEn || role.descriptionVi}
                    </span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Account Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 h-8.5 pl-1 pr-2 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all ml-0.5"
            >
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                {session?.user?.display_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:inline text-xs font-medium text-slate-800 max-w-[90px] truncate">
                {session?.user?.display_name || t('common.profile', 'Account')}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400 shrink-0 hidden sm:inline" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-1.5">
            <DropdownMenuLabel className="p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none text-slate-900">
                  {session?.user?.display_name}
                </p>
                <p className="text-xs text-slate-500 truncate">{session?.user?.email}</p>
                <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-700">
                    {session?.activeRole?.name || 'User'}
                  </span>
                  <span className={cn("text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ml-auto", getScopeBadgeColor(session?.effectiveScopeType))}>
                    {session?.effectiveScopeType || 'OWN'}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate('/app/profile')}
              className="px-2.5 py-2 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900"
            >
              <User className="mr-2 h-4 w-4 text-slate-400" />
              <span>{t('common.profile', 'Thông tin cá nhân')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/app/platform/settings')}
              className="px-2.5 py-2 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900"
            >
              <Settings className="mr-2 h-4 w-4 text-slate-400" />
              <span>{t('common.settings', 'Cài đặt')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="px-2.5 py-2 cursor-pointer text-xs font-medium text-rose-600 focus:bg-rose-50 focus:text-rose-700"
            >
              <LogOut className="mr-2 h-4 w-4 text-rose-500" />
              <span>{t('common.logout', 'Đăng xuất')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
