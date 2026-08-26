/* global IntersectionObserver, HTMLAnchorElement, ScrollBehavior */
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useAuth } from '@/core/session/useAuth';
import { Button } from '@/components/ui/button';
import { useScrolled } from '../hooks/useScrolled';

export const LandingHeader: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const scrolled = useScrolled(8);

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
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 pt-4 px-4 sm:px-6">
      {/* Google Stitch Floating Glassmorphic Pill */}
      <div className="landing-container max-w-6xl mx-auto flex items-center justify-between px-6 py-2.5 rounded-full lp-stitch-nav-pill">
        {/* Logo Branding */}
        <Link
          to="/"
          onClick={(e) => {
            if (location.pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: getScrollBehavior() });
              setActiveSection('hero');
            }
          }}
          className="flex items-center gap-3 group"
          aria-label="VUM CRM Home"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-transform group-hover:scale-105">
            <span className="font-black text-sm tracking-tight font-mono" translate="no">
              V
            </span>
          </div>
          <span className="font-extrabold text-base tracking-tight text-white font-mono" translate="no">
            VUM CRM
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Main Navigation">
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
                className={`text-xs font-semibold tracking-wide transition-all ${
                  isSectionActive
                    ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                    : 'text-slate-400 hover:text-white hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]'
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
            <Button asChild className="h-9 px-5 lp-btn-stitch text-white font-extrabold uppercase tracking-wider text-xs rounded-full">
              <Link to="/app/overview">
                <span>{t('landing.nav.workspace')}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild className="h-9 px-4 text-slate-300 hover:text-white hover:bg-white/5 font-bold text-xs rounded-full">
                <Link to="/login">{t('landing.nav.login')}</Link>
              </Button>
              <Button asChild className="h-9 px-6 lp-btn-stitch font-extrabold uppercase tracking-wider text-xs rounded-full">
                <a href="#demo" onClick={(e) => handleNavClick(e, '#demo', '/demo')}>
                  <span>{t('landing.nav.demo')}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-cyan-200" />
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
            className="p-2 text-slate-300 hover:text-white"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? t('landing.nav.closeMenu') : t('landing.nav.openMenu')}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 rounded-2xl border border-slate-800 bg-slate-950/95 p-5 shadow-2xl backdrop-blur-2xl">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.anchor}
                onClick={(e) => handleNavClick(e, item.anchor, item.to)}
                className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:bg-slate-900 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default LandingHeader;
