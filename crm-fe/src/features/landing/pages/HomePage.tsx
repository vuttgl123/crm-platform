import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLandingMetadata } from '../hooks/useLandingMetadata';
import { HeroSection } from '../sections/home/HeroSection';
import { CapabilityProofSection } from '../sections/home/CapabilityProofSection';
import { ProblemOutcomeSection } from '../sections/home/ProblemOutcomeSection';
import { ProductWorkflowSection } from '../sections/home/ProductWorkflowSection';
import { RoleOutcomesSection } from '../sections/home/RoleOutcomesSection';
import { EnterpriseTrustSection } from '../sections/home/EnterpriseTrustSection';
import { CommercialModelSection } from '../sections/home/CommercialModelSection';
import { DemoSection } from '../sections/home/DemoSection';

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
      <CapabilityProofSection />
      <ProblemOutcomeSection />
      <ProductWorkflowSection />
      <RoleOutcomesSection />
      <EnterpriseTrustSection />
      <CommercialModelSection />
      <DemoSection />
    </>
  );
};

export default HomePage;
