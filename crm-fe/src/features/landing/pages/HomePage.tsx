import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLandingMetadata } from '../hooks/useLandingMetadata';
import { HeroSection } from '../sections/home/HeroSection';
import { ProofStrip } from '../sections/home/ProofStrip';
import { ProblemOutcomeSection } from '../sections/home/ProblemOutcomeSection';
import { CapabilityStoriesSection } from '../sections/home/CapabilityStoriesSection';
import { RoleOutcomesSection } from '../sections/home/RoleOutcomesSection';
import { TrustSection } from '../sections/home/TrustSection';
import { FinalDemoSection } from '../sections/home/FinalDemoSection';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();

  useLandingMetadata({
    title: t('landing.metadata.homeTitle'),
    description: t('landing.metadata.homeDescription'),
    path: '/',
  });

  return (
    <>
      <HeroSection />
      <ProofStrip />
      <ProblemOutcomeSection />
      <CapabilityStoriesSection />
      <RoleOutcomesSection />
      <TrustSection />
      <FinalDemoSection />
    </>
  );
};

export default HomePage;
