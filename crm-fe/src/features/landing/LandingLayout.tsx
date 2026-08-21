import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LandingHeader } from './components/LandingHeader';
import { LandingFooter } from './components/LandingFooter';
import './landing.css';

export const LandingLayout: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="landing-theme flex min-h-[100dvh] flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#085AC0] focus:text-white focus:rounded-md focus:shadow-md focus:outline-none"
      >
        {t('landing.common.skipToContent')}
      </a>
      <LandingHeader />
      <main id="main-content" tabIndex={-1} className="flex-1">
        <Outlet />
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingLayout;
