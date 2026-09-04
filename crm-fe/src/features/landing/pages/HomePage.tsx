import React from 'react';
import { useLandingMetadata } from '../hooks/useLandingMetadata';
import { HeroSection } from '../sections/HeroSection';
import { ProofStrip } from '../sections/ProofStrip';
import { ProblemSection } from '../sections/ProblemSection';
import { CoreSolutionsSection } from '../sections/CoreSolutionsSection';
import { RoiCalculatorSection } from '../sections/RoiCalculatorSection';
import { RoleOutcomesSection } from '../sections/RoleOutcomesSection';
import { SecuritySection } from '../sections/SecuritySection';
import { PricingSection } from '../sections/PricingSection';
import { FaqSection } from '../sections/FaqSection';

export const HomePage: React.FC = () => {

  useLandingMetadata({
    title: 'VUM CRM | Quản trị bán hàng B2B và phê duyệt báo giá',
    description: 'Nền tảng CRM, CPQ và phê duyệt báo giá cho doanh nghiệp B2B Việt Nam.',
    path: '/',
  });

  return (
    <>
      <HeroSection />
      <ProofStrip />
      <ProblemSection />
      <CoreSolutionsSection />
      <RoiCalculatorSection />
      <RoleOutcomesSection />
      <SecuritySection />
      <PricingSection />
      <FaqSection />
    </>
  );
};

export default HomePage;
