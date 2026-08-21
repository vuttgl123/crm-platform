/* global IntersectionObserver, HTMLAnchorElement */
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useAuth } from '@/core/session/useAuth';
import { Button } from '@/components/ui/button';

export const LandingHeader: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');

  const navItems = [
    { key: 'features', label: t('landing.nav.features'), anchor: '#features', to: '/features' },
    { key: 'solutions', label: t('landing.nav.solutions'), anchor: '#solutions', to: '/solutions' },
    { key: 'pricing', label: t('landing.nav.pricing'), anchor: '#pricing', to: '/pricing' },
    { key: 'demo', label: t('landing.nav.demo'), anchor: '#demo', to: '/demo' },
  ] as const;

  const getScrollBehavior = (): ScrollBehavior =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth';

  // Scroll spy on Home page
  useEffect(() => {
    if (location.pathname !== '/') return;

    const sections = ['hero', 'features', 'solutions', 'pricing', 'demo'];
    const observers: IntersectionObserver[] = [];

    sections.forEach((secId) => {
      const el = document.getElementById(secId);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(secId);
            }
          });
        },
        { threshold: 0.25, rootMargin: '-80px 0px -40% 0px' }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [location.pathname]);

  // Handle hash scrolling on page load/change
  useEffect(() => {
    if (location.hash) {
      const target = document.querySelector(location.hash);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: getScrollBehavior(), block: 'start' });
        }, 80);
      }
    }
  }, [location.pathname, location.hash]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    anchor: string,
    to: string
  ) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const target = document.querySelector(anchor);
      if (target) {
        target.scrollIntoView({ behavior: getScrollBehavior(), block: 'start' });
        window.history.pushState(null, '', anchor);
        setActiveSection(anchor.replace('#', ''));
      }
      setMobileMenuOpen(false);
    } else {
      navigate(to);
      setMobileMenuOpen(false);
    }
  };

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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[var(--landing-line)] transition-colors">
      <div className="landing-container">
        <div className="flex items-center justify-between h-16 py-3">
          {/* Logo / Wordmark */}
          <Link
            to="/"
            onClick={() => {
              if (location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: getScrollBehavior() });
              }
            }}
            className="flex items-center gap-2.5 group"
            aria-label="VUM CRM Home"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--landing-ink)] flex items-center justify-center text-white shadow-xs group-hover:bg-[var(--landing-blue)] transition-colors">
              <span className="font-bold text-base tracking-tight" translate="no">
                V
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-[var(--landing-ink)] leading-none" translate="no">
                VUM CRM
              </span>
              <span className="text-[10px] font-bold text-[var(--landing-muted)] tracking-wider uppercase mt-0.5">
                Enterprise
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isSectionActive =
                location.pathname === '/'
                  ? activeSection === item.key
                  : location.pathname === item.to;

              return (
                <a
                  key={item.key}
                  href={item.anchor}
                  onClick={(e) => handleNavClick(e, item.anchor, item.to)}
                  aria-current={isSectionActive ? 'page' : undefined}
                  className={`text-sm font-semibold py-1.5 px-2.5 rounded-lg min-h-[44px] inline-flex items-center transition-colors ${
                    isSectionActive
                      ? 'text-[var(--landing-blue)] font-bold bg-[var(--landing-blue-soft)]'
                      : 'text-[var(--landing-muted)] hover:text-[var(--landing-ink)] hover:bg-[var(--landing-canvas)]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Button asChild className="h-10 px-5 bg-[var(--landing-blue)] hover:bg-[var(--landing-blue-hover)] text-white font-semibold text-sm shadow-xs transition-colors">
                <Link to="/app/overview">
                  <span>{t('landing.nav.workspace')}</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="h-10 px-4 text-[var(--landing-ink)] hover:text-[var(--landing-blue)] hover:bg-[var(--landing-blue-soft)] font-semibold text-sm">
                  <Link to="/login">{t('landing.nav.login')}</Link>
                </Button>
                <Button asChild className="h-10 px-5 bg-[var(--landing-blue)] hover:bg-[var(--landing-blue-hover)] text-white font-semibold text-sm shadow-xs transition-colors">
                  <a href="#demo" onClick={(e) => handleNavClick(e, '#demo', '/demo')}>
                    <span>{t('landing.nav.demo')}</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </a>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-[var(--landing-ink)] hover:bg-[var(--landing-canvas)] min-h-[44px] min-w-[44px] flex items-center justify-center"
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
          className="md:hidden border-t border-[var(--landing-line)] bg-white px-4 pt-4 pb-6 space-y-4 shadow-lg"
        >
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isSectionActive =
                location.pathname === '/'
                  ? activeSection === item.key
                  : location.pathname === item.to;

              return (
                <a
                  key={item.key}
                  href={item.anchor}
                  onClick={(e) => handleNavClick(e, item.anchor, item.to)}
                  className={`block px-3 py-3 rounded-lg text-base font-semibold min-h-[44px] flex items-center ${
                    isSectionActive
                      ? 'bg-[var(--landing-blue-soft)] text-[var(--landing-blue)] font-bold'
                      : 'text-[var(--landing-ink)] hover:bg-[var(--landing-canvas)]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-[var(--landing-line)] flex flex-col gap-2.5">
            {isAuthenticated ? (
              <Button asChild className="w-full h-11 bg-[var(--landing-blue)] hover:bg-[var(--landing-blue-hover)] text-white font-semibold justify-center text-base">
                <Link to="/app/overview">
                  <span>{t('landing.nav.workspace')}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild className="w-full h-11 bg-[var(--landing-blue)] hover:bg-[var(--landing-blue-hover)] text-white font-semibold justify-center text-base">
                  <a href="#demo" onClick={(e) => handleNavClick(e, '#demo', '/demo')}>
                    <span>{t('landing.nav.demo')}</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <Button variant="outline" asChild className="w-full h-11 border-[var(--landing-line)] text-[var(--landing-ink)] font-semibold justify-center text-base">
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
