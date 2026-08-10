import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  LogOut,
  Shield,
  Building,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/core/session/useAuth';
import { DemoRoleCode } from '@/types/auth';
import { DEMO_ROLES } from '@/mocks/fixtures/demoData';
import { env } from '@/config/env';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  onMobileMenuOpen: () => void;
  onOpenCommandPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onMobileMenuOpen,
  onOpenCommandPalette,
}) => {
  const { session, logout, switchDemoRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Generate breadcrumb path labels
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const handleRoleChange = async (roleCode: DemoRoleCode) => {
    setIsRoleMenuOpen(false);
    await switchDemoRole(roleCode);
    navigate('/app/overview');
  };

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4">
      {/* Left: Mobile Toggle + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuOpen}
          className="md:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
          <Link to="/app/overview" className="hover:text-blue-600 font-medium">
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
                  <span className="font-semibold text-slate-800">{formatted}</span>
                ) : (
                  <Link to={path} className="hover:text-blue-600">
                    {formatted}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-lg text-xs text-slate-500 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('common.searchPlaceholder', 'Tìm kiếm chức năng, menu (Ctrl+K)...')}</span>
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-300 rounded text-slate-500">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Tenant, Demo Role Switcher, Notifications, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Mobile Search Button Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="md:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          aria-label="Open search"
        >
          <Search className="w-4 h-4" />
        </button>
        {/* Tenant Display Badge */}
        {session?.tenant && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-700">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            <span className="max-w-[140px] truncate">{session.tenant.display_name}</span>
          </div>
        )}

        {/* Demo Role Switcher (if enabled) */}
        {env.enableRoleSwitcher && (
          <div className="relative">
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold border border-blue-200 transition-colors"
              title="Chuyển đổi demo role để kiểm thử phân quyền"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">{session?.activeRole.name || 'Demo Role'}</span>
              <ChevronDown className="w-3 h-3 text-blue-500" />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-40">
                <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Chuyển đổi Demo Role (Mock RBAC)
                </div>
                {(Object.keys(DEMO_ROLES) as DemoRoleCode[]).map((code) => {
                  const r = DEMO_ROLES[code];
                  const isSelected = session?.activeRole.role_code === code;
                  return (
                    <button
                      key={code}
                      onClick={() => handleRoleChange(code)}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between ${
                        isSelected ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <div>{r.nameVi}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Scope: {r.scopeType}</div>
                      </div>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-lg p-4 z-40 text-center">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                <Bell className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900">Không có thông báo mới</h4>
              <p className="text-xs text-slate-500 mt-1">
                Các thông báo tự động và nhắc nhở công việc sẽ xuất hiện tại đây khi hoạt động.
              </p>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="User profile menu"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center">
              {session?.user.display_name ? session.user.display_name.charAt(0).toUpperCase() : 'U'}
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-40">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900 truncate">{session?.user.display_name}</p>
                <p className="text-xs text-slate-500 truncate">{session?.user.email}</p>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-blue-700 font-medium bg-blue-50 px-2 py-0.5 rounded w-fit">
                  <Shield className="w-3 h-3" />
                  <span>{session?.activeRole.name}</span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {t('common.logout', 'Đăng xuất')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
