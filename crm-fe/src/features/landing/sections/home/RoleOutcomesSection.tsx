import React from 'react';
import { useTranslation } from 'react-i18next';
import { LandingSection } from '../../components/LandingSection';
import { SectionHeading } from '../../components/SectionHeading';
import { RoleOutcomeTabs } from '../../components/RoleOutcomeTabs';

export const RoleOutcomesSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <LandingSection className="bg-[#F5F8FC]">
      <SectionHeading

        title={t('landing.home.roles.title')}
        align="left"
      />
      <RoleOutcomeTabs />
    </LandingSection>
  );
};

export default RoleOutcomesSection;
