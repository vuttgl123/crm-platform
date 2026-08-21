import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  History,
  LockKeyhole,
  Network,
  PlugZap,
  type LucideIcon,
} from 'lucide-react';
import { LandingSection } from '../../components/LandingSection';
import { enterpriseTrustItems, type EnterpriseTrustId } from '../../content/homeContent';

const trustIcons = {
  access: LockKeyhole,
  scope: Network,
  audit: History,
  integration: PlugZap,
} satisfies Record<EnterpriseTrustId, LucideIcon>;

export const EnterpriseTrustSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <LandingSection id="solutions" aria-labelledby="trust-title" className="bg-[var(--landing-surface)]">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold text-[var(--landing-blue)]">
          {t('landing.home.trust.eyebrow')}
        </p>
        <h2 id="trust-title" className="landing-display mt-4 text-3xl font-extrabold text-[var(--landing-ink)] md:text-5xl">
          {t('landing.home.trust.title')}
        </h2>
      </header>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:gap-8">
        {enterpriseTrustItems.map((item) => {
          const Icon = trustIcons[item.id];
          return (
            <div
              key={item.id}
              className="rounded-2xl border border-[var(--landing-line)] bg-[var(--landing-canvas)] p-7 md:p-8"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-[var(--landing-line)] text-[var(--landing-blue)] shadow-xs">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </div>
              <h3 className="landing-display mt-5 text-xl font-bold text-[var(--landing-ink)]">
                {t(item.titleKey)}
              </h3>
              <p className="landing-body-copy mt-3 text-sm">
                {t(item.descriptionKey)}
              </p>
            </div>
          );
        })}
      </div>
    </LandingSection>
  );
};

export default EnterpriseTrustSection;
