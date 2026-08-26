import React from 'react';
import { useTranslation } from 'react-i18next';
import { LandingSection } from '../../components/LandingSection';
import { SectionHeading } from '../../components/SectionHeading';
import { Reveal } from '../../components/Reveal';
import { ChaosFlowToggle } from '../../components/ChaosFlowToggle';

export const ProblemOutcomeSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <LandingSection
      id="problem"
      tone="dark"
      size="default"
      aria-labelledby="problem-title"
      className="bg-[#02040A] py-20 md:py-28"
    >
      <SectionHeading
        id="problem-title"
        tone="dark"
        eyebrow={t('landing.home.problem.eyebrow')}
        title={t('landing.home.problem.title')}
        description={t('landing.home.problem.description')}
      />

      <Reveal delay={80}>
        <ChaosFlowToggle />
      </Reveal>
    </LandingSection>
  );
};

export default ProblemOutcomeSection;
