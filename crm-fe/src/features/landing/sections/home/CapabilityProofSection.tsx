import React from 'react';
import { useTranslation } from 'react-i18next';
import { LandingSection } from '../../components/LandingSection';
import { capabilityProofItems } from '../../content/homeContent';

export const CapabilityProofSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <LandingSection id="proof" className="border-y border-[var(--landing-line)] bg-[var(--landing-surface)] py-8">
      <p className="mb-5 text-sm font-semibold text-[var(--landing-muted)]">
        {t('landing.home.proof.label')}
      </p>
      <ul className="grid gap-px overflow-hidden rounded-2xl border border-[var(--landing-line)] bg-[var(--landing-line)] sm:grid-cols-2 lg:grid-cols-5">
        {capabilityProofItems.map((item) => (
          <li key={item.id} className="bg-[var(--landing-surface)] px-5 py-4 text-sm font-semibold text-[var(--landing-ink)]">
            {t(item.labelKey)}
          </li>
        ))}
      </ul>
    </LandingSection>
  );
};

export default CapabilityProofSection;
