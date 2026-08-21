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
      <a href="#main-content" className="landing-skip-link">
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
