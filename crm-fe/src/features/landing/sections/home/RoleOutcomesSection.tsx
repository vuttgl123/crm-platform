import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, BarChart3, Users, Target, type LucideIcon } from 'lucide-react';
import { LandingSection } from '../../components/LandingSection';
import { SectionHeading } from '../../components/SectionHeading';
import { Reveal } from '../../components/Reveal';
import { SpotlightCard } from '../../components/SpotlightCard';
import { homeRoleItems, type HomeRoleId } from '../../content/homeContent';

const roleIcons: Record<HomeRoleId, LucideIcon> = {
  executive: BarChart3,
  manager: Users,
  sales: Target,
};

export const RoleOutcomesSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <LandingSection
      id="roles"
      tone="dark"
      size="default"
      aria-labelledby="roles-title"
      className="bg-[#030712] py-20 md:py-28"
    >
      <SectionHeading
        id="roles-title"
        tone="dark"
        eyebrow={t('landing.home.roles.eyebrow')}
        title={t('landing.home.roles.title')}
      />

      <div className="grid gap-6 md:grid-cols-3">
        {homeRoleItems.map((role, index) => {
          const Icon = roleIcons[role.id];

          return (
            <Reveal key={role.id} delay={index * 80}>
              <SpotlightCard
                tone="dark"
                className="group relative flex h-full flex-col p-8 bg-slate-900/90 border-slate-800 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
              >
                {/* Top Accent Line */}
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[4px] bg-blue-950/80 text-cyan-400 border border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-transform group-hover:scale-105">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/80 px-3 py-1 rounded-[4px] border border-cyan-500/40">
                    {t(role.labelKey)}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-bold text-white tracking-tight">
                  {t(role.titleKey)}
                </h3>

                <ul className="mt-6 space-y-4 flex-1">
                  {role.pointKeys.map((pointKey) => (
                    <li key={pointKey} className="flex items-start gap-3">
                      <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                        <Check aria-hidden="true" className="h-3 w-3 stroke-[3]" />
                      </div>
                      <span className="text-sm leading-relaxed text-slate-300">
                        {t(pointKey)}
                      </span>
                    </li>
                  ))}
                </ul>
              </SpotlightCard>
            </Reveal>
          );
        })}
      </div>
    </LandingSection>
  );
};

export default RoleOutcomesSection;
