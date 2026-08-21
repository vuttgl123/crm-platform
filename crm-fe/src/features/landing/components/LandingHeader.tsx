import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useAuth } from '@/core/session/useAuth';
import { Button } from '@/components/ui/button';

export const LandingHeader: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { key: 'features', label: t('landing.nav.features'), to: '/features' },
    { key: 'solutions', label: t('landing.nav.solutions'), to: '/solutions' },
    { key: 'pricing', label: t('landing.nav.pricing'), to: '/pricing' },
  ] as const;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#DCE5F0]">
      <div className="landing-container">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo / Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            aria-label="VUM CRM Home"
          >
            <div className="w-9 h-9 rounded-lg bg-[#07182B] flex items-center justify-center text-white shadow-sm group-hover:bg-[#085AC0] transition-colors">
              <span className="font-extrabold text-lg tracking-tight" translate="no">
                V
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-[#07182B] leading-none" translate="no">
                VUM CRM
              </span>
              <span className="text-[10px] font-semibold text-[#52647A] tracking-wider uppercase mt-0.5">
                Enterprise
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.key}
                  to={item.to}
                  aria-current={isActive ? 'page' : undefined}
                  className={`text-sm font-semibold transition-colors py-2 ${
                    isActive
                      ? 'text-[#085AC0] font-bold'
                      : 'text-[#52647A] hover:text-[#07182B]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Button asChild className="h-10 px-5 bg-[#085AC0] hover:bg-[#06499D] text-white font-semibold text-sm shadow-sm transition-colors">
                <Link to="/app/overview">
                  <span>{t('landing.nav.workspace')}</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="h-10 px-4 text-[#07182B] hover:text-[#085AC0] hover:bg-[#EAF2FC] font-semibold text-sm">
                  <Link to="/login">{t('landing.nav.login')}</Link>
                </Button>
                <Button asChild className="h-10 px-5 bg-[#085AC0] hover:bg-[#06499D] text-white font-semibold text-sm shadow-sm transition-colors">
                  <Link to="/demo">
                    <span>{t('landing.nav.demo')}</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-[#07182B] hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-expanded={mobileMenuOpen}
              aria-controls="landing-mobile-nav"
              aria-label={
                mobileMenuOpen
                  ? t('landing.nav.closeMenu')
                  : t('landing.nav.openMenu')
              }
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="landing-mobile-nav"
          className="md:hidden border-t border-[#DCE5F0] bg-white px-4 pt-4 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200"
        >
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.key}
                  to={item.to}
                  aria-current={isActive ? 'page' : undefined}
                  className={`block px-3 py-3 rounded-lg text-base font-semibold min-h-[44px] flex items-center ${
                    isActive
                      ? 'bg-[#EAF2FC] text-[#085AC0] font-bold'
                      : 'text-[#07182B] hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            {isAuthenticated ? (
              <Button asChild className="w-full h-11 bg-[#085AC0] hover:bg-[#06499D] text-white font-semibold justify-center text-base">
                <Link to="/app/overview">
                  <span>{t('landing.nav.workspace')}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild className="w-full h-11 bg-[#085AC0] hover:bg-[#06499D] text-white font-semibold justify-center text-base">
                  <Link to="/demo">
                    <span>{t('landing.nav.demo')}</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full h-11 border-slate-200 text-[#07182B] font-semibold justify-center text-base">
                  <Link to="/login">{t('landing.nav.login')}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingHeader;
