import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Bell,
  LogOut,
  Shield,
  Globe,
  User,
  Sliders,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/core/session/useAuth';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HeaderProps {
  onOpenCommandPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCommandPalette,
}) => {
  const { session, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Generate breadcrumb path labels
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <TooltipProvider>
      <header className="h-14 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
        {/* Left: Breadcrumbs Navigation */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Breadcrumb */}

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
            <Link to="/app/overview" className="hover:text-blue-600 font-semibold transition-colors">
              VUM CRM
            </Link>
            {pathSegments.map((segment, index) => {
              if (segment === 'app') return null;
              const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
              const isLast = index === pathSegments.length - 1;
              const formatted = segment.charAt(0).toUpperCase() + segment.slice(1);

              return (
                <React.Fragment key={path}>
                  <span className="text-slate-300">/</span>
                  {isLast ? (
                    <span className="font-bold text-slate-900">{formatted}</span>
                  ) : (
                    <Link to={path} className="hover:text-blue-600 transition-colors">
                      {formatted}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Center: Expanded Long Command Palette Search Trigger */}
        <div className="flex-1 max-w-2xl mx-4 sm:mx-8 hidden md:block">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-4 py-1.5 bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200 rounded-lg text-xs text-slate-500 transition-colors shadow-2xs"
          >
            <span className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-slate-400" />
              <span>{t('common.searchPlaceholder', 'Tìm kiếm nhanh chức năng, khách hàng, hợp đồng, báo cáo (Ctrl+K)...')}</span>
            </span>
            <kbd className="px-2 py-0.5 text-[10px] font-mono bg-white border border-slate-300 rounded text-slate-500 font-semibold">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Language Switcher, Notifications & User Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Active Tenant / Organization Badge */}
          {session?.tenant?.display_name && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100/90 border border-slate-200 rounded-md text-xs font-semibold text-slate-800">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span className="max-w-44 truncate">{session.tenant.display_name}</span>
            </div>
          )}

          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenCommandPalette}
            className="md:hidden h-8 w-8 text-slate-500"
            aria-label="Open search"
          >
            <Search className="w-4 h-4" />
          </Button>

          {/* i18n Language Toggle Switcher */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="h-8 px-2.5 text-xs gap-1.5 text-slate-700 bg-slate-50 hover:bg-slate-100 font-semibold border-slate-200"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>{i18n.language && i18n.language.startsWith('en') ? 'EN' : 'VIE'}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Đổi ngôn ngữ (Language)</TooltipContent>
          </Tooltip>

          {/* Notification Center Dropdown Drawer */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 relative text-slate-600">
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Thông báo mới</TooltipContent>
            </Tooltip>

            <DropdownMenuContent align="end" className="w-80 p-0 text-xs">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="font-bold text-slate-900">Thông báo (3 mới)</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                  Tất cả
                </Badge>
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                <div className="p-3 hover:bg-slate-50 transition-colors cursor-pointer space-y-0.5">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Cơ hội MB Bank được cập nhật</span>
                    <span className="text-[10px] text-slate-400">10m</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Đã cập nhật giá trị hợp đồng thành 380tr VNĐ.</p>
                </div>

                <div className="p-3 hover:bg-slate-50 transition-colors cursor-pointer space-y-0.5">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Nhắc nhở cuộc họp Demo</span>
                    <span className="text-[10px] text-slate-400">4h</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Lịch họp demo giải pháp VUM CRM với Tập đoàn Hòa Phát lúc 15:30.</p>
                </div>

                <div className="p-3 hover:bg-slate-50 transition-colors cursor-pointer space-y-0.5">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Lead mới từ Website</span>
                    <span className="text-[10px] text-slate-400">1d</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Thêm mới Khách hàng tiềm năng TH True Milk.</p>
                </div>
              </div>

              <DropdownMenuSeparator className="m-0" />
              <div className="p-2 text-center">
                <Button variant="ghost" size="sm" className="w-full text-[11px] text-blue-600 h-7 font-semibold">
                  Xem tất cả thông báo
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full p-0 hover:ring-2 hover:ring-blue-100 transition-all">
                <Avatar className="h-9 w-9 border border-slate-200">
                  <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                    {getInitials(session?.user.display_name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64 text-xs">
              <DropdownMenuLabel className="font-normal p-3 bg-slate-50/70 border-b border-slate-100">
                <div className="font-bold text-slate-900 truncate">{session?.user.display_name}</div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">{session?.user.email}</div>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 w-fit">
                  <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>
                    {session?.membership.is_tenant_admin
                      ? 'Quản trị viên Tập đoàn (Tenant Admin)'
                      : (session?.activeRole?.name || 'Nhân viên Kinh doanh (Sales)')}
                  </span>
                </div>
              </DropdownMenuLabel>

              <div className="p-1">
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate('/app/profile')}>
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Hồ sơ Cá nhân</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={onOpenCommandPalette}>
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <span>Cài đặt & Menu</span>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator />

              <div className="p-1">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('common.logout', 'Đăng xuất')}</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </TooltipProvider>
  );
};
