import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLandingMetadata } from '../hooks/useLandingMetadata';
import { HeroSection } from '../sections/home/HeroSection';
import { FeaturesSection } from '../sections/home/FeaturesSection';
import { SocialProofSection } from '../sections/home/SocialProofSection';
import { SolutionsSection } from '../sections/home/SolutionsSection';
import { PricingSection } from '../sections/home/PricingSection';
import { DemoSection } from '../sections/home/DemoSection';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();

  useLandingMetadata({
    title: t('landing.metadata.homeTitle'),
    description: t('landing.metadata.homeDescription'),
    path: '/',
  });

  return (
    <main className="landing-theme">
      {/* 1. Hero — Grand opening + Product Cockpit */}
      <HeroSection />

      {/* 2. Bento matrix — 4 core capability pillars */}
      <FeaturesSection />

      {/* 3. Social proof — Enterprise logos + Testimonial */}
      <SocialProofSection />

      {/* 4. Solutions — 3 problem-solution cards */}
      <SolutionsSection />

      {/* 5. Pricing — Transparent scope-based model */}
      <PricingSection />

      {/* 6. Demo CTA — Dark closing section */}
      <DemoSection />
    </main>
  );
};

export default HomePage;
