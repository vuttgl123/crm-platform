import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Bell,
  LogOut,
  Shield,
  Globe,
  User,
  Sliders,
  Building2,
  CheckCheck,
  Sparkles,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/core/session/useAuth';
import { useTranslation } from 'react-i18next';
import { notificationApi, NotificationItem } from '@/services/api/notificationApi';
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

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchNotifications = async () => {
    try {
      const [list, countRes] = await Promise.all([
        notificationApi.list(),
        notificationApi.getUnreadCount(),
      ]);
      setNotifications(list);
      setUnreadCount(countRes.unreadCount);
    } catch {
      // Graceful fallback
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      await notificationApi.markAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
  };

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
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Thông báo hệ thống</TooltipContent>
            </Tooltip>

            <DropdownMenuContent align="end" className="w-88 p-0 text-xs shadow-xl border-slate-200 rounded-xl overflow-hidden font-sans">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">Thông báo Hệ thống</span>
                  {unreadCount > 0 ? (
                    <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold px-1.5 py-0">
                      {unreadCount} mới
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-[10px]">
                      0 mới
                    </Badge>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Đọc tất cả</span>
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                    <Bell className="w-5 h-5 opacity-60" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">Không có thông báo mới</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Bạn đã xem hết tất cả thông báo và cập nhật trong hệ thống.</p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-2.5 ${
                        !n.isRead ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.priority === 'URGENT' || n.category === 'SLA_BREACH' ? (
                          <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                        ) : n.category === 'DEAL_WON' ? (
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Bell className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={`text-xs truncate ${!n.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                            {n.title}
                          </h4>
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                          {n.message}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 font-mono">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{n.createdAt}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
