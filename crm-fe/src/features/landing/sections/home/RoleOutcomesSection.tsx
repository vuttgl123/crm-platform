import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LandingSection } from '../../components/LandingSection';
import { homeRoleItems } from '../../content/homeContent';

export const RoleOutcomesSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <LandingSection id="roles" aria-labelledby="roles-title" className="bg-[var(--landing-canvas)]">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold text-[var(--landing-blue)]">
          {t('landing.home.roles.eyebrow')}
        </p>
        <h2 id="roles-title" className="landing-display mt-4 text-3xl font-extrabold text-[var(--landing-ink)] md:text-5xl">
          {t('landing.home.roles.title')}
        </h2>
      </header>
      <Tabs defaultValue="executive" className="mt-10">
        <TabsList className="grid h-auto grid-cols-1 gap-2 bg-transparent p-0 sm:grid-cols-3">
          {homeRoleItems.map((role) => (
            <TabsTrigger
              key={role.id}
              value={role.id}
              className="min-h-11 rounded-lg border border-[var(--landing-line)] bg-white text-base font-semibold data-[state=active]:border-[var(--landing-blue)] data-[state=active]:text-[var(--landing-blue)]"
            >
              {t(role.labelKey)}
            </TabsTrigger>
          ))}
        </TabsList>
        {homeRoleItems.map((role) => (
          <TabsContent
            key={role.id}
            value={role.id}
            className="mt-6 rounded-2xl border border-[var(--landing-line)] bg-white p-6 md:p-9"
          >
            <h3 className="landing-display text-2xl font-bold text-[var(--landing-ink)]">
              {t(role.titleKey)}
            </h3>
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {role.pointKeys.map((pointKey) => (
                <li
                  key={pointKey}
                  className="rounded-xl border border-[var(--landing-line)] bg-[var(--landing-canvas)] p-5 text-sm font-medium text-[var(--landing-ink)] leading-relaxed"
                >
                  {t(pointKey)}
                </li>
              ))}
            </ul>
          </TabsContent>
        ))}
      </Tabs>
    </LandingSection>
  );
};

export default RoleOutcomesSection;
