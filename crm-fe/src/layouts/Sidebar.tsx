import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/core/session/useAuth';
import { getAuthorizedNavigationGroups, getAuthorizedPrimaryNavigationItems } from '@/core/navigation/routeResolver';
import { getNavigationIcon } from '@/config/navigationIcons';
import { cn } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const { session } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const primaryItems = getAuthorizedPrimaryNavigationItems(session);
  const groups = getAuthorizedNavigationGroups(session);

  const checkIsActive = (path: string) => {
    if (path === '/app/overview') {
      return location.pathname === '/app/overview' || location.pathname === '/app';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <SidebarPrimitive>
      {/* 1. Header with Brand & Workspace */}
      <SidebarHeader className="h-14 flex items-center px-3.5 border-b border-slate-200/80 shrink-0">
        <div className={cn("flex items-center gap-3 w-full min-w-0", isCollapsed && "justify-center")}>
          <Link
            to="/app/overview"
            className="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center font-black text-sm shadow-xs border border-slate-800 shrink-0 hover:bg-slate-800 transition-colors"
            aria-label="VUM CRM"
          >
            <span translate="no">V</span>
          </Link>

          {!isCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-sm tracking-tight leading-none" translate="no">
                  VUM CRM
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                  Enterprise
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">{session?.tenant?.display_name || t('common.tenant', 'Organization')}</span>
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* 2. Navigation Menu Content */}
      <SidebarContent>
        {primaryItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {primaryItems.map((item) => {
                  const Icon = getNavigationIcon(item.iconName);
                  const isActive = checkIsActive(item.path);
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={t(item.titleKey)}>
                        <Link to={item.path} className="flex items-center gap-3">
                          <Icon className={cn("shrink-0", isActive ? "text-blue-700" : "text-slate-500")} />
                          <span className="truncate">{t(item.titleKey)}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {groups.map((group) => (
          <SidebarGroup key={group.id}>
            <SidebarGroupLabel>{t(group.titleKey)}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = getNavigationIcon(item.iconName);
                  const isActive = checkIsActive(item.path);
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={t(item.titleKey)}>
                        <Link to={item.path} className="flex items-center gap-3">
                          <Icon className={cn("shrink-0", isActive ? "text-blue-700" : "text-slate-500")} />
                          <span className="truncate">{t(item.titleKey)}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </SidebarPrimitive>
  );
};
