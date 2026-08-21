import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, TrendingUp, Users, Target } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RoleOutcomeId } from '../types/landing';

export const RoleOutcomeTabs: React.FC = () => {
  const { t } = useTranslation();
  const [activeRole, setActiveRole] = useState<RoleOutcomeId>('executive');

  const roles = [
    {
      id: 'executive' as RoleOutcomeId,
      label: t('landing.home.roles.executiveLabel'),
      title: t('landing.home.roles.executiveTitle'),
      icon: TrendingUp,
      items: t('landing.home.roles.executiveItems', { returnObjects: true }) as string[],
    },
    {
      id: 'manager' as RoleOutcomeId,
      label: t('landing.home.roles.managerLabel'),
      title: t('landing.home.roles.managerTitle'),
      icon: Users,
      items: t('landing.home.roles.managerItems', { returnObjects: true }) as string[],
    },
    {
      id: 'sales' as RoleOutcomeId,
      label: t('landing.home.roles.salesLabel'),
      title: t('landing.home.roles.salesTitle'),
      icon: Target,
      items: t('landing.home.roles.salesItems', { returnObjects: true }) as string[],
    },
  ];

  return (
    <div className="bg-white border border-[#DCE5F0] rounded-2xl p-6 sm:p-8 shadow-sm">
      <Tabs
        value={activeRole}
        onValueChange={(val) => setActiveRole(val as RoleOutcomeId)}
        className="w-full"
      >
        <div className="flex justify-center mb-8">
          <TabsList className="bg-slate-100 p-1 rounded-xl h-auto flex-wrap justify-center gap-1">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <TabsTrigger
                  key={role.id}
                  value={role.id}
                  className="px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-[#085AC0] data-[state=active]:shadow-sm transition-all"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {role.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {roles.map((role) => (
          <TabsContent
            key={role.id}
            value={role.id}
            className="space-y-6 focus-visible:outline-none m-0"
          >
            <div className="text-center max-w-2xl mx-auto mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-[#07182B] landing-display">
                {role.title}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.isArray(role.items) &&
                role.items.map((item, index) => (
                  <div
                    key={index}
                    className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#085AC0] shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-[#07182B] leading-relaxed">
                        {item}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default RoleOutcomeTabs;
