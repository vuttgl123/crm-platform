import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from './sections/Header';
import { Footer } from './sections/Footer';
import './landing.css';

export const LandingLayout: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  // Smooth scroll to top on route change or to hash anchor
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, location.hash]);

  return (
    <div className="editorial-theme min-h-screen flex flex-col bg-[#FFFFFF] text-[#1C1917] w-full">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#1D4ED8] focus:text-white focus:rounded-[8px] focus:text-sm focus:font-medium"
      >
        {t('landing.common.skipToContent', 'Chuyển đến nội dung chính')}
      </a>
      <Header />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 w-full editorial-page-transition"
        key={location.pathname}
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default LandingLayout;
