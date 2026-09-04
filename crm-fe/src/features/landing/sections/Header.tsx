import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { EditorialContainer } from '../components/EditorialContainer';

export const Header: React.FC = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  // Close mobile menu on route change or ESC
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Simple Scroll Spy to highlight active nav link
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['features', 'solutions', 'pricing', 'faq'];
      const scrollPosition = window.scrollY + 100;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            return;
          }
        }
      }
      if (window.scrollY < 200) {
        setActiveSection('');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'features', label: 'Tính năng', href: '#features' },
    { id: 'solutions', label: 'Giải pháp', href: '#solutions' },
    { id: 'pricing', label: 'Bảng giá', href: '#pricing' },
    { id: 'faq', label: 'Tài nguyên', href: '#faq' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full h-16 bg-white/85 backdrop-blur-[12px] border-b border-[#E7E5E4] transition-all">
      <EditorialContainer className="h-full flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="VUM CRM">
            <div className="w-7 h-7 rounded-[6px] bg-[#1C1917] flex items-center justify-center text-[#FAFAF9] font-mono font-semibold text-xs transition-transform duration-150 group-hover:scale-105 group-hover:bg-[#1D4ED8]">
              V
            </div>
            <span className="font-semibold text-[15px] tracking-tight text-[#1C1917] group-hover:text-[#1D4ED8] transition-colors duration-150">
              VUM CRM
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Menu điều hướng chính">
            {navLinks.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-[6px] text-[14px] font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#F5F5F4] text-[#1C1917] font-semibold'
                      : 'text-[#57534E] hover:text-[#1C1917] hover:bg-[#FAFAF9]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            to="/login"
            className="editorial-btn-ghost text-[14px] font-medium text-[#57534E] hover:text-[#1C1917] active:scale-[0.98]"
          >
            Đăng nhập
          </Link>
          <Link
            to="/login"
            className="editorial-btn-primary h-9 px-4 text-[14px] font-medium active:scale-[0.98] shadow-[0_1px_2px_rgba(29,78,216,0.2)]"
          >
            Bắt đầu ngay
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex sm:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-[#57534E] hover:text-[#1C1917] active:scale-95"
            aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </EditorialContainer>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="sm:hidden border-b border-[#E7E5E4] bg-white px-6 py-4 space-y-3 shadow-[0_16px_40px_rgba(28,25,23,0.07)]">
          <nav className="space-y-1">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-[6px] text-[15px] font-medium text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F5F4]"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 border-t border-[#E7E5E4] flex flex-col gap-2">
            <Link
              to="/login"
              className="editorial-btn-secondary w-full text-center"
            >
              Đăng nhập
            </Link>
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="editorial-btn-primary w-full text-center"
            >
              Bắt đầu ngay
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
