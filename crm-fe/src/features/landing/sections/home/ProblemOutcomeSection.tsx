import React from 'react';
import { useTranslation } from 'react-i18next';
import { LandingSection } from '../../components/LandingSection';

const problemItems = [
  {
    id: 'data',
    titleKey: 'landing.home.problem.beforeDataTitle',
    descriptionKey: 'landing.home.problem.beforeDataDescription',
  },
  {
    id: 'pipeline',
    titleKey: 'landing.home.problem.beforePipelineTitle',
    descriptionKey: 'landing.home.problem.beforePipelineDescription',
  },
  {
    id: 'approval',
    titleKey: 'landing.home.problem.beforeApprovalTitle',
    descriptionKey: 'landing.home.problem.beforeApprovalDescription',
  },
] as const;

export const ProblemOutcomeSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <LandingSection id="problem" aria-labelledby="problem-title" className="bg-[var(--landing-canvas)]">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold text-[var(--landing-blue)]">
          {t('landing.home.problem.eyebrow')}
        </p>
        <h2 id="problem-title" className="landing-display mt-4 text-3xl font-extrabold text-[var(--landing-ink)] md:text-5xl">
          {t('landing.home.problem.title')}
        </h2>
        <p className="landing-body-copy mt-5 text-lg">
          {t('landing.home.problem.description')}
        </p>
      </header>
      <div className="mt-12 grid gap-10 lg:grid-cols-12">
        <ol className="space-y-0 lg:col-span-7">
          {problemItems.map((item, index) => (
            <li key={item.id} className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-[var(--landing-line)] py-6">
              <span aria-hidden="true" className="font-mono text-sm font-bold text-[var(--landing-blue)]">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-lg font-bold text-[var(--landing-ink)]">
                  {t(item.titleKey)}
                </h3>
                <p className="landing-body-copy mt-2 text-sm">
                  {t(item.descriptionKey)}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <aside className="rounded-2xl border border-[var(--landing-line)] bg-[var(--landing-surface)] p-7 lg:col-span-5 flex flex-col justify-center">
          <h3 className="landing-display text-xl font-bold text-[var(--landing-ink)]">
            {t('landing.home.problem.afterTitle')}
          </h3>
          <p className="landing-body-copy mt-4 text-base">
            {t('landing.home.problem.afterDescription')}
          </p>
        </aside>
      </div>
    </LandingSection>
  );
};

export default ProblemOutcomeSection;
