import React from 'react';
import { useTranslation } from 'react-i18next';
import { LandingSection } from '../../components/LandingSection';
import { LandingProductVisual } from '../../components/LandingProductVisual';
import { homeProductAssets } from '../../content/homeProductEvidence';

export const HeroSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <LandingSection id="hero" className="overflow-hidden bg-[var(--landing-canvas)] pt-16 md:pt-24">
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <p className="mb-5 text-sm font-semibold text-[var(--landing-blue)]">
            {t('landing.home.hero.kicker')}
          </p>
          <h1 className="landing-display text-[clamp(2.75rem,5.5vw,4.75rem)] font-extrabold text-[var(--landing-ink)]">
            {t('landing.home.hero.title')}
          </h1>
          <p className="landing-body-copy mt-6 max-w-[38rem] text-lg">
            {t('landing.home.hero.description')}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#demo" className="landing-primary-action">
              {t('landing.home.hero.primaryCta')}
            </a>
            <a href="#features" className="landing-secondary-action">
              {t('landing.home.hero.secondaryCta')}
            </a>
          </div>
        </div>
        <div className="lg:col-span-7">
          <LandingProductVisual asset={homeProductAssets.hero} priority />
        </div>
      </div>
    </LandingSection>
  );
};

export default HeroSection;
